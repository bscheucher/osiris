import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import isoWeek from 'dayjs/plugin/isoWeek'
import { useTranslations } from 'next-intl'
import React from 'react'

import BadgeTw, { BadgeColor, BadgeSize } from '@/components/atoms/badge-tw'

dayjs.extend(isBetween)
dayjs.extend(isoWeek)

function getWorkingDays(startDate: string | Date, endDate: string | Date) {
  const start = dayjs(startDate)
  const end = dayjs(endDate)
  let workdays = 0

  let current = start

  while (current.isBefore(end) || current.isSame(end, 'day')) {
    // isoWeekday returns 1-7 where 1 is Monday and 7 is Sunday
    if (current.isoWeekday() < 6) {
      // Less than 6 means Mon-Fri
      workdays++
    }
    current = current.add(1, 'day')
  }

  return workdays
}

// Usage example:

type Props = {
  abwesendVon: string
  abwesendBis: string
  mitarbeiterLabel: string
  grund?: string
}

export default function MetaData({
  abwesendVon,
  abwesendBis,
  mitarbeiterLabel,
  grund,
}: Props) {
  const t = useTranslations('vertretungsplanung')

  const workingDays = getWorkingDays(abwesendVon, abwesendBis)

  return (
    <>
      <div className="mb-4 leading-10">
        {`${t('labels.vertretungFür')} `}
        <BadgeTw
          color={BadgeColor.Blue}
          size={BadgeSize.Large}
          className="mx-2"
        >
          {mitarbeiterLabel}
        </BadgeTw>{' '}
        {t('labels.vom')}
        <span className="mx-2 font-semibold">
          {dayjs(abwesendVon).format('DD.MM.YYYY')}
        </span>
        {t('labels.bis')}
        <span className="mx-2 font-semibold">
          {dayjs(abwesendBis).format('DD.MM.YYYY')}
        </span>
      </div>
      <div className="mb-4 inline-flex gap-8">
        {grund && (
          <div className="flex gap-2">
            <span className="text-normal font-semibold text-gray-900">
              {t('labels.grund')}:
            </span>
            <span className="text-normal text-gray-700">
              {t(`labels.${grund}`)}
            </span>
          </div>
        )}
        <div className="flex gap-2">
          <span className="text-normal font-semibold text-gray-900">
            {t('labels.dauer')}:
          </span>
          <span className="text-normal text-gray-700">
            {workingDays} {t('labels.arbeitstage')}
          </span>
        </div>
      </div>
    </>
  )
}
