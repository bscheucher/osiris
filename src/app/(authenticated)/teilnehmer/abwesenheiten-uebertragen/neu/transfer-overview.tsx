'use client'

import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

import ButtonTw, { ButtonSize } from '@/components/atoms/button-tw'
import {
  TableCellTw,
  TableHeaderTw,
  TableTw,
} from '@/components/molecules/table-tw'
import { SeminarWithData } from '@/lib/utils/teilnehmer-utils'
import useUserStore from '@/stores/user-store'

interface Props {
  datumVon: string
  datumBis: string
  seminars: SeminarWithData[] | null
  teilnehmerNumber: number | null
  onAbort: () => void
  onSubmit: () => void
}

export default function TransferOverview({
  datumVon,
  datumBis,
  teilnehmerNumber,
  seminars,
  onAbort,
  onSubmit,
}: Props) {
  const t = useTranslations('abwesenheitenUebertragen.create')
  const { user } = useUserStore()
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="flex flex-col">
      <h2 className="mb-4 block text-2xl font-semibold tracking-tight text-gray-900">
        {t('overview')}
      </h2>
      <div className="mb-4 grid grid-cols-4 gap-x-8 gap-y-8 sm:grid-cols-4">
        <div className="col-span-4">
          <TableTw className="flex-auto">
            <tbody className="divide-y divide-gray-200">
              <tr>
                <TableCellTw>{t('detail.user')}</TableCellTw>
                <TableCellTw>{user?.fullName}</TableCellTw>
              </tr>
              <tr>
                <TableCellTw>{t('detail.timeFrame')}</TableCellTw>
                <TableCellTw>{`${dayjs(datumVon).format('DD.MM.YYYY')} - ${dayjs(datumBis).format('DD.MM.YYYY')}`}</TableCellTw>
              </tr>
              <tr>
                <TableCellTw>{t('detail.participants')}</TableCellTw>
                <TableCellTw>{teilnehmerNumber}</TableCellTw>
              </tr>
            </tbody>
          </TableTw>
        </div>
        <div className="col-span-4">
          <h3 className="mb-4 block text-lg font-semibold tracking-tight text-gray-900">
            {t('seminarName')}
          </h3>
          <TableTw className="flex-auto">
            <thead className="bg-gray-50">
              <tr>
                <TableHeaderTw>{t('detail.table.header.name')}</TableHeaderTw>
                <TableHeaderTw>{t('detail.table.header.number')}</TableHeaderTw>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {seminars
                ? seminars.map((seminar) => (
                    <tr key={seminar.id}>
                      <TableCellTw>{seminar.seminarBezeichnung}</TableCellTw>
                      <TableCellTw>{seminar.seminarNumber}</TableCellTw>
                    </tr>
                  ))
                : null}
            </tbody>
          </TableTw>
        </div>
        <div className="col-span-2">
          <ButtonTw
            type="button"
            className="h-full w-full"
            disabled={isLoading}
            isLoading={isLoading}
            onClick={() => {
              setIsLoading(true)
              onAbort()
            }}
            secondary
          >
            {t('detail.abort')}
          </ButtonTw>
        </div>
        <div className="col-span-2">
          <ButtonTw
            type="submit"
            className="h-full w-full"
            size={ButtonSize.XLarge}
            disabled={isLoading}
            isLoading={isLoading}
            onClick={() => {
              setIsLoading(true)
              onSubmit()
            }}
          >
            {t('detail.submit')}
          </ButtonTw>
        </div>
      </div>
    </div>
  )
}
