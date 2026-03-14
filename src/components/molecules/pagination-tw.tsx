import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/24/outline'
import { useSearchParams } from 'next/navigation'
import React from 'react'
import { twMerge } from 'tailwind-merge'

import ButtonTw from '@/components/atoms/button-tw'
import { useUpdateUrlSearchParams } from '@/hooks/use-update-url-search-params'

type PaginationProps = {
  pageSize: number
  totalResults: number
  className?: string
}

export default function PaginationSimpleTw({
  pageSize,
  totalResults,
  className,
}: PaginationProps) {
  const searchParams = useSearchParams()
  const updateSearchParams = useUpdateUrlSearchParams()

  const currentPage = searchParams.get('page')
    ? parseInt(searchParams.get('page') as string)
    : 1

  const totalPages = Math.ceil(totalResults / pageSize)
  const startEntry = (currentPage - 1) * pageSize + 1
  const endEntry = Math.min(currentPage * pageSize, totalResults)

  return (
    <nav
      aria-label="Pagination"
      className={twMerge(
        'flex items-center justify-between border-t border-gray-200 bg-white py-4',
        className
      )}
    >
      <div className="hidden sm:block">
        <p className="text-sm text-gray-700">
          Eintrag <span className="font-medium">{startEntry}</span> bis{' '}
          <span className="font-medium">{endEntry}</span> von{' '}
          <span className="font-medium">{totalResults}</span> Ergebnissen
        </p>
      </div>
      <div className="flex flex-1 justify-between gap-4 sm:justify-end">
        <ButtonTw
          onClick={() => {
            if (currentPage > 1) {
              updateSearchParams({ page: 1 })
            }
          }}
          disabled={currentPage === 1 || !totalResults}
          className="bg-white text-gray-800 ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
        >
          <ChevronDoubleLeftIcon className="h-6 w-6" title={`Anfang`} />
        </ButtonTw>
        <ButtonTw
          onClick={() => {
            if (currentPage > 1) {
              updateSearchParams({ page: currentPage - 1 })
            }
          }}
          disabled={currentPage === 1 || !totalResults}
          className="bg-white text-gray-800 ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
        >
          Zurück
        </ButtonTw>
        <ButtonTw
          onClick={() => {
            if (currentPage < totalPages) {
              updateSearchParams({ page: currentPage + 1 })
            }
          }}
          disabled={currentPage === totalPages || !totalResults}
          className="bg-white text-gray-800 ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
        >
          Weiter
        </ButtonTw>
        <ButtonTw
          onClick={() => {
            if (currentPage < totalPages) {
              updateSearchParams({ page: totalPages })
            }
          }}
          disabled={currentPage === totalPages || !totalResults}
          className="bg-white text-gray-800 ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
        >
          <ChevronDoubleRightIcon className="h-6 w-6" title={`Ende`} />
        </ButtonTw>
      </div>
    </nav>
  )
}
