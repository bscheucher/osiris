import dayjs from 'dayjs'
import {useTranslations} from 'next-intl'

function Badge({
  heading,
  value,
  valuePrefix,
  subtext,
  topEdgeColorClassName,
  valueColorClassName,
}: {
  heading: string
  value: number
  valuePrefix?: string
  subtext: string
  topEdgeColorClassName: string
  valueColorClassName: string
}) {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 px-8 py-5 shadow-sm">
      <div
        className={`absolute inset-x-0 top-0 h-[3px] ${topEdgeColorClassName}`}
      />
      <span className="text-[11px] font-semibold tracking-[0.8px] text-gray-400 uppercase">
        {heading}
      </span>
      <span className={`mt-2 text-4xl font-bold ${valueColorClassName}`}>
        {valuePrefix}
        {value}
      </span>
      <span className="mt-1 text-xs text-gray-400">{subtext}</span>
    </div>
  )
}

interface UrlaubMetaInfoProps {
  totalConsumption: number | null | undefined
  balanceAfterLastDay: number
  lastDay: string
  nextAnspruch: number
  nextFirstDay: string
}

export function UrlaubMetaInfo({
  totalConsumption,
  balanceAfterLastDay,
  lastDay,
  nextAnspruch,
  nextFirstDay,
}: UrlaubMetaInfoProps) {
  const t = useTranslations('urlaubsKonto.rework')

  return (
    <div className="mb-6 flex gap-4">
      <Badge
        heading={t('balanceAfterLastDay')}
        value={balanceAfterLastDay}
        subtext={t('balanceAfterLastDaySubtext')}
        topEdgeColorClassName="bg-orange-600"
        valueColorClassName="text-orange-600"
      />
      <Badge
        heading={t('nextAnspruch.heading')}
        value={nextAnspruch}
        valuePrefix="+"
        subtext={t('nextAnspruch.subtext', {
          startDate: dayjs(nextFirstDay).format('DD.MM.YYYY'),
        })}
        topEdgeColorClassName="bg-ibis-emerald"
        valueColorClassName="text-ibis-emerald"
      />
      {totalConsumption !== null && totalConsumption !== undefined && (
        <Badge
          heading={t('totalConsumption')}
          value={totalConsumption}
          subtext={`${t('bis')} ${dayjs(lastDay).format('DD.MM.YYYY')}`}
          topEdgeColorClassName={
            totalConsumption === 0 ? 'bg-gray-400' : 'bg-ibis-blue-dark'
          }
          valueColorClassName={
            totalConsumption === 0 ? 'text-gray-400' : 'text-ibis-blue-dark'
          }
        />
      )}
    </div>
  )
}
