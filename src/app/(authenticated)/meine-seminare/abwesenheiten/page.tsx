'use client'

import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

import { LayoutWrapper } from '@/components/molecules/layout-wrapper'
import {
  TableCellTw,
  TableHeaderTw,
  TableTw,
} from '@/components/molecules/table-tw'
import useAsyncEffect from '@/hooks/use-async-effect'
import { getUser } from '@/lib/utils/api-utils'
import { executeGET } from '@/lib/utils/gateway-utils'
import { showError } from '@/lib/utils/toast-utils'

interface AbwesenheitEntry {
  id: number
  vorname: string
  nachname: string
  sv_nummer: string
  url: string
}

export default function Page() {
  const t = useTranslations('meineSeminare.abwesenheiten')
  const [data, setData] = useState<AbwesenheitEntry[]>([])

  useAsyncEffect(async () => {
    try {
      const user = await getUser()
      if (!user?.azureId) return

      const { data } = await executeGET<AbwesenheitEntry[]>(
        `/tn-document/abwesenheiten?azureId=${user.azureId}`
      )

      if (data) {
        setData(data)
      }
    } catch (error) {
      showError(t('error.laden'))
    }
  }, [])

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
        {data.map((entry) => (
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
