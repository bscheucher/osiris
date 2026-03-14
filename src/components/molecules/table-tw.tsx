import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid'
import { useSearchParams } from 'next/navigation'
import React, { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

import { useUpdateUrlSearchParams } from '@/hooks/use-update-url-search-params'

type TableProps = {
  children: ReactNode
  className?: string
  testId?: string
}

export const TableTw: React.FC<TableProps> = ({
  children,
  className,
  testId,
}) => {
  return (
    <div
      className={twMerge(
        'overflow-auto rounded-md shadow ring-1 ring-black/5',
        className
      )}
    >
      <table
        className="min-w-full divide-y divide-gray-300"
        data-testid={testId}
      >
        {children}
      </table>
    </div>
  )
}

type TableHeaderProps = {
  children: ReactNode
  className?: string
  sortId?: string
}

export const TableHeaderTw: React.FC<TableHeaderProps> = ({
  children,
  className,
  sortId,
}) => {
  const searchParams = useSearchParams()
  const sortProperty = searchParams.get('sortProperty')
  const sortDirection = searchParams.get('sortDirection')
  const updateSearchParams = useUpdateUrlSearchParams()
  const isActive = sortId === sortProperty

  const sortHandler = () => {
    if (sortId) {
      if (!sortDirection) {
        updateSearchParams({ sortProperty: sortId, sortDirection: 'ASC' })
      } else if (sortDirection === 'ASC') {
        updateSearchParams({ sortProperty: sortId, sortDirection: 'DESC' })
      } else {
        updateSearchParams({ sortProperty: '', sortDirection: '' })
      }
    }
  }

  return (
    <th
      scope="col"
      className={twMerge(
        `px-4 py-3 text-left text-sm font-bold text-gray-900`,
        className
      )}
    >
      <div
        className={twMerge(`group inline-flex`, sortId ? 'cursor-pointer' : '')}
        onClick={sortHandler}
      >
        {children}
        <span
          className={twMerge(
            `invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible hover:visible hover:bg-gray-100`,
            isActive
              ? 'visible bg-gray-100 text-gray-900 group-hover:bg-gray-200'
              : ''
          )}
        >
          {sortId ? (
            sortDirection === 'DESC' ? (
              <ChevronUpIcon aria-hidden="true" className="h-5 w-5" />
            ) : (
              <ChevronDownIcon aria-hidden="true" className="h-5 w-5" />
            )
          ) : null}
        </span>
      </div>
    </th>
  )
}

type TableCellProps = {
  children: ReactNode
  className?: string
  id?: string
  testId?: string
}

export const TableCellTw: React.FC<TableCellProps> = ({
  children,
  className,
  id,
  testId,
}) => {
  return (
    <td
      className={twMerge(`px-4 py-3 text-sm text-gray-500`, className)}
      id={id}
      data-testid={testId}
    >
      {children}
    </td>
  )
}
