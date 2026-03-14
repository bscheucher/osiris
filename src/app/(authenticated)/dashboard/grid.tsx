import { Dispatch, SetStateAction, useCallback, useState } from 'react'
import GridLayout, { Layout } from 'react-grid-layout'
import { HiX } from 'react-icons/hi'
import { twMerge } from 'tailwind-merge'

import { widgetComponents } from './widget'
import Loader from '@/components/atoms/loader'
import { Widget } from '@/lib/types/types'

const gridConfig = {
  tileSize: 160,
  gap: 7,
  columns: 14,
}

type DashboardGridProps = {
  isEditMode: boolean
  isLoading: boolean
  layout: Layout[]
  setLayout: Dispatch<SetStateAction<Layout[]>>
  draggedWidget: Widget | undefined
  setDraggedWidget: Dispatch<SetStateAction<Widget | undefined>>
}

// Helper function to ensure unique layout items
const getUniqueLayout = (layout: Layout[]): Layout[] => {
  const seen = new Set<string>()
  return layout.filter((item) => {
    if (seen.has(item.i)) {
      return false
    }
    seen.add(item.i)
    return true
  })
}

// Helper function to validate layout items
const validateLayout = (layout: Layout[]): Layout[] => {
  return layout.filter(
    (item) =>
      item &&
      typeof item.i === 'string' &&
      typeof item.x === 'number' &&
      typeof item.y === 'number' &&
      typeof item.w === 'number' &&
      typeof item.h === 'number' &&
      item.w > 0 &&
      item.h > 0 &&
      item.x >= 0 &&
      item.y >= 0 &&
      !isNaN(item.x) &&
      !isNaN(item.y) &&
      !isNaN(item.w) &&
      !isNaN(item.h)
  )
}

export default function DashboardGrid({
  isEditMode,
  isLoading,
  layout,
  setLayout,
  draggedWidget,
  setDraggedWidget,
}: DashboardGridProps) {
  const [droppingItem, setDroppingItem] = useState<
    { i: string; w: number; h: number } | undefined
  >(undefined)

  const handleDrop = useCallback(
    (newLayout: Layout[]) => {
      // Clear dragging state immediately
      setDraggedWidget(undefined)
      setDroppingItem(undefined)

      // Validate and clean the layout
      const validLayout = validateLayout(newLayout)
      const uniqueLayout = getUniqueLayout(validLayout)

      // Remove any dragging-related properties
      const cleanLayout = uniqueLayout.map((item) => ({
        i: item.i,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
      }))

      setLayout(cleanLayout)
    },
    [setDraggedWidget, setLayout]
  )

  const handleDropDragOver = useCallback(() => {
    if (!draggedWidget) {
      return undefined
    }

    const insertedItem = {
      i: draggedWidget.id,
      w: draggedWidget.width,
      h: draggedWidget.height,
    }

    setDroppingItem(insertedItem)
    return insertedItem
  }, [draggedWidget])

  const handleLayoutChange = useCallback(
    (newLayout: Layout[]) => {
      // Don't update layout during dragging operations
      if (droppingItem) {
        return
      }

      // Handle empty layouts properly
      if (!newLayout || newLayout.length === 0) {
        if (layout.length > 0) {
          setLayout([])
        }
        return
      }

      // Validate and clean the layout
      const validLayout = validateLayout(newLayout)
      const uniqueLayout = getUniqueLayout(validLayout)

      // Only update if the layout actually changed
      if (JSON.stringify(uniqueLayout) !== JSON.stringify(layout)) {
        setLayout(uniqueLayout)
      }
    },
    [layout, setLayout, droppingItem]
  )

  const handleRemove = useCallback(
    (id: string) => {
      const newLayout = layout.filter((item) => item.i !== id)
      const cleanLayout = getUniqueLayout(newLayout)
      setLayout(cleanLayout)
    },
    [layout, setLayout]
  )

  const generateWidgets = useCallback(() => {
    const uniqueLayout = getUniqueLayout(layout)

    return uniqueLayout
      .map((item) => {
        const WidgetComponent = widgetComponents[item.i]

        if (!WidgetComponent) {
          console.warn(`Widget component not found for ID: ${item.i}`)
          return null
        }

        return (
          <div
            className="group relative overflow-auto rounded-lg border border-gray-200 bg-white"
            key={item.i}
            role="gridcell"
          >
            <WidgetComponent />
            {isEditMode && (
              <button
                className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                onClick={() => handleRemove(item.i)}
                aria-label="Remove widget"
              >
                <HiX className="h-4 w-4" />
              </button>
            )}
          </div>
        )
      })
      .filter(Boolean)
  }, [isEditMode, layout, handleRemove])

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader />
      </div>
    )
  }

  // Don't render GridLayout with invalid layouts
  const safeLayout = validateLayout(getUniqueLayout(layout))

  return (
    <div
      className={twMerge(
        'grid-width flex-1',
        isEditMode ? 'grid-layout overflow-auto' : ''
      )}
      role="grid"
    >
      <GridLayout
        layout={safeLayout}
        style={{ minHeight: '150px' }}
        rowHeight={gridConfig.tileSize - gridConfig.gap}
        width={gridConfig.tileSize * gridConfig.columns + gridConfig.gap}
        cols={gridConfig.columns}
        margin={[gridConfig.gap, gridConfig.gap]}
        droppingItem={droppingItem}
        isResizable={false}
        isDraggable={isEditMode}
        isDroppable={isEditMode}
        onDrop={handleDrop}
        onDropDragOver={handleDropDragOver}
        onLayoutChange={handleLayoutChange}
        // Add these props to prevent collision issues
        autoSize={true}
        verticalCompact={true}
        preventCollision={false}
        compactType="vertical"
        // Prevent unnecessary re-renders
        useCSSTransforms={true}
      >
        {generateWidgets()}
      </GridLayout>
    </div>
  )
}
