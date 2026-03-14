'use client'

import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useState, useCallback } from 'react'

import ButtonTw from '@/components/atoms/button-tw'
import HorizontalRow from '@/components/atoms/hr-tw'
import LoaderWithOverlay from '@/components/atoms/loader-with-overlay'
import LoaderWithSpacer from '@/components/atoms/loader-with-spacer'
import MitarbeiterVertragsdatenEditForm from '@/components/forms/mitarbeiter-vertragsdaten-edit-form'
import ErrorSectionTw from '@/components/molecules/error-section-tw'
import InfoSectionTw from '@/components/molecules/info-section-tw'
import { DefaultModal } from '@/components/organisms/default-modal'
import useAsyncEffect from '@/hooks/use-async-effect'
import { ROLE } from '@/lib/constants/role-constants'
import { VertragsdatenEntry } from '@/lib/interfaces/mitarbeiter'
import { executeGET, executePOST } from '@/lib/utils/gateway-utils'
import { showErrorMessage, showSuccess } from '@/lib/utils/toast-utils'
import useOnboardingStore from '@/stores/onboarding-store'
import useUserStore from '@/stores/user-store'

const Page = () => {
  const { hasSomeRole } = useUserStore()
  const { personalnummer } = useParams<{ personalnummer: string }>()
  const [mitarbeiterVertragsdaten, setMitarbeiterVertragsdaten] =
    useState<VertragsdatenEntry | null>(null)
  const { fetchKostenstellen } = useOnboardingStore()
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitCallback, setSubmitCallback] = useState<
    (() => Promise<void>) | null
  >(null)
  const t = useTranslations('mitarbeiter.bearbeiten')

  useAsyncEffect(async () => {
    if (personalnummer) {
      try {
        await fetchKostenstellen(personalnummer)

        const response = await executeGET<{
          vertragsdaten: VertragsdatenEntry[]
        }>(`/mitarbeiter/vertragsdaten/edit/${personalnummer}`)

        if (response.data?.vertragsdaten[0]) {
          setMitarbeiterVertragsdaten(response.data?.vertragsdaten[0])
        }
      } catch (e) {
        showErrorMessage(e)
      }
      setIsLoading(false)
    }
  }, [])

  const onShowModal = useCallback(
    (formValues: VertragsdatenEntry) => {
      const handleSubmit = async () => {
        setIsLoading(true)

        const personalnummerAsString = personalnummer as string
        // add personalnummer to body
        const postBody = {
          ...formValues,
          personalnummerAsString,
        }
        // remove error props to prevent state conflicts
        delete postBody.errors
        delete postBody.errorsMap

        try {
          const response = await executePOST<{
            vertragsdaten: VertragsdatenEntry[]
          }>(`/mitarbeiter/vertragsdaten/edit/${personalnummer}`, postBody)

          if (response.data?.vertragsdaten[0]) {
            setMitarbeiterVertragsdaten(response.data?.vertragsdaten[0])
          }
          showSuccess(t('vertragsdaten.message.success'))
        } catch (e) {
          showErrorMessage(e)
        } finally {
          setShowModal(false)
          setIsLoading(false)
        }
      }

      setSubmitCallback(() => handleSubmit)
      setShowModal(true)
    },
    [personalnummer, t]
  )

  const onResetModal = () => {
    setSubmitCallback(null)
    setShowModal(false)
  }

  const onSubmit = async () => {
    if (submitCallback) {
      await submitCallback()
    }
  }

  if (!mitarbeiterVertragsdaten) {
    if (isLoading) {
      return <LoaderWithSpacer />
    }

    return (
      <ErrorSectionTw
        description={t('vertragsdaten.error.noVertragsdaten')}
        linkText={t('vertragsdaten.link.backToOverview')}
        linkUrl="/mitarbeiter/verwalten"
      />
    )
  }

  if (!hasSomeRole([ROLE.MA_LESEN, ROLE.MA_BEARBEITEN])) {
    return (
      <InfoSectionTw description={t('stammdaten.info.noRoleDescription')} />
    )
  }

  return (
    <>
      {isLoading && <LoaderWithOverlay />}
      <MitarbeiterVertragsdatenEditForm
        personalnummer={personalnummer}
        onValidSubmit={onShowModal}
        vertragsDaten={mitarbeiterVertragsdaten}
        isReadOnly={!hasSomeRole([ROLE.MA_BEARBEITEN])}
      />
      <DefaultModal
        showModal={showModal}
        modalSize="2xl"
        closeModal={onResetModal}
      >
        <div className="flex flex-col space-y-8">
          <h3 className="mb-4 text-xl font-bold">
            {t('label.bestaetigungDatenaenderung')}
          </h3>
          <InfoSectionTw
            description={t('vertragsdaten.info.preSaveNotification')}
          />
          <HorizontalRow />
          <div className="flex flex-row gap-4">
            <ButtonTw
              onClick={onResetModal}
              type="button"
              className="flex-auto"
              isLoading={isLoading}
              secondary
            >
              {t('label.abbrechen')}
            </ButtonTw>
            <ButtonTw
              onClick={onSubmit}
              type="button"
              className="flex-auto"
              isLoading={isLoading}
            >
              {t('label.speichern')}
            </ButtonTw>
          </div>
        </div>
      </DefaultModal>
    </>
  )
}

export default Page
