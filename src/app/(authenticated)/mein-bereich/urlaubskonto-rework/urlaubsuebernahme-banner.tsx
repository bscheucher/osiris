import {useTranslations} from 'next-intl'

interface UrlaubsuebernahmeBannerProps {
  heading: string
  anspruch: number
  uebertrag: number
  balanceAtStart: number
  variant: 'current' | 'next'
}

export function UrlaubsuebernahmeBanner({
  heading,
  anspruch,
  uebertrag,
  balanceAtStart,
  variant,
}: UrlaubsuebernahmeBannerProps) {
  const t = useTranslations('urlaubsKonto.rework.urlaubsuebernahme')

  const bgClass = variant === 'next' ? 'bg-ibis-emerald' : 'bg-slate-600'
  const marginClass = variant === 'next' ? 'mt-6' : ''

  return (
    <div
      className={`mb-4 flex items-center gap-4 rounded-xl ${bgClass} px-5 py-4 ${marginClass}`}
    >
      <span className="text-xl">{variant === 'next' ? '🔄' : '📋'}</span>
      <div className="flex-1">
        <p className="font-semibold text-white">{heading}</p>
        <p className="mt-0.5 text-sm text-white/80">
          {t('uebertrag')} ({uebertrag} {t('tage')}) + {t('neuanspruch')} (
          {anspruch} {t('tage')}) = {t('eroeffnungssaldo')}
        </p>
      </div>
      <div className="shrink-0 rounded-full border border-white/30 bg-white/20 px-4 py-1.5 text-sm font-bold text-white">
        {uebertrag} + {anspruch} = {balanceAtStart}
      </div>
    </div>
  )
}
