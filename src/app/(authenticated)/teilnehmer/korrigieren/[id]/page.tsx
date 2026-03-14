'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

import TeilnehmerKorrigierenForm from './teilnehmer-korrigieren-form'
import LoaderTw, { LoaderSize } from '@/components/atoms/loader-tw'
import ErrorSectionTw from '@/components/molecules/error-section-tw'
import { LayoutWrapper } from '@/components/molecules/layout-wrapper'
import useAsyncEffect from '@/hooks/use-async-effect'
import { Teilnehmer } from '@/lib/interfaces/teilnehmer'
import { getSearchParamsObject } from '@/lib/utils/form-utils'
import { executeGET } from '@/lib/utils/gateway-utils'
import { showError } from '@/lib/utils/toast-utils'

const BearbeitenPage = () => {
  const { id } = useParams()
  const searchParams = useSearchParams()
  const { searchParamsObject } = getSearchParamsObject(searchParams)
  const [participant, setParticipant] = useState<Teilnehmer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const t = useTranslations('teilnehmer.bearbeiten')
  const tKorrigieren = useTranslations('teilnehmer.korrigieren')
  const teilnehmerId = isNaN(parseInt(id as string))
    ? null
    : parseInt(id as string)

  const seminarNameParam = searchParamsObject.seminarName
    ? `&seminarName=${searchParamsObject.seminarName}`
    : ''

  useAsyncEffect(async () => {
    try {
      if (!teilnehmerId) {
        throw new Error(t('error.noId'))
      }

      const { data } = await executeGET<{
        teilnehmerSeminars: {
          teilnehmerDto: Teilnehmer
        }[]
      }>(`/teilnehmer/edit/${id}?isKorrigieren=true${seminarNameParam}`)

      if (data?.teilnehmerSeminars[0]) {
        const { teilnehmerDto } = data.teilnehmerSeminars[0]
        if (teilnehmerDto) {
          setParticipant(teilnehmerDto)
        }
      } else {
        throw new Error(t('error.teilnehmerLaden'))
      }
    } catch (error) {
      showError(t('error.teilnehmerLaden'))
    }
    setIsLoading(false)
  }, [])

  return (
    <LayoutWrapper
      className="2xl:max-w-8xl max-w-6xl"
      title={tKorrigieren('pageTitle')}
    >
      {isLoading ? (
        <div className="flex h-[760px] items-center justify-center">
          <LoaderTw size={LoaderSize.XLarge} />
        </div>
      ) : participant ? (
        <TeilnehmerKorrigierenForm
          teilnehmerId={teilnehmerId}
          participant={participant}
          setParticipant={setParticipant}
        />
      ) : (
        <ErrorSectionTw
          description={t('label.keinTeilnehmer')}
          linkText={t('label.backToOverview')}
          linkUrl="/teilnehmer/verwalten"
        />
      )}
    </LayoutWrapper>
  )
}

export default BearbeitenPage
