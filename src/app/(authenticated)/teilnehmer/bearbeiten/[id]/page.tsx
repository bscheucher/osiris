'use client'

import { PlusIcon } from '@heroicons/react/20/solid'
import { UserIcon } from '@heroicons/react/24/outline'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useCallback, useState } from 'react'

import TeilnehmerEditForm from '@/app/(authenticated)/teilnehmer/bearbeiten/[id]/teilnehmer-edit-form'
import ButtonTw from '@/components/atoms/button-tw'
import LoaderWithSpacer from '@/components/atoms/loader-with-spacer'
import ErrorSectionTw from '@/components/molecules/error-section-tw'
import { LayoutWrapper } from '@/components/molecules/layout-wrapper'
import { toastTw } from '@/components/organisms/toast-tw'
import useAsyncEffect from '@/hooks/use-async-effect'
import { ROLE } from '@/lib/constants/role-constants'
import {
  SeminarEntry,
  Teilnehmer,
  TeilnehmerValidityStatus,
} from '@/lib/interfaces/teilnehmer'
import { executeGET } from '@/lib/utils/gateway-utils'
import { showError } from '@/lib/utils/toast-utils'
import useUserStore from '@/stores/user-store'

const BearbeitenPage = () => {
  const { id } = useParams()
  const { hasSomeRole } = useUserStore()
  const router = useRouter()
  const [participant, setParticipant] = useState<Teilnehmer | null>(null)
  const [seminarData, setSeminarData] = useState<SeminarEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const t = useTranslations('teilnehmer.bearbeiten')
  const teilnehmerId = isNaN(parseInt(id as string))
    ? null
    : parseInt(id as string)

  const isReadOnly =
    hasSomeRole([ROLE.TN_LESEN]) &&
    !hasSomeRole([ROLE.TN_BEARBEITEN, ROLE.TN_ANLEGEN])

  const onBoardingAllowed =
    hasSomeRole([ROLE.TN_ONBOARDING]) &&
    participant?.status === TeilnehmerValidityStatus.VALID &&
    participant?.ueba === true

  const hasPersonalNumber = !!participant?.personalnummer

  useAsyncEffect(async () => {
    try {
      if (!teilnehmerId) {
        throw new Error(t('error.noId'))
      }

      const { data } = await executeGET<{
        teilnehmerSeminars: {
          seminarDtos: SeminarEntry[]
          teilnehmerDto: Teilnehmer
        }[]
      }>(`/teilnehmer/edit/${id}`)

      if (data?.teilnehmerSeminars[0]) {
        const { seminarDtos, teilnehmerDto } = data.teilnehmerSeminars[0]
        if (teilnehmerDto) {
          setParticipant(teilnehmerDto)
        }

        if (seminarDtos) {
          setSeminarData(seminarDtos)
        }
      } else {
        throw new Error(t('error.teilnehmerLaden'))
      }
    } catch (error) {
      showError(t('error.teilnehmerLaden'))
    }
    setIsLoading(false)
  }, [])

  const fetchPersonalNummerFromTeilnehmer = useCallback(async () => {
    setIsLoading(true)

    if (participant) {
      try {
        const { data } = await executeGET<{ personalnummer: string }>(
          `/mitarbeiter/generatePersonalnummerForTeilnehmer?teilnehmerID=${participant.id}`
        )

        const personalnummer = data?.personalnummer

        if (personalnummer && !isNaN(Number(personalnummer))) {
          toastTw.info(t('label.personalnummerWurdeGeneriert'))

          router.push(`/teilnehmer/onboarding/${personalnummer}?wfi=18`, {
            scroll: false,
          })
        }
      } catch (e) {
        console.error(e)
        setIsLoading(false)
      }
    }
  }, [participant, router, t])

  return (
    <LayoutWrapper
      className="2xl:max-w-8xl max-w-6xl"
      title={
        isReadOnly
          ? t('text.teilnehmerAnsehen')
          : t('text.teilnehmerBearbeiten')
      }
      button={
        hasPersonalNumber ? (
          <ButtonTw
            href={`/teilnehmer/onboarding/${participant.personalnummer}?wfi=18`}
            className="flex h-12 items-center gap-1"
            testId="start-onboarding-button"
          >
            <UserIcon className="h-6 w-6" />
            {t('button.zumErfassenFormular')}
          </ButtonTw>
        ) : (
          onBoardingAllowed && (
            <ButtonTw
              onClick={fetchPersonalNummerFromTeilnehmer}
              className="flex h-12 items-center gap-1"
              testId="start-onboarding-button"
            >
              <PlusIcon className="h-6 w-6" />
              {t('button.teilnehmerOnboarding')}
            </ButtonTw>
          )
        )
      }
    >
      {isLoading ? (
        <LoaderWithSpacer />
      ) : participant ? (
        <TeilnehmerEditForm
          teilnehmerId={teilnehmerId}
          participant={participant}
          seminarData={seminarData}
          isReadOnly={isReadOnly}
          setParticipant={setParticipant}
          setSeminarData={setSeminarData}
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
