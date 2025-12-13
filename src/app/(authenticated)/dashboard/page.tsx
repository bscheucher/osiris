'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState, useCallback } from 'react'
import { Layout } from 'react-grid-layout'

import 'react-grid-layout/css/styles.css'

import DashboardGrid from './grid'
import DashboardToolbar from './toolbar'
import WidgetList from './widget-list'
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

  const fetchDashboards = useCallback(async () => {
    setIsLoadingDashboard(true)
    try {
      const response = await getAllDashboards()
      setDashboardsData(response)

      const favoriteDashboard = response.dashboards.find(
        (dashboard: DashboardData) =>
          dashboard.dashboardId === response.favouriteDashboard
      )

      if (favoriteDashboard) {
        const favoriteLayout = createLayoutFromWidgets(
          favoriteDashboard.widgets
        )
        setLayout(favoriteLayout)
        setSelectedDashboardName(favoriteDashboard.dashboardName)
        setSelectedDashboardId(favoriteDashboard.dashboardId as number)
      }

      const names = response.dashboards.map((d: any) => d.dashboardName)
      setDashboardNames(names)
    } catch (error) {
      showErrorMessage(error)
    } finally {
      setIsLoadingDashboard(false)
    }
  }, [createLayoutFromWidgets])

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

      await saveDashboardData(saveDashboardRequest)
      showSuccess(
        (!selectedDashboardId ? t('message.success.savePrefix') + ' ' : '') +
          t('message.success.save')
      )
      await fetchDashboards()
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
      (d) => d.dashboardName === selectedName
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

      setDashboardsData((prevData) => {
        if (!prevData) return prevData
        return {
          ...prevData,
          favouriteDashboard: favId,
          dashboards: prevData.dashboards || [],
        }
      })
    } catch (error) {
      console.error('Error setting favorite dashboard:', error)
    } finally {
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

      if (!dashboardsData) {
        return
      }

      const updatedDashboards = dashboardsData.dashboards.filter(
        (dashboard) => dashboard.dashboardId !== selectedDashboardId
      )

      if (updatedDashboards.length === 0) {
        setSelectedDashboardId(null)
        setSelectedDashboardName('')
        setLayout([])
      } else {
        const firstDashboard = updatedDashboards[0]
        setSelectedDashboardId(firstDashboard.dashboardId as number)
        handleDashboardSelect(firstDashboard.dashboardName)
        await handleFavouriteDashboard(firstDashboard.dashboardId as number)
      }

      await fetchDashboards()
    } catch (error) {
      console.error('Error deleting dashboard:', error)
    } finally {
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
