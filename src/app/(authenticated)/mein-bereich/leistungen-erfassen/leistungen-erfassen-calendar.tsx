'use client'

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import dayjs from 'dayjs'
import localeData from 'dayjs/plugin/localeData'
import weekday from 'dayjs/plugin/weekday'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Fragment, ReactNode, useCallback, useEffect, useRef } from 'react'
import 'dayjs/locale/de'
import { twMerge } from 'tailwind-merge'

import {
  addMetaData,
  getColorClasses,
  Leistung,
  LeistungMetadata,
} from './leistungserfassung-utils'
import { BadgeSize } from '@/components/atoms/badge-tw'
import LoaderTw, { LoaderSize } from '@/components/atoms/loader-tw'
import InfoSectionTw from '@/components/molecules/info-section-tw'
import SollIstBadge from '@/components/molecules/soll-ist-badge'

dayjs.extend(weekday)
dayjs.extend(localeData)
dayjs.locale('de')
interface Props {
  metadata: LeistungMetadata | null
  appointments: Leistung[]
  startDate: string
  setSelectedLeistung: React.Dispatch<React.SetStateAction<Leistung | null>>
  setShowEditForm: React.Dispatch<React.SetStateAction<boolean>>
  isLoading: boolean
}

const LeistungenErfassenCalendar: React.FC<Props> = ({
  metadata,
  appointments,
  startDate,
  setSelectedLeistung,
  setShowEditForm,
  isLoading,
}) => {
  const t = useTranslations('leistungenErfassen')

  const router = useRouter()
  const container = useRef<HTMLDivElement>(null)
  const containerNav = useRef<HTMLDivElement>(null)
  const containerOffset = useRef<HTMLDivElement>(null)
  const startOfWeek = dayjs(startDate).startOf('week')
  const weekDateLabel = `${startOfWeek.format('DD.MM.YYYY')} - ${startOfWeek.endOf('week').format('DD.MM.YYYY')}`

  const appointmentsWithMetadata = addMetaData(appointments)

  const timeToGridRow = useCallback((time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 12 + Math.floor(minutes / 5) + 2 // +2 for the offset at the top
  }, [])

  const calculateGridSpan = useCallback(
    (startTime: string, endTime: string): number => {
      const startRow = timeToGridRow(startTime)
      const endRow = timeToGridRow(endTime)
      return endRow - startRow
    },
    []
  )

  const getTimeDivider = useCallback((time: string): ReactNode => {
    const startRow = timeToGridRow(time)

    return (
      <li
        className={twMerge(
          `relative col-span-full col-start-1 mt-px flex border-t-2 border-red-500/50`
        )}
        style={{ gridRow: `${startRow} / auto` }}
      >
        {' '}
      </li>
    )
  }, [])

  useEffect(() => {
    // const currentMinute = new Date().getHours() * 60
    const currentMinute = 6 * 60
    if (container.current && containerOffset.current && containerNav.current) {
      container.current.scrollTop =
        ((container.current.scrollHeight -
          containerNav.current.offsetHeight -
          containerOffset.current.offsetHeight) *
          currentMinute) /
        1440
    }
  }, [])

  return (
    <div className="relative flex h-[calc(100vh-10rem)] flex-col overflow-hidden rounded-lg">
      {isLoading && (
        <>
          <div className="absolute top-0 left-0 z-40 flex h-full w-full rounded-lg bg-white/60"></div>
          <div className="absolute top-1/2 z-50 flex h-0 w-full items-center justify-center">
            <LoaderTw size={LoaderSize.XLarge} />
          </div>
        </>
      )}
      <header className="flex flex-col border-b border-gray-200">
        {!!metadata?.message.length && (
          <div className="flex gap-4 p-6 pb-0">
            {metadata.message.map((message) => (
              <InfoSectionTw description={message} key={message} />
            ))}
          </div>
        )}
        <div className="flex flex-none items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <div className="relative flex items-center rounded-md bg-white shadow-sm md:items-stretch">
              <button
                type="button"
                className="flex h-9 w-12 items-center justify-center rounded-l-md border-y border-l border-gray-300 pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0 md:hover:bg-gray-50"
                onClick={() => {
                  router.push(
                    `?startDate=${startOfWeek.subtract(1, 'week').format('YYYY-MM-DD')}`
                  )
                }}
              >
                <ChevronLeftIcon className="size-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="hidden border-y border-gray-300 px-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:relative md:block"
              >
                {weekDateLabel}
              </button>
              <span className="relative -mx-px h-5 w-px bg-gray-300 md:hidden" />
              <button
                type="button"
                className="flex h-9 w-12 items-center justify-center rounded-r-md border-y border-r border-gray-300 pl-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pl-0 md:hover:bg-gray-50"
                onClick={() => {
                  router.push(
                    `?startDate=${startOfWeek.add(1, 'week').format('YYYY-MM-DD')}`
                  )
                }}
              >
                <ChevronRightIcon className="size-5" aria-hidden="true" />
              </button>
            </div>
            <span className="text-base font-semibold text-gray-900">
              {t('label.monatsstatus')}:{' '}
              {metadata?.weekStatus === 'OPEN' ? 'Offen' : 'Geschlossen'}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-base font-semibold text-gray-900">
              {t('label.wochenstunden')} ({t('label.soll').toUpperCase()} /{' '}
              {t('label.ist').toUpperCase()})
            </span>

            <SollIstBadge hours={metadata?.total} size={BadgeSize.XLarge} />
          </div>
        </div>
      </header>
      <div
        ref={container}
        className="isolate flex flex-auto flex-col overflow-auto bg-white"
      >
        <div
          style={{ width: '165%' }}
          className="flex max-w-full min-w-[1200px] flex-none flex-col"
        >
          <div
            ref={containerNav}
            className="sticky top-0 z-30 flex-none bg-white shadow ring-1 ring-black/5"
          >
            <div className="grid grid-cols-7 text-sm/6 text-gray-500 sm:hidden">
              {Array.from({ length: 7 }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className="flex flex-col items-center pt-2 pb-3"
                >
                  {startOfWeek.weekday(index).format('dd, DD')}
                </button>
              ))}
            </div>

            <div className="-mr-px hidden grid-cols-7 divide-x divide-gray-100 border-r border-gray-100 text-sm/6 text-gray-500 sm:grid">
              <div className="col-end-1 w-14" />
              {Array.from({ length: 7 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3"
                >
                  <span>{startOfWeek.weekday(index).format('dd, DD')}</span>
                  <SollIstBadge
                    hours={metadata?.weekData[index]}
                    size={BadgeSize.Large}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-auto">
            <div className="sticky left-0 z-10 w-14 flex-none bg-white ring-1 ring-gray-100" />
            <div className="grid flex-auto grid-cols-1 grid-rows-1">
              {/* Horizontal lines */}
              <div
                className="col-start-1 col-end-2 row-start-1 grid divide-y divide-gray-100"
                style={{ gridTemplateRows: 'repeat(48, minmax(3.5rem, 1fr))' }}
              >
                <div ref={containerOffset} className="row-end-1 h-7"></div>
                {Array.from({ length: 24 }).map((_, hour) => (
                  <Fragment key={`hour-${hour}`}>
                    <div>
                      <div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs/5 text-gray-400">
                        {hour.toString().padStart(2, '0')}:00
                      </div>
                    </div>
                    <div key={`halfhour-${hour}`} />
                  </Fragment>
                ))}
              </div>

              {/* Vertical lines */}
              <div className="col-start-1 col-end-2 row-start-1 hidden grid-cols-7 grid-rows-1 divide-x divide-gray-100 sm:grid sm:grid-cols-7">
                {Array.from({ length: 7 }).map((_, index) => (
                  <div
                    key={index}
                    className={`col-start-${index + 1} row-span-full`}
                  />
                ))}
              </div>

              {/* Appointments */}
              <ol
                className="col-start-1 col-end-2 row-start-1 grid grid-cols-7"
                style={{
                  gridTemplateRows: '1.75rem repeat(288, minmax(0, 1fr)) auto',
                }}
              >
                {appointmentsWithMetadata.map((appointment, index) => {
                  const startRow = timeToGridRow(appointment.von)
                  const gridSpan = calculateGridSpan(
                    appointment.von,
                    appointment.bis
                  )
                  const colorClasses = getColorClasses(appointment.colorScheme)

                  return (
                    <li
                      key={index}
                      className={twMerge(
                        `relative mt-px flex col-start-${(appointment.dayOfWeek || 0) + 1}`
                      )}
                      style={{ gridRow: `${startRow} / span ${gridSpan}` }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLeistung(appointment)
                          setShowEditForm(true)
                        }}
                        className={twMerge(
                          `group absolute inset-1 flex flex-row gap-3 overflow-y-auto rounded-lg p-2 text-xs/5`,
                          appointment.status === 'confirmed'
                            ? `${colorClasses.bg} ${colorClasses.hover}`
                            : 'striped-background'
                        )}
                      >
                        <div
                          className={`flex w-3 rounded ${colorClasses.highlight}`}
                        ></div>
                        <div
                          className={`flex flex-col overflow-auto text-left ${colorClasses.text} flex-1`}
                        >
                          <p className={`font-semibold`}>
                            {appointment.kostentraeger}
                          </p>
                          <p className={`mt-0 mb-2`}>
                            {appointment.von} - {appointment.bis}
                          </p>
                          {appointment.ort && (
                            <p className={`mt-1`}>Ort: {appointment.ort}</p>
                          )}
                          {appointment.taetigkeit && (
                            <p className={`mt-1`}>
                              {t('label.taetigkeit')}: {appointment.taetigkeit}
                            </p>
                          )}
                          {appointment.kostentraeger && (
                            <p className={`mt-1`}>
                              {t('label.kostentraeger')}:{' '}
                              {appointment.kostentraeger}
                            </p>
                          )}
                        </div>
                      </button>
                    </li>
                  )
                })}
                {metadata?.kernZeitVon && getTimeDivider(metadata?.kernZeitVon)}
                {metadata?.kernZeitBis && getTimeDivider(metadata?.kernZeitBis)}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeistungenErfassenCalendar
