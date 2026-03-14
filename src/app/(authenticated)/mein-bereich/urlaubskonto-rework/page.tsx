'use client'

import dayjs from 'dayjs'
import {useTranslations} from 'next-intl'
import {useState} from 'react'
import {AbwesenheitenOverviewV2Dto} from './types'
import {UrlaubshistoriePanel} from './urlaubshistorie-panel'
import {executeGET} from '@/lib/utils/gateway-utils'
import {showError} from '@/lib/utils/toast-utils'
import {UrlaubMetaInfo} from './urlaub-meta-info'
import {UrlaubsjahrSectionHeader} from './urlaubsjahr-section-header'
import {UrlaubsuebernahmeBanner} from './urlaubsuebernahme-banner'
import Loader from '@/components/atoms/loader'
import {LayoutWrapper} from '@/components/molecules/layout-wrapper'
import useAsyncEffect from '@/hooks/use-async-effect'
import {AbwesenheitenTable} from "@/app/(authenticated)/mein-bereich/urlaubskonto-rework/abwesenheiten-table";


export default function Page() {
  const [overview, setOverview] = useState<AbwesenheitenOverviewV2Dto | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  const t = useTranslations('urlaubsKonto.rework')

  useAsyncEffect(async () => {
    const response = await executeGET<AbwesenheitenOverviewV2Dto>(
      '/v2/abwesenheiten/overview'
    )
    const dto = response as unknown as AbwesenheitenOverviewV2Dto
    if (!dto.currentUrlaubsjahr) {
      if (!response.message) {
        showError(t('error.laden'))
      }
      setIsError(true)
    } else {
      setOverview(dto)
    }
    setIsLoading(false)
  }, [])

  if (isLoading || isError || overview === null) {
    return (
      <LayoutWrapper
        className="max-w-4xl xl:max-w-6xl 2xl:max-w-7xl"
        title={t('title')}
      >
        <Loader />
      </LayoutWrapper>
    )
  }

  const {
    firstDay: firstDayOfCurrentUrlaubsjahr,
    lastDay: lastDayOfCurrentUrlaubsjahr,
    totalConsumption,
    balanceAfterLastDay,
    anspruch,
    uebertrag,
    balanceAtStart,
    abwesenheiten,
  } = overview.currentUrlaubsjahr

  const nextUrlaubsjahr = overview.nextUrlaubsjahr

  const currentUrlaubsjahrRange = `${dayjs(firstDayOfCurrentUrlaubsjahr).format('DD.MM.YYYY')} – ${dayjs(lastDayOfCurrentUrlaubsjahr).format('DD.MM.YYYY')}`

  return (
    <LayoutWrapper
      className="max-w-4xl xl:max-w-6xl 2xl:max-w-7xl"
      title={t('title')}
      subtitle={t('subtitle', { range: currentUrlaubsjahrRange })}
    >
      <>
        <UrlaubMetaInfo
          totalConsumption={totalConsumption}
          balanceAfterLastDay={balanceAfterLastDay}
          lastDay={lastDayOfCurrentUrlaubsjahr}
          nextAnspruch={nextUrlaubsjahr.anspruch}
          nextFirstDay={nextUrlaubsjahr.firstDay}
        />
        <UrlaubsuebernahmeBanner
          heading={t('urlaubsuebernahme.heading')}
          anspruch={anspruch}
          uebertrag={uebertrag}
          balanceAtStart={balanceAtStart}
          variant="current"
        />
        <UrlaubsjahrSectionHeader
          title={t('section.aktuellesUrlaubsjahr')}
          range={currentUrlaubsjahrRange}
          variant="current"
        />
        <AbwesenheitenTable
          abwesenheiten={abwesenheiten}
          firstDayOfUrlaubsjahr={firstDayOfCurrentUrlaubsjahr}
          lastDayOfUrlaubsjahr={lastDayOfCurrentUrlaubsjahr}
          variant="current"
        />
        <UrlaubsuebernahmeBanner
          heading={t('urlaubsuebernahme.naechsterAnspruchHeading', {
            startDate: dayjs(nextUrlaubsjahr.firstDay).format('DD.MM.YYYY'),
          })}
          anspruch={nextUrlaubsjahr.anspruch}
          uebertrag={nextUrlaubsjahr.uebertrag}
          balanceAtStart={nextUrlaubsjahr.balanceAtStart}
          variant="next"
        />
        <UrlaubsjahrSectionHeader
          title={t('section.naechstesUrlaubsjahr')}
          range={`${dayjs(nextUrlaubsjahr.firstDay).format('DD.MM.YYYY')} – ${dayjs(nextUrlaubsjahr.lastDay).format('DD.MM.YYYY')}`}
          variant="next"
        />
        <AbwesenheitenTable
          abwesenheiten={nextUrlaubsjahr.abwesenheiten}
          firstDayOfUrlaubsjahr={nextUrlaubsjahr.firstDay}
          lastDayOfUrlaubsjahr={nextUrlaubsjahr.lastDay}
          variant="next"
        />
        <UrlaubshistoriePanel
          historicalAbwesenheiten={overview.historicalAbwesenheiten}
        />
      </>
    </LayoutWrapper>
  )
}
