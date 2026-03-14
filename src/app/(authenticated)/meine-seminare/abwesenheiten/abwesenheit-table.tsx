'use client'

import { useTranslations } from 'next-intl'
import React from 'react'
import { twMerge } from 'tailwind-merge'
import { useSearchParams } from 'next/navigation'
import TooltipTw from '@/components/atoms/tooltip-tw'
import { TableCellTw, TableHeaderTw, TableTw, } from '@/components/molecules/table-tw'
import BadgeTw, { BadgeColor } from '@/components/atoms/badge-tw'
import { formatDate } from '@/lib/utils/date-utils'

export enum AbwesenheitsbestaetigungStatus {
  NEW = 'NEW',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
}

export interface Abwesenheit {
  id: number
  vorname: string
  nachname: string
  svNummer: string
  url: string
  startDatum: string
  endDatum: string
  createdAt: string
  status: AbwesenheitsbestaetigungStatus
  note?: string
}

export const getStatusBadge = (
  status: AbwesenheitsbestaetigungStatus,
  t: (key: string) => string,
  className = 'w-full justify-center'
) => {
  switch (status) {
    case AbwesenheitsbestaetigungStatus.NEW:
      return (
        <BadgeTw
          color={BadgeColor.Yellow}
          className={twMerge('w-full justify-center', className)}
        >
          {t(`status.${status.toLowerCase()}`)}
        </BadgeTw>
      )
    case AbwesenheitsbestaetigungStatus.APPROVED:
      return (
        <BadgeTw
          color={BadgeColor.Green}
          className={twMerge('w-full justify-center', className)}
        >
          {t(`status.${status.toLowerCase()}`)}
        </BadgeTw>
      )
    case AbwesenheitsbestaetigungStatus.DECLINED:
      return (
        <BadgeTw
          color={BadgeColor.Red}
          className={twMerge('w-full justify-center', className)}
        >
          {t(`status.${status.toLowerCase()}`)}
        </BadgeTw>
      )
    default:
      throw new Error(`Invalid status: ${status}`)
  }
}

interface AbwesenheitTableProps {
  abwesenheiten: Abwesenheit[]
  isLoading: boolean
  onView: (entry: Abwesenheit) => void
}

export const AbwesenheitTable: React.FC<AbwesenheitTableProps> = ({
  abwesenheiten,
  isLoading,
  onView,
}) => {
  const t = useTranslations('meineSeminare.abwesenheiten')
  const tCommon = useTranslations('common.label')
  const searchParams = useSearchParams()

  const sortProperty = (searchParams.get('sortProperty') ||
    'nachname') as keyof Abwesenheit
  const sortDirection = searchParams.get('sortDirection') || 'ASC'

  const sortedAbwesenheiten = React.useMemo(() => {
    const sortableAbwesenheiten = [...abwesenheiten]
    if (sortProperty) {
      sortableAbwesenheiten.sort((a, b) => {
        const abwA = a[sortProperty] ?? ''
        const abwB = b[sortProperty] ?? ''

        const comparison = String(abwA).localeCompare(String(abwB), undefined, {
          numeric: true,
          sensitivity: 'base',
        })
        return sortDirection === 'DESC' ? -comparison : comparison
      })
    }
    return sortableAbwesenheiten
  }, [abwesenheiten, sortProperty, sortDirection])

  return (
    <TableTw>
      <thead className="bg-gray-50">
        <tr>
          <TableHeaderTw sortId="nachname">{t('table.nachname')}</TableHeaderTw>
          <TableHeaderTw sortId="vorname">{t('table.vorname')}</TableHeaderTw>
          <TableHeaderTw className="text-center font-mono">
            {t('table.svnr')}
          </TableHeaderTw>
          <TableHeaderTw sortId="startDatum">
            {t('table.startDatum')}
          </TableHeaderTw>
          <TableHeaderTw sortId="endDatum">{t('table.endDatum')}</TableHeaderTw>
          <TableHeaderTw className="text-center">
            {t('table.status')}
          </TableHeaderTw>
          <TableHeaderTw className="text-center">
            {t('table.note')}
          </TableHeaderTw>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white">
        {isLoading ? (
          <tr>
            <td colSpan={7} className="p-10 text-center text-gray-400">
              {tCommon('loading')}
            </td>
          </tr>
        ) : sortedAbwesenheiten.length === 0 ? (
          <tr>
            <td colSpan={7} className="p-10 text-center text-gray-400">
              {tCommon('noEntries')}
            </td>
          </tr>
        ) : (
          sortedAbwesenheiten.map((entry) => (
            <tr
              key={entry.id}
              className="cursor-pointer transition-colors hover:bg-gray-50"
              onClick={() => onView(entry)}
            >
              <TableCellTw className="font-medium text-gray-900">
                {entry.nachname}
              </TableCellTw>
              <TableCellTw className="font-medium text-gray-900">
                {entry.vorname}
              </TableCellTw>
              <TableCellTw className="text-center font-mono">
                {entry.svNummer}
              </TableCellTw>
              <TableCellTw>
                {formatDate(new Date(entry.startDatum), 'DD.MM.YYYY')}
              </TableCellTw>
              <TableCellTw>
                {formatDate(new Date(entry.endDatum), 'DD.MM.YYYY')}
              </TableCellTw>
              <TableCellTw className="text-center">
                {getStatusBadge(entry.status, t)}
              </TableCellTw>
              <TableCellTw className="max-w-xs truncate text-center text-sm text-gray-500 italic">
                {entry.note && (
                  <TooltipTw
                    content={
                      <div className="max-w-[40vw] break-words whitespace-pre-wrap">
                        {entry.note}
                      </div>
                    }
                  >
                    {entry.note}
                  </TooltipTw>
                )}
              </TableCellTw>
            </tr>
          ))
        )}
      </tbody>
    </TableTw>
  )
}
