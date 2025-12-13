import { XMarkIcon } from '@heroicons/react/16/solid'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import dayjs from 'dayjs'
import React, { useCallback, useMemo } from 'react'
import { twMerge } from 'tailwind-merge'

import {
  generateMonthData,
  MonthEntry,
  TimeslotEntry,
} from '../meine-zeiten-utils'
import { BlockingAwareLink } from '@/components/atoms/blocking-aware-link'

export const ZEITBUCHUNG_MIN_DATE = '2025-01-01'

const CalendarDateSection = ({
  month,
  selectedDate,
  setSelectedDate,
}: {
  month: MonthEntry
  selectedDate: string | null
  setSelectedDate: React.Dispatch<React.SetStateAction<string | null>>
}) => {
  const setDate = useCallback(
    (date: string) => {
      if (date && dayjs(date).isAfter(dayjs(ZEITBUCHUNG_MIN_DATE))) {
        setSelectedDate(date)
      }
    },
    [setSelectedDate]
  )

  return (
    <section className="text-center">
      <h2 className="text-sm font-semibold text-gray-900">{month.title}</h2>
      <div className="mt-6 grid grid-cols-7 text-xs leading-6 text-gray-500">
        <div>M</div>
        <div>D</div>
        <div>M</div>
        <div>D</div>
        <div>F</div>
        <div>S</div>
        <div>S</div>
      </div>
      <div className="isolate mt-2 grid grid-cols-7 gap-px rounded-lg bg-gray-200 text-sm shadow ring-1 ring-gray-200">
        {month.days.map((day, dayIdx) => (
          <button
            key={day.date}
            type="button"
            className={twMerge(
              'relative flex justify-center hover:bg-gray-100 focus:z-10',
              day.isCurrentMonth
                ? 'bg-white text-gray-900'
                : 'bg-gray-100 text-gray-500',
              day.date === selectedDate && 'ring-2 ring-fuchsia-400 ring-inset',
              (day.isWeekend || day.holiday) &&
                'bg-violet-50 hover:bg-violet-100',
              dayIdx === 0 && 'rounded-tl-lg',
              dayIdx === 6 && 'rounded-tr-lg',
              dayIdx === month.days.length - 7 && 'rounded-bl-lg',
              dayIdx === month.days.length - 1 && 'rounded-br-lg'
            )}
            onClick={() => setDate(day.date)}
            title={day.holiday}
          >
            <div
              className={twMerge(
                'my-2 flex flex-col items-center justify-center rounded-md px-0.5 pb-2',
                day.isToday && 'bg-ibis-blue font-semibold text-white'
              )}
            >
              <time
                dateTime={day.date}
                className={twMerge(
                  'relative mx-auto flex h-7 w-7 items-center justify-center'
                )}
              >
                {day.date.split('-').pop()?.replace(/^0/, '')}
              </time>
              {day.hasError ? (
                <XMarkIcon className="block h-4 w-4 text-red-400" />
              ) : (
                <div
                  className={twMerge(
                    'my-1 block h-2 w-2 rounded-full',
                    day.hasEntries && 'bg-amber-400'
                  )}
                />
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}

CalendarDateSection.displayName = 'CalendarDateSection'

interface Props {
  currentMonth: string
  selectedDate: string | null
  setSelectedDate: React.Dispatch<React.SetStateAction<string | null>>
  timeslotEntries: TimeslotEntry[]
}

const CompactCalendar = ({
  currentMonth,
  setSelectedDate,
  selectedDate,
  timeslotEntries,
}: Props) => {
  const showPrevButton = dayjs(currentMonth as string).isAfter(
    dayjs(ZEITBUCHUNG_MIN_DATE),
    'month'
  )

  const prevMonth = dayjs(currentMonth as string)
    .subtract(1, 'month')
    .format('YYYY-MM')
  const nextMonth = dayjs(currentMonth as string)
    .add(1, 'month')
    .format('YYYY-MM')
  const monthData = useMemo(
    () => generateMonthData(currentMonth, 2, timeslotEntries),
    [currentMonth, timeslotEntries]
  )

  return (
    <div className="relative grid grid-cols-1 gap-x-14 gap-y-8 xl:grid-cols-2">
      {showPrevButton && (
        <BlockingAwareLink
          type="button"
          className="absolute -top-1 -left-1.5 flex items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
          href={`/mein-bereich/meine-zeiten/${prevMonth}`}
        >
          <span className="sr-only">Previous month</span>
          <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
        </BlockingAwareLink>
      )}
      <BlockingAwareLink
        type="button"
        className="absolute -top-1 -right-1.5 flex items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
        href={`/mein-bereich/meine-zeiten/${nextMonth}`}
      >
        <span className="sr-only">Next month</span>
        <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
      </BlockingAwareLink>
      <CalendarDateSection
        month={monthData[currentMonth as string]}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
      <CalendarDateSection
        month={monthData[nextMonth]}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
    </div>
  )
}

CompactCalendar.displayName = 'CompactCalendar'

export default CompactCalendar
