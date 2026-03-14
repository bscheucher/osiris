'use client'

import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'
import React, { useCallback, useState } from 'react'

import UmbuchungEditForm, {
  convertMinutesToHours,
  UeberstundenKontoEntry,
  UeberstundenMetadata,
} from '@/app/(authenticated)/mein-bereich/umbuchung/umbuchung-edit-form'
import LoaderTw, { LoaderSize } from '@/components/atoms/loader-tw'
import InfoSectionTw from '@/components/molecules/info-section-tw'
import { LayoutWrapper } from '@/components/molecules/layout-wrapper'
import useAsyncEffect from '@/hooks/use-async-effect'
import { executeGET, executePOST } from '@/lib/utils/gateway-utils'
import { showError, showSuccess } from '@/lib/utils/toast-utils'

import 'dayjs/locale/de'
dayjs.locale('de')

export default function Page() {
  const t = useTranslations('umbuchung.overview')
  const [isLoading, setIsLoading] = useState(true)
  const [kontoList, setKontoList] = useState<UeberstundenKontoEntry[]>([])
  const [metadata, setMetadata] = useState<UeberstundenMetadata | null>(null)

  const lastMonthDate = dayjs().subtract(1, 'month').startOf('month')

  const formatKontoList = useCallback(
    (zeitspeicher: UeberstundenKontoEntry[]) =>
      zeitspeicher
        .filter((entry) => entry.value > 0)
        .map((entry) => ({
          ...entry,
          zurAuszahlung: entry.abrechnung
            ? convertMinutesToHours(entry.abrechnung)
            : 0,
        })),
    []
  )

  useAsyncEffect(async () => {
    setIsLoading(true)

    const { data, success } = await executeGET<{
      umbuchung: {
        metadata: UeberstundenMetadata
        zeitspeicher: UeberstundenKontoEntry[]
      }[]
    }>(`/zeiterfassung/umbuchung?date=${lastMonthDate.format('YYYY-MM-DD')}`)

    if (!success || !data?.umbuchung?.length || !data?.umbuchung[0]) {
      showError(t('error.laden'))
      return
    }

    const { metadata: currentMetadata, zeitspeicher } = data.umbuchung[0]

    if (currentMetadata) {
      setMetadata(currentMetadata)
    }

    if (zeitspeicher && zeitspeicher.length) {
      setKontoList(formatKontoList(zeitspeicher))
    } else {
      showError(t('error.keineDaten'))
    }

    setIsLoading(false)
  }, [])

  const onSubmit = async (formValues: {
    kontoList: UeberstundenKontoEntry[]
  }) => {
    if (metadata?.date) {
      setIsLoading(true)

      const formattedList = formValues.kontoList.map((entry) => ({
        zspNummer: entry.zspNummer,
        value: entry?.zurAuszahlung
          ? Math.round(parseFloat(`${entry?.zurAuszahlung}`) * 60)
          : 0,
      }))

      const { data, success } = await executePOST<{
        umbuchung: {
          metadata: UeberstundenMetadata
          zeitspeicher: UeberstundenKontoEntry[]
        }[]
      }>(`/zeiterfassung/umbuchung?date=${metadata.date}`, {
        zeitspeicher: formattedList,
      })

      if (!success || !data?.umbuchung?.length || !data?.umbuchung[0]) {
        showError(t('error.saveError'))
        return
      }

      const { metadata: currentMetadata, zeitspeicher } = data.umbuchung[0]

      if (currentMetadata) {
        setMetadata(currentMetadata)
      }

      if (zeitspeicher && zeitspeicher.length) {
        setKontoList(formatKontoList(zeitspeicher))
      }

      showSuccess(t('saveSuccess'))
      setIsLoading(false)
    }
  }

  const notification = () => {
    if (metadata?.isEligible === false) {
      if (metadata.reason === 'Umbuchung already done for that month') {
        return <InfoSectionTw description={t('umbuchungDone')} />
      }

      return <InfoSectionTw description={t('umbuchungUnavailable')} />
    }
    return null
  }

  return (
    <LayoutWrapper
      title={`${t('label')} für ${lastMonthDate.format('MMMM YYYY')}`}
      className="max-w-4xl xl:max-w-5xl 2xl:max-w-6xl"
      containerClassName="gap-6"
    >
      <>
        {isLoading ? (
          <div className="flex h-[760px] items-center justify-center">
            <LoaderTw size={LoaderSize.XLarge} />
          </div>
        ) : (
          <>
            {notification()}
            <UmbuchungEditForm
              kontoList={kontoList}
              submitHandler={onSubmit}
              isDisabled={!metadata?.isEligible}
            />
          </>
        )}
      </>
    </LayoutWrapper>
  )
}
