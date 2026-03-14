'use client'

import { QuestionMarkCircleIcon } from '@heroicons/react/24/solid'
import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'

import BadgeTw, { BadgeColor, BadgeSize } from '@/components/atoms/badge-tw'
import TooltipTw from '@/components/atoms/tooltip-tw'
import { AbwesenheitStatus } from '@/lib/utils/abwesenheit-utils'

export const ZeitraumCell = ({
  startDate,
  endDate,
  isUrlaubsjahruebergreifend,
}: {
  startDate: string
  endDate: string
  isUrlaubsjahruebergreifend: boolean
}) => {
  const t = useTranslations('urlaubsKonto.rework')

  return (
    <div className="flex flex-col gap-1">
      <span>
        {dayjs(startDate).format('DD.MM.YYYY')} –{' '}
        {dayjs(endDate).format('DD.MM.YYYY')}
      </span>
      {isUrlaubsjahruebergreifend && (
        <BadgeTw
          size={BadgeSize.Small}
          color={BadgeColor.Gray}
          className="self-start"
        >
          {t('table.urlaubsjahruebergreifend')}
        </BadgeTw>
      )}
    </div>
  )
}

const STATUSES_FOR_WHICH_TO_DISPLAY_CONSUMPTION = [
  AbwesenheitStatus.VALID,
  AbwesenheitStatus.ACCEPTED,
  AbwesenheitStatus.REQUEST_CANCELLATION,
  AbwesenheitStatus.ACCEPTED_FINAL,
  AbwesenheitStatus.USED,
]

export const DauerCell = ({
  inCurrent,
  inPrev,
  inNext,
  legacy,
  overlapsPreviousYear,
  overlapsNextYear,
  status,
}: {
  inCurrent: number | null | undefined
  inPrev: number | null | undefined
  inNext: number | null | undefined
  legacy: number | null | undefined
  overlapsPreviousYear: boolean
  overlapsNextYear: boolean
  status: AbwesenheitStatus
}) => {
  const t = useTranslations('urlaubsKonto.rework')

  if (!STATUSES_FOR_WHICH_TO_DISPLAY_CONSUMPTION.includes(status)) {
    return null
  }

  const hasConsumptionAsCalculatedInRework =
    (inCurrent ?? 0) > 0 || (inPrev ?? 0) > 0 || (inNext ?? 0) > 0
  const displayValue = hasConsumptionAsCalculatedInRework ? inCurrent : legacy

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span>{displayValue}</span>
      {!hasConsumptionAsCalculatedInRework && overlapsPreviousYear && (
        <TooltipTw content={t('table.legacyOverlapPrev')}>
          <QuestionMarkCircleIcon className="text-ibis-blue size-4 cursor-help" />
        </TooltipTw>
      )}
      {!hasConsumptionAsCalculatedInRework && overlapsNextYear && (
        <TooltipTw content={t('table.legacyOverlapNext')}>
          <QuestionMarkCircleIcon className="text-ibis-blue size-4 cursor-help" />
        </TooltipTw>
      )}
      {(inPrev ?? 0) > 0 && (
        <BadgeTw
          size={BadgeSize.Small}
          color={BadgeColor.Yellow}
          className="text-[10px]"
        >
          {t('table.inLetztemUrlaubsjahr')} {inPrev}
        </BadgeTw>
      )}
      {(inNext ?? 0) > 0 && (
        <BadgeTw
          size={BadgeSize.Small}
          color={BadgeColor.Blue}
          className="text-[10px]"
        >
          {t('table.inNaechstemUrlaubsjahr')} {inNext}
        </BadgeTw>
      )}
    </div>
  )
}
