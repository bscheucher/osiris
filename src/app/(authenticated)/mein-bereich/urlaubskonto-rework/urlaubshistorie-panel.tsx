'use client'

import dayjs from 'dayjs'
import {useTranslations} from 'next-intl'
import {useState} from 'react'

import {HistoricalAbwesenheit} from './types'
import {TableCellTw, TableHeaderTw, TableTw} from '@/components/molecules/table-tw'

const HEADER_CLASS = 'text-[11px] uppercase tracking-[0.7px] text-gray-400'

interface UrlaubshistoriePanelProps {
  historicalAbwesenheiten: HistoricalAbwesenheit[]
}

export function UrlaubshistoriePanel({historicalAbwesenheiten}: UrlaubshistoriePanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const t = useTranslations('urlaubsKonto.rework.historie')

  return (
    <div className="mt-6">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-50 hover:text-gray-800"
      >
        <span>🕘</span>
        <span>{isOpen ? t('ausblenden') : t('anzeigen')}</span>
        <span
          className="ml-1 transition-transform duration-200"
          style={{display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}}
        >
          ▾
        </span>
      </button>

      {isOpen && (
        <div className="mt-3">
          <div className="mb-2 flex items-center gap-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.6px] text-gray-500 whitespace-nowrap">
              {t('heading')}
            </h2>
            <div className="h-px flex-1 bg-gray-200" />
            <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold text-gray-500 whitespace-nowrap">
              {t('vergangeneUrlaubsjahre')}
            </span>
          </div>
          {historicalAbwesenheiten.length === 0 ? (
            <p className="text-sm text-gray-400">{t('emptyState')}</p>
          ) : (
            <TableTw>
              <thead className="bg-gray-50">
                <tr>
                  <TableHeaderTw className={HEADER_CLASS}>{t('table.erstellt')}</TableHeaderTw>
                  <TableHeaderTw className={HEADER_CLASS}>{t('table.zeitraum')}</TableHeaderTw>
                  <TableHeaderTw className={HEADER_CLASS}>{t('table.dauerUrlaubstage')}</TableHeaderTw>
                  <TableHeaderTw className={HEADER_CLASS}>{t('table.kommentarMitarbeiter')}</TableHeaderTw>
                  <TableHeaderTw className={HEADER_CLASS}>{t('table.kommentarFuehrungskraft')}</TableHeaderTw>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[...historicalAbwesenheiten].sort((a, b) => a.startDate.localeCompare(b.startDate)).map((a, index) => (
                  <tr key={index} className="border-l-[3px] border-l-gray-300">
                    <TableCellTw>
                      {dayjs(a.createdAt).format('DD.MM.YYYY HH:mm')}
                    </TableCellTw>
                    <TableCellTw>
                      {dayjs(a.startDate).format('DD.MM.YYYY')} – {dayjs(a.endDate).format('DD.MM.YYYY')}
                    </TableCellTw>
                    <TableCellTw>{a.durationInDays}</TableCellTw>
                    <TableCellTw>
                      <span className="text-xs">{a.comment}</span>
                    </TableCellTw>
                    <TableCellTw>
                      <span className="text-xs">{a.commentFuehrungskraft}</span>
                    </TableCellTw>
                  </tr>
                ))}
              </tbody>
            </TableTw>
          )}
        </div>
      )}
    </div>
  )
}
