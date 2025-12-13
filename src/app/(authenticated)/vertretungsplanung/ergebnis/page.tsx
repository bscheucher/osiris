'use client'

import { PrinterIcon } from '@heroicons/react/24/outline'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

import MetaData from '../uebersicht/meta-data'
import { MITARBEITER_OPTIONS, TABLE_DATA } from '../vertretungsplanung-utils'
import ButtonTw, { ButtonSize } from '@/components/atoms/button-tw'
import LoaderTw, { LoaderSize } from '@/components/atoms/loader-tw'
import PrintComponent from '@/components/atoms/print-component'
import {
  TableCellTw,
  TableHeaderTw,
  TableTw,
} from '@/components/molecules/table-tw'

export default function Page() {
  const [isLoading, setIsLoading] = useState(false)

  const searchParams = useSearchParams()
  const t = useTranslations('vertretungsplanung')
  const printRef = React.useRef<HTMLDivElement | null>(null)

  const mitarbeiter = MITARBEITER_OPTIONS.find(
    (option) => option.key === searchParams.get('trainer')
  )

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="block text-3xl font-semibold tracking-tight text-gray-900">
          {t('labels.vertretungsplanungErgebnis')}
        </h1>
      </div>
      <div className="relative rounded-lg bg-white p-8 shadow">
        {isLoading ? (
          <div className="flex h-[600px] items-center justify-center">
            <LoaderTw size={LoaderSize.XLarge} />
          </div>
        ) : (
          <div ref={printRef} className="flex flex-col gap-8">
            <div className="flex items-start justify-between border-b border-gray-200 pb-4">
              <div>
                <MetaData
                  abwesendVon={searchParams.get('abwesendVon') || ''}
                  abwesendBis={searchParams.get('abwesendBis') || ''}
                  grund={searchParams.get('grund') || ''}
                  mitarbeiterLabel={mitarbeiter?.label || ''}
                />
              </div>
              <PrintComponent contentRef={printRef}>
                <PrinterIcon className="size-5" />
              </PrintComponent>
            </div>
            <div className="flex">
              <TableTw className="flex-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <TableHeaderTw>{t('table.datum')}</TableHeaderTw>
                    <TableHeaderTw>{t('table.uhrzeit')}</TableHeaderTw>
                    <TableHeaderTw>{t('table.seminar')}</TableHeaderTw>
                    <TableHeaderTw>{t('table.vertretung')}</TableHeaderTw>
                    <TableHeaderTw>{t('table.tel')}</TableHeaderTw>
                    <TableHeaderTw>{t('table.email')}</TableHeaderTw>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {TABLE_DATA.map((entry, index) => (
                    <tr key={index}>
                      <TableCellTw>{entry.datum}</TableCellTw>
                      <TableCellTw>{entry.uhrzeit}</TableCellTw>
                      <TableCellTw>{entry.seminar}</TableCellTw>
                      <TableCellTw>{entry.vertretung}</TableCellTw>
                      <TableCellTw>{entry.tel}</TableCellTw>
                      <TableCellTw>{entry.email}</TableCellTw>
                    </tr>
                  ))}
                </tbody>
              </TableTw>
            </div>
            <div className="flex items-center justify-center">
              <ButtonTw href="/vertretungsplanung" size={ButtonSize.Large}>
                {t('labels.neueVertretung')}
              </ButtonTw>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
