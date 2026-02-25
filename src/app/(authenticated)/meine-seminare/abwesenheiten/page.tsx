'use client'

import { useTranslations } from 'next-intl'
import React, { useEffect, useState } from 'react'

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

export default function Page() {
  const t = useTranslations('meineSeminare.abwesenheiten')
  const [data, setData] = useState<AbwesenheitEntry[]>([])

  useEffect(() => {
    fetch('/api/meine-seminare/abwesenheiten')
      .then((res) => res.json())
      .then((json: AbwesenheitEntry[]) => setData(json))
  }, [])

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
        </thead>
        <tbody className="divide-y divide-gray-200">
        {data.map((entry) => (
          <tr key={entry.id}>
            <TableCellTw>{entry.vorname}</TableCellTw>
            <TableCellTw>{entry.nachname}</TableCellTw>
            <TableCellTw className="text-center text-gray-500">{entry.sv_nummer}</TableCellTw>
            <TableCellTw>{entry.start_datum}</TableCellTw>
            <TableCellTw>{entry.end_datum}</TableCellTw>
            <TableCellTw className="text-center">
              <a
                href={entry.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {t('table.dokument')}
              </a>
            </TableCellTw>
          </tr>
          ))}
        </tbody>
      </TableTw>
    </LayoutWrapper>
  )
}
