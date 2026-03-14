import React, { useState } from 'react'
import { twMerge } from 'tailwind-merge'

export interface GridItemProps {
  id: string
  title: string
  description?: string
  icon?: React.ReactNode
  selected?: boolean
}
export interface GridListProps {
  className?: string
  testId?: string
  items: GridItemProps[]
  onSelect?: (selectedId: string) => void
}

const GridListTw: React.FC<GridListProps> = ({
  className,
  testId,
  items,
  onSelect,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const handleItemClick = (itemId: string) => {
    setSelectedId(itemId)
    if (onSelect) {
      onSelect(itemId)
    }
  }

  return (
    <div className="overflow-x-auto" data-testid={testId}>
      <div
        className={twMerge(
          'flex flex-col flex-wrap gap-4 sm:flex-row',
          className
        )}
      >
        {items.map((item) => (
          <div
            key={item.id}
            data-testid={`${testId}-${item.id}`}
            onClick={() => handleItemClick(item.id)}
            className={twMerge(
              'relative m-1 flex cursor-pointer items-center space-x-3 rounded-lg border border-gray-300 bg-gray-50 px-6 py-5 shadow-sm sm:w-[calc(50%-1rem)]',
              selectedId === item.id && 'ring-ibis-blue ring-2'
            )}
          >
            <div className="flex-shrink-0">
              {item.icon && <div>{item.icon}</div>}
            </div>
            <div className="min-w-0 flex-1">
              <div className="focus:outline-none">
                <span className="absolute inset-0" />
                <p className="text-sm font-medium break-words text-gray-700">
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-sm text-gray-500">{item.description}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

GridListTw.displayName = 'GridListTw'

export default GridListTw
