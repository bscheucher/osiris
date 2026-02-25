'use client'

import { useTranslations } from 'next-intl'
import React from 'react'

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
            <TableHeaderTw>{t('table.seminar')}</TableHeaderTw>
            <TableHeaderTw>{t('table.dokument')}</TableHeaderTw>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          <tr>
            <TableCellTw colSpan={5} className="text-center text-gray-500">
              {t('noEntries')}
            </TableCellTw>
          </tr>
        </tbody>
      </TableTw>
    </LayoutWrapper>
  )
}
