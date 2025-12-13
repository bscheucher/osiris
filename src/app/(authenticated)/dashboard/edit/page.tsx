'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState, useCallback } from 'react'
import { Layout } from 'react-grid-layout'

import 'react-grid-layout/css/styles.css'

import DashboardGrid from '../grid'
import DashboardToolbar from '../toolbar'
import WidgetList from '../widget-list'
import {
  DashboardData,
  DashboardResponse,
} from '@/lib/interfaces/dashboardsData'
import { WidgetStructure } from '@/lib/interfaces/widgetStructure'
import { Widget } from '@/lib/types/types'
import {
  createSaveDashboardRequest,
  deleteDashboardData,
  getAllDashboards,
  saveDashboardData,
  setFavouriteDashboard,
} from '@/lib/utils/dashboard-utils'
import {
  showError,
  showErrorMessage,
  showSuccess,
} from '@/lib/utils/toast-utils'
import { createLayout, WIDGET_DATA } from '@/lib/utils/widget-utils'

export type DashboardConfig = Record<Widget['id'], { x: number; y: number }>

export default function Page() {
  const t = useTranslations('dashboard')
  const [isEditMode, setIsEditMode] = useState(false)
  const [layout, setLayout] = useState<Layout[]>([])
  const [draggedWidget, setDraggedWidget] = useState<Widget | undefined>(
    undefined
  )

  const widgets = { data: WIDGET_DATA }

  const [dashboardNames, setDashboardNames] = useState<string[]>([])
  const [dashboardsData, setDashboardsData] = useState<
    DashboardResponse | undefined
  >()
  const [selectedDashboardId, setSelectedDashboardId] = useState<number | null>(
    null
  )
  const [selectedDashboardName, setSelectedDashboardName] = useState<string>('')
  const [editableDashboardName, setEditableDashboardName] = useState<string>('')
  const [tempDashboardId, setTempDashboardId] = useState<number | null>(null)
  const [originalLayout, setOriginalLayout] = useState<Layout[]>([])
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true)

  // Helper function to create layout from widgets
  const createLayoutFromWidgets = useCallback(
    (widgetsList: any[]) => {
      return widgetsList
        .map((widget) => {
          const widgetConfig = widgets.data.find(
            (w: WidgetStructure) => w.id === widget.id.toString()
          )
          if (!widgetConfig) {
            console.warn(
              `Widget configuration not found for widget ID: ${widget.id}`
            )
            return null
          }
          return createLayout(widget, widgetConfig as WidgetStructure)
        })
        .filter((layoutItem): layoutItem is Layout => layoutItem !== null)
    },
    [widgets.data]
  )

  const fetchDashboards = useCallback(
    async (selectDashboardId?: number | null) => {
      setIsLoadingDashboard(true)
      try {
        const response = await getAllDashboards()
        setDashboardsData(response)

        const names = response.dashboards.map((d: any) => d.dashboardName)
        setDashboardNames(names)

        // Determine which dashboard to select
        let dashboardToSelect: DashboardData | undefined

        if (selectDashboardId === null) {
          // Explicitly don't select any dashboard (e.g., after deleting last dashboard)
          setSelectedDashboardId(null)
          setSelectedDashboardName('')
          setLayout([])
          return
        } else if (selectDashboardId !== undefined) {
          // Select the specified dashboard if it exists
          dashboardToSelect = response.dashboards.find(
            (dashboard: DashboardData) =>
              dashboard.dashboardId === selectDashboardId
          )
        } else {
          // Default behavior: select the favourite dashboard
          dashboardToSelect = response.dashboards.find(
            (dashboard: DashboardData) =>
              dashboard.dashboardId === response.favouriteDashboard
          )
        }

        if (dashboardToSelect) {
          const newLayout = createLayoutFromWidgets(dashboardToSelect.widgets)
          setLayout(newLayout)
          setSelectedDashboardName(dashboardToSelect.dashboardName)
          setSelectedDashboardId(dashboardToSelect.dashboardId as number)
        }
      } catch (error) {
        showErrorMessage(error)
      } finally {
        setIsLoadingDashboard(false)
      }
    },
    [createLayoutFromWidgets]
  )

  useEffect(() => {
    fetchDashboards()
  }, [fetchDashboards])

  const saveDashboard = async () => {
    setIsLoadingDashboard(true)
    try {
      let message = ''
      if (layout.length === 0) {
        message = t('message.error.leer')
      }
      if (editableDashboardName.trim() === '') {
        message = t('message.error.nameLeer')
      }
      if (
        dashboardNames.includes(editableDashboardName) &&
        (selectedDashboardName !== editableDashboardName ||
          selectedDashboardId == null)
      ) {
        message = t('message.error.nameExistiertBereits')
      }
      if (message.length > 0) {
        showError(message)
        return
      }

      const widgetsData = layout.map((item) => ({
        id: parseInt(item.i),
        positionX: item.x,
        positionY: item.y,
      }))

      let dashboardName: string
      if (editableDashboardName !== selectedDashboardName) {
        dashboardName = editableDashboardName
      } else {
        dashboardName = selectedDashboardName
      }

      const isFavourite =
        dashboardsData?.favouriteDashboard === selectedDashboardId
      const saveDashboardRequest = createSaveDashboardRequest(
        dashboardName,
        widgetsData,
        isFavourite,
        selectedDashboardId ?? undefined
      )

      const isCreatingNew = selectedDashboardId == null

      await saveDashboardData(saveDashboardRequest)
      showSuccess(
        (!selectedDashboardId ? t('message.success.savePrefix') + ' ' : '') +
          t('message.success.save')
      )

      // Fetch dashboards to get updated data
      const response = await getAllDashboards()
      setDashboardsData(response)

      // Update dashboard names list
      const names = response.dashboards.map((d: DashboardData) => d.dashboardName)
      setDashboardNames(names)

      // Select the dashboard:
      // - If creating new: select the one with highest ID (most recently created)
      // - If editing existing: select by current ID
      let dashboardToSelect: DashboardData | undefined

      if (isCreatingNew && response.dashboards.length > 0) {
        // For new dashboards, select the one with the highest ID
        dashboardToSelect = response.dashboards.reduce((max, current) => {
          const maxId = (max.dashboardId ?? 0) as number
          const currentId = (current.dashboardId ?? 0) as number
          return currentId > maxId ? current : max
        })
        console.log('Save: Created new dashboard, selecting highest ID:', dashboardToSelect.dashboardId)
      } else if (!isCreatingNew) {
        // For existing dashboards, find by ID
        dashboardToSelect = response.dashboards.find(
          (d: DashboardData) => d.dashboardId === selectedDashboardId
        )
        console.log('Save: Updated existing dashboard ID:', selectedDashboardId)
      }

      // Apply the selection
      if (dashboardToSelect) {
        const newLayout = createLayoutFromWidgets(dashboardToSelect.widgets)
        setLayout(newLayout)
        setSelectedDashboardName(dashboardToSelect.dashboardName)
        setSelectedDashboardId(dashboardToSelect.dashboardId as number)
        console.log('Save: Selected - Name:', dashboardToSelect.dashboardName, 'ID:', dashboardToSelect.dashboardId)
      } else {
        console.warn('Save: No dashboard to select')
        setSelectedDashboardName('')
        setSelectedDashboardId(null)
        setLayout([])
      }

      setIsEditMode(false)
      setEditableDashboardName('')
    } catch (error) {
      showErrorMessage(error)
    } finally {
      setIsLoadingDashboard(false)
    }
  }

  const handleDashboardSelect = (selectedName: string) => {
    if (!dashboardsData) {
      console.error('No dashboard data available')
      return
    }

    const selectedDashboard = dashboardsData.dashboards?.find(
      (d: DashboardData) => d.dashboardName === selectedName
    )

    if (selectedDashboard) {
      const newLayout = createLayoutFromWidgets(selectedDashboard.widgets)
      setLayout(newLayout)
      setSelectedDashboardId(selectedDashboard.dashboardId ?? null)
      setSelectedDashboardName(selectedName)
      setEditableDashboardName(selectedName)
    }
  }

  const handleEditMode = () => {
    setOriginalLayout([...layout]) // Create a copy
    setTempDashboardId(selectedDashboardId)
    setEditableDashboardName(selectedDashboardName)
    setIsEditMode(true)
  }

  const handleCancelEdit = () => {
    setLayout([...originalLayout]) // Create a copy
    setIsEditMode(false)
    setEditableDashboardName('')
    setSelectedDashboardId(tempDashboardId)
  }

  const handleCreateDashboard = async () => {
    setOriginalLayout([...layout]) // Create a copy
    setIsEditMode(true)
    setTempDashboardId(selectedDashboardId)
    setSelectedDashboardId(null)
    setEditableDashboardName('')
    setLayout([]) // Set to empty array for new dashboard
  }

  const handleFavouriteDashboard = async (favId = selectedDashboardId) => {
    if (!favId) return

    setIsLoadingDashboard(true)
    try {
      await setFavouriteDashboard(favId as number)
      showSuccess(t('favouriteDashboard.message.success.saved'))

      // Refresh dashboard list while keeping current selection
      await fetchDashboards(selectedDashboardId)
    } catch (error) {
      console.error('Error setting favorite dashboard:', error)
      setIsLoadingDashboard(false)
    }
  }

  const handleDeleteDashboard = async () => {
    if (!selectedDashboardId) {
      console.error('No dashboard selected or session unavailable')
      return
    }

    const confirmDeletion = confirm(
      'Sind Sie sicher dass sie dieses Dashboard löschen wollen?'
    )

    if (!confirmDeletion) {
      return
    }

    setIsLoadingDashboard(true)

    try {
      await deleteDashboardData(selectedDashboardId)
      showSuccess(t('delete.message.success.deleted'))

      // Fetch updated dashboard list
      const response = await getAllDashboards()

      if (response.dashboards.length === 0) {
        // No dashboards remaining - clear selection
        await fetchDashboards(null)
      } else {
        // Select the first remaining dashboard
        const firstDashboard = response.dashboards[0]
        await fetchDashboards(firstDashboard.dashboardId as number)
      }
    } catch (error) {
      console.error('Error deleting dashboard:', error)
      setIsLoadingDashboard(false)
    }
  }

  return (
    <div className="flex flex-1 gap-4">
      <div className="flex flex-1 flex-col" data-testid="div">
        <DashboardToolbar
          isEditMode={isEditMode}
          isLoading={isLoadingDashboard}
          toggleEditMode={handleEditMode}
          handleFavouriteDashboard={() => handleFavouriteDashboard()}
          saveDashboard={saveDashboard}
          cancelEdit={handleCancelEdit}
          createDashboard={handleCreateDashboard}
          deleteDashboard={handleDeleteDashboard}
          dashboardNames={dashboardNames}
          onDashboardSelect={handleDashboardSelect}
          selectedDashboardName={selectedDashboardName}
          selectedDashboardId={selectedDashboardId as number}
          dashboardsData={dashboardsData as DashboardResponse}
          editableDashboardName={editableDashboardName}
          setEditableDashboardName={setEditableDashboardName}
        />
        <DashboardGrid
          isEditMode={isEditMode}
          isLoading={isLoadingDashboard}
          layout={layout}
          setLayout={setLayout}
          draggedWidget={draggedWidget}
          setDraggedWidget={setDraggedWidget}
        />
      </div>
      {isEditMode && widgets.data && (
        <WidgetList
          widgets={widgets.data}
          layout={layout}
          setDraggedWidget={setDraggedWidget}
        />
      )}
    </div>
  )
}
