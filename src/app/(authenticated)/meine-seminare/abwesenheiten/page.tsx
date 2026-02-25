'use client'

import { useTranslations } from 'next-intl'
import React, { useEffect, useMemo, useState } from 'react'

import { LayoutWrapper } from '@/components/molecules/layout-wrapper'
import {
  TableCellTw,
  TableHeaderTw,
  TableTw,
} from '@/components/molecules/table-tw'

interface AbwesenheitEntry {
  id: number
  vorname: string
  nachname: string
  sv_nummer: string
  url: string
  start_datum: string
  end_datum: string
  created_at: string
}

interface ColumnFilters {
  vorname: string
  nachname: string
  sv_nummer: string
  start_datum: string
  end_datum: string
}

export default function Page() {
  const t = useTranslations('meineSeminare.abwesenheiten')
  const [data, setData] = useState<AbwesenheitEntry[]>([])
  const [filters, setFilters] = useState<ColumnFilters>({
    vorname: '',
    nachname: '',
    sv_nummer: '',
    start_datum: '',
    end_datum: '',
  })

  useEffect(() => {
    fetch('/api/meine-seminare/abwesenheiten')
      .then((res) => res.json())
      .then((json: AbwesenheitEntry[]) => setData(json))
  }, [])

  const filteredData = useMemo(() => {
    return data.filter((entry) => {
      return (
        entry.vorname.toLowerCase().includes(filters.vorname.toLowerCase()) &&
        entry.nachname.toLowerCase().includes(filters.nachname.toLowerCase()) &&
        entry.sv_nummer
          .toLowerCase()
          .includes(filters.sv_nummer.toLowerCase()) &&
        entry.start_datum
          .toLowerCase()
          .includes(filters.start_datum.toLowerCase()) &&
        entry.end_datum.toLowerCase().includes(filters.end_datum.toLowerCase())
      )
    })
  }, [data, filters])

  const handleFilterChange =
    (field: keyof ColumnFilters) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilters((prev) => ({ ...prev, [field]: e.target.value }))
    }

  const filterInputClass =
    'w-full rounded border border-gray-300 px-2 py-1 text-xs font-normal text-gray-700 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400'

  return (
    <LayoutWrapper title={t('title')}>
      <TableTw>
        <thead className="bg-gray-50">
          <tr>
            <TableHeaderTw>{t('table.vorname')}</TableHeaderTw>
            <TableHeaderTw>{t('table.nachname')}</TableHeaderTw>
            <TableHeaderTw>{t('table.svnr')}</TableHeaderTw>
            <TableHeaderTw>{t('table.start-datum')}</TableHeaderTw>
            <TableHeaderTw>{t('table.end-datum')}</TableHeaderTw>
            <TableHeaderTw>{t('table.dokument')}</TableHeaderTw>
          </tr>
          <tr className="border-t border-gray-200 bg-white">
            <th className="px-4 py-2">
              <input
                type="text"
                value={filters.vorname}
                onChange={handleFilterChange('vorname')}
                placeholder={t('filter.placeholder.vorname')}
                className={filterInputClass}
              />
            </th>
            <th className="px-4 py-2">
              <input
                type="text"
                value={filters.nachname}
                onChange={handleFilterChange('nachname')}
                placeholder={t('filter.placeholder.nachname')}
                className={filterInputClass}
              />
            </th>
            <th className="px-4 py-2">
              <input
                type="text"
                value={filters.sv_nummer}
                onChange={handleFilterChange('sv_nummer')}
                placeholder={t('filter.placeholder.svnr')}
                className={filterInputClass}
              />
            </th>
            <th className="px-4 py-2">
              <input
                type="text"
                value={filters.start_datum}
                onChange={handleFilterChange('start_datum')}
                placeholder={t('filter.placeholder.startDatum')}
                className={filterInputClass}
              />
            </th>
            <th className="px-4 py-2">
              <input
                type="text"
                value={filters.end_datum}
                onChange={handleFilterChange('end_datum')}
                placeholder={t('filter.placeholder.endDatum')}
                className={filterInputClass}
              />
            </th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {filteredData.map((entry) => (
            <tr key={entry.id} className="hover:bg-gray-50">
              <TableCellTw className="font-medium text-gray-900">
                {entry.vorname}
              </TableCellTw>
              <TableCellTw className="font-medium text-gray-900">
                {entry.nachname}
              </TableCellTw>
              <TableCellTw className="text-center text-gray-500 tabular-nums">
                {entry.sv_nummer}
              </TableCellTw>
              <TableCellTw className="tabular-nums">
                {entry.start_datum}
              </TableCellTw>
              <TableCellTw className="tabular-nums">
                {entry.end_datum}
              </TableCellTw>
              <TableCellTw className="text-center">
                {entry.url ? (
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {t('table.dokument')}
                  </a>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </TableCellTw>
            </tr>
          ))}
        </tbody>
      </TableTw>
    </LayoutWrapper>
  )
}
