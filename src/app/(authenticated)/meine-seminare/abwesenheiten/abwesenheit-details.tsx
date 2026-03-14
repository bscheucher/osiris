'use client'

import { useTranslations } from 'next-intl'
import React from 'react'
import {
  Abwesenheit,
  AbwesenheitsbestaetigungStatus,
  getStatusBadge,
} from './abwesenheit-table'
import { formatDate } from '@/lib/utils/date-utils'

interface AbwesenheitDetailsProps {
  entry: Abwesenheit
}

export const AbwesenheitDetails: React.FC<AbwesenheitDetailsProps> = ({
  entry,
}) => {
  const t = useTranslations('meineSeminare.abwesenheiten')

  return (
    <div className="grid w-full grid-cols-2 gap-x-8 gap-y-4 py-4 text-sm sm:grid-cols-3">
      <div className="flex flex-col">
        <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
          {t('table.vorname')}
        </span>
        <span className="mt-1 font-medium text-gray-900">{entry.vorname}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
          {t('table.nachname')}
        </span>
        <span className="mt-1 font-medium text-gray-900">{entry.nachname}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
          {t('table.svnr')}
        </span>
        <span className="mt-1 font-mono font-medium text-gray-900">
          {entry.svNummer}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
          {t('table.startDatum')}
        </span>
        <span className="mt-1 font-medium text-gray-900">
          {formatDate(new Date(entry.startDatum), 'DD.MM.YYYY')}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
          {t('table.endDatum')}
        </span>
        <span className="mt-1 font-medium text-gray-900">
          {formatDate(new Date(entry.endDatum), 'DD.MM.YYYY')}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
          {t('table.status')}
        </span>
        <div className="mt-1 flex w-fit">
          {getStatusBadge(entry.status, t, 'w-auto')}
        </div>
      </div>
      {entry.status === AbwesenheitsbestaetigungStatus.DECLINED &&
        entry.note && (
          <div className="col-span-full flex flex-col border-t border-gray-100 pt-4">
            <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
              {t('table.note')}
            </span>
            <span className="mt-1 whitespace-pre-wrap text-gray-600 italic">
              {entry.note}
            </span>
          </div>
        )}
    </div>
  )
}
