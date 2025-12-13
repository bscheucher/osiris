'use client'

import { XMarkIcon } from '@heroicons/react/16/solid'
import { ArrowDownTrayIcon, ArrowPathIcon } from '@heroicons/react/20/solid'
import dayjs from 'dayjs'
import 'dayjs/locale/de'
import localeData from 'dayjs/plugin/localeData'
import weekday from 'dayjs/plugin/weekday'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useCallback, useState } from 'react'

import {
  TimeslotEntry,
  ZeitbuchungMetadata,
  getEntriesForDate,
} from '../meine-zeiten-utils'
import CompactCalendar from './compact-calendar'
import MonthYearFilter from './month-year-filter'
import ButtonTw, { ButtonSize } from '@/components/atoms/button-tw'
import LoaderTw, { LoaderSize } from '@/components/atoms/loader-tw'
import InfoSectionTw from '@/components/molecules/info-section-tw'
import {
  TableCellTw,
  TableHeaderTw,
  TableTw,
} from '@/components/molecules/table-tw'
import useAsyncEffect from '@/hooks/use-async-effect'
import { executeGET, fetchGatewayRaw } from '@/lib/utils/gateway-utils'
import { downloadFileFromStream } from '@/lib/utils/object-utils'
import { showError, showErrorMessage } from '@/lib/utils/toast-utils'

dayjs.extend(weekday)
dayjs.extend(localeData)

dayjs.locale('de')

const ZeitnachweisButton = ({ currentMonth }: { currentMonth: string }) => {
  const [isLoading, setIsLoading] = useState(false)
  const t = useTranslations('meineZeiten')

  const downloadZeitnachweis = async () => {
    const currentMonthFormatted = dayjs(currentMonth).format('YYYY-MM-DD')

    try {
      setIsLoading(true)
      const response = await fetchGatewayRaw(
        `/mitarbeiter/downloadZeitnachweis?date=${currentMonthFormatted}`
      )
      if (response.status === 404) {
        throw new Error(t('error.keinNachweis'))
      } else if (!response.ok) {
        throw new Error(t('error.fehlgeschlagen'))
      }
      downloadFileFromStream(response)
    } catch (error: any) {
      showErrorMessage(error)
      // eslint-disable-next-line no-console
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ButtonTw
      className="flex items-center justify-end gap-2 whitespace-nowrap"
      size={ButtonSize.Large}
      onClick={downloadZeitnachweis}
      disabled={isLoading}
    >
      {isLoading ? (
        <LoaderTw className="h-6 w-6" />
      ) : (
        <ArrowDownTrayIcon className="h-6 w-6" />
      )}

      {t('label.zeitnachweisHerunterladen')}
    </ButtonTw>
  )
}

export default function Page() {
  const t = useTranslations('meineZeiten')
  const { date: currentMonth } = useParams()

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [metaData, setMetaData] = useState<ZeitbuchungMetadata | null>(null)
  const [timeslotEntries, setTimeslotEntries] = useState<TimeslotEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const selectedEntries = selectedDate
    ? getEntriesForDate(timeslotEntries, selectedDate)
    : []

  const getVonBisDisplayFromEntry = (entry: TimeslotEntry) =>
    entry.taetigkeit === 'Urlaub' ||
    (entry.taetigkeit === 'Zeitausgleich' && entry.von === '00:00:00')
      ? t('label.ganztags')
      : `${entry.von ?? ''} - ${entry.bis ?? ''}`

  const fetchZeitbuchungenList = useCallback(
    async (shouldSync = false) => {
      setIsLoading(true)
      const currentMonthFormatted = dayjs(currentMonth as string).format(
        'YYYY-MM-DD'
      )
      const nextMonthFormatted = dayjs(currentMonth as string)
        .add(1, 'month')
        .endOf('month')
        .format('YYYY-MM-DD')
      try {
        const response = await executeGET<{
          zeitbuchungen: TimeslotEntry[]
          zeitbuchungMetadata: ZeitbuchungMetadata[]
        }>(
          `/zeiterfassung/zeitbuchungen/list?startDate=${currentMonthFormatted}&endDate=${nextMonthFormatted}&shouldSync=${shouldSync}`
        )

        if (response.success) {
          if (response.data?.zeitbuchungen) {
            setTimeslotEntries(response.data.zeitbuchungen)
          }
          if (response.data?.zeitbuchungMetadata) {
            setMetaData(response.data.zeitbuchungMetadata[0])
          }
        } else {
          showError(t('label.loadingError'))
        }
      } catch (e: any) {
        showError(e.message)
        // eslint-disable-next-line no-console
        console.error(e)
      }
      setIsLoading(false)
    },
    [currentMonth, t]
  )

  useAsyncEffect(async () => {
    await fetchZeitbuchungenList()
  }, [])

  return (
    <div className="container mx-auto max-w-4xl xl:max-w-5xl 2xl:max-w-7xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="block text-3xl font-semibold tracking-tight text-gray-900">
          {t('label.headline')}
        </h1>
      </div>
      <div className="relative rounded-lg bg-white p-8 shadow">
        {isLoading && (
          <div className="absolute top-0 left-0 z-50 flex h-full w-full items-center justify-center rounded-lg bg-white/50">
            <LoaderTw size={LoaderSize.XLarge} />
          </div>
        )}
        <div className="relative flex flex-col">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12">
              <div className="flex flex-col-reverse justify-between gap-x-4 gap-y-8 2xl:flex-row">
                <div className="flex flex-col gap-4">
                  <MonthYearFilter isLoading={isLoading} />
                  <h2 className="text-xl leading-7 font-semibold text-gray-900">
                    {`${t('label.aktuelleAnsicht')} ${dayjs(currentMonth as string).format('MMMM YYYY')}`}
                  </h2>
                  {/* <div className="mt-4 flex gap-4">
                    <span className="text-md font-semibold leading-7 text-gray-900">
                      {t('label.statusDesMonats.label')}
                    </span>
                    <span className="text-md block leading-7 text-gray-900">
                      {t('label.statusDesMonats.abgeschlossen')}
                    </span>
                  </div> */}
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-row gap-4">
                    <ZeitnachweisButton currentMonth={currentMonth as string} />
                    <ButtonTw
                      className="flex items-center gap-2 whitespace-nowrap"
                      size={ButtonSize.Large}
                      onClick={() => fetchZeitbuchungenList(true)}
                    >
                      <ArrowPathIcon className="h-6 w-6" />
                      {t('label.ibosAktualisieren')}
                    </ButtonTw>
                  </div>
                  {metaData?.lastSyncedAt && (
                    <span className="text-md block leading-7 text-gray-900 2xl:text-right">
                      {`${t('label.zuletztAktualisiert')} ${dayjs(metaData?.lastSyncedAt).format('DD.MM.YYYY, HH:mm')}`}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {currentMonth && (
              <div className="col-span-12 mt-4">
                <CompactCalendar
                  currentMonth={currentMonth as string}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  timeslotEntries={timeslotEntries}
                />
              </div>
            )}
            <div className="col-span-12 my-6 flex gap-6">
              <div className="flex items-center gap-2">
                <div className="bg-ibis-blue block h-6 w-6 rounded-sm" />
                <span className="text-md leading-7 text-gray-900">Heute</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="block h-6 w-6 rounded-sm ring-2 ring-fuchsia-400 ring-inset" />
                <span className="text-md leading-7 text-gray-900">
                  {t('label.legend.ausgewaehlt')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="block h-6 w-6 rounded-sm bg-violet-200" />
                <span className="text-md leading-7 text-gray-900">
                  {t('label.legend.feiertag')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="block h-2 w-2 rounded-full bg-amber-400" />
                <span className="text-md leading-7 text-gray-900">
                  {t('label.legend.datenVorhanden')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <XMarkIcon className="block h-5 w-5 text-red-400" />
                <span className="text-md leading-7 text-gray-900">
                  {t('label.legend.datenFehlerhaft')}
                </span>
              </div>
            </div>
            {metaData?.umbuchungAvailable && (
              <div className="col-span-8">
                <InfoSectionTw
                  description={t('label.umbuchungDescription')}
                  linkText={t('label.umbuchungCta')}
                  linkUrl="/mein-bereich//umbuchung"
                  className="mt-2"
                />
              </div>
            )}
            {selectedDate && (
              <div className="col-span-12 mt-8 flex flex-col gap-4 border-t border-slate-200 pt-8">
                <h3 className="mb-4 text-xl leading-7 font-semibold text-gray-900">
                  {`${t('label.eintraegeFuer')} ${dayjs(selectedDate).format('dddd, DD.MM.YYYY')}`}
                </h3>
                {selectedEntries.length ? (
                  <TableTw className="flex-auto">
                    <thead className="bg-gray-50">
                      <tr>
                        <TableHeaderTw>{'Von - Bis'}</TableHeaderTw>
                        <TableHeaderTw>{'Pause Von - Bis'}</TableHeaderTw>
                        <TableHeaderTw>{'Dauer'}</TableHeaderTw>
                        <TableHeaderTw>{'Leisungsort'}</TableHeaderTw>
                        <TableHeaderTw>{'Tätigkeit'}</TableHeaderTw>
                        <TableHeaderTw>{'Seminar'}</TableHeaderTw>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedEntries.map((entry, index) => (
                        <tr key={index}>
                          <TableCellTw>
                            {getVonBisDisplayFromEntry(entry)}
                          </TableCellTw>
                          <TableCellTw>
                            {`${entry.pauseVon ?? ''} - ${entry.pauseBis ?? ''}`}
                          </TableCellTw>
                          <TableCellTw>{entry.dauerStd ?? '-'}</TableCellTw>
                          <TableCellTw>{entry.leistungsort ?? '-'}</TableCellTw>
                          <TableCellTw>{entry.taetigkeit ?? '-'}</TableCellTw>
                          <TableCellTw>
                            {entry.seminar
                              ? `${entry.seminar.seminarBezeichnung} (${entry.seminar.seminarNumber})`
                              : '-'}
                          </TableCellTw>
                        </tr>
                      ))}
                    </tbody>
                  </TableTw>
                ) : (
                  <p className="text-md leading-7 text-gray-900">
                    {t('label.keineEintraege')}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
