'use client'

import { useTranslations } from 'next-intl'
import React from 'react'
import dummyData from '../dummy-data/dummy-data.json'

import { LayoutWrapper } from '@/components/molecules/layout-wrapper'
import {
  TableCellTw,
  TableHeaderTw,
  TableTw,
} from '@/components/molecules/table-tw'



export default function Page() {
  const t = useTranslations('meineSeminare.abwesenheiten')

  return (
    <LayoutWrapper title={t('title')}>
      <TableTw>
        <thead className="bg-gray-50">
        <tr>
          <TableHeaderTw>{t('table.vorname')}</TableHeaderTw>
          <TableHeaderTw>{t('table.nachname')}</TableHeaderTw>
          <TableHeaderTw>{t('table.svnr')}</TableHeaderTw>
          <TableHeaderTw>{t('table.dokument')}</TableHeaderTw>
        </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
        {dummyData.map((entry) => (
          <tr key={entry.id}>
            <TableCellTw>{entry.vorname}</TableCellTw>
            <TableCellTw>{entry.nachname}</TableCellTw>
            <TableCellTw className="text-center text-gray-500">{entry.sv_nummer}</TableCellTw>
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
