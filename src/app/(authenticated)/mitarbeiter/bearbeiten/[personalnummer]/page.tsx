'use client'

import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useState, useCallback } from 'react'

import ButtonTw from '@/components/atoms/button-tw'
import HorizontalRow from '@/components/atoms/hr-tw'
import LoaderWithOverlay from '@/components/atoms/loader-with-overlay'
import LoaderWithSpacer from '@/components/atoms/loader-with-spacer'
import MitarbeiterStammdatenEditForm from '@/components/forms/mitarbeiter-stammdaten-edit-form'
import ErrorSectionTw from '@/components/molecules/error-section-tw'
import InfoSectionTw from '@/components/molecules/info-section-tw'
import { DefaultModal } from '@/components/organisms/default-modal'
import useAsyncEffect from '@/hooks/use-async-effect'
import { ROLE } from '@/lib/constants/role-constants'
import { StammdatenEntry } from '@/lib/interfaces/mitarbeiter'
import { executeGET, executePOST } from '@/lib/utils/gateway-utils'
import { showErrorMessage, showSuccess } from '@/lib/utils/toast-utils'
import useUserStore from '@/stores/user-store'

const Page = () => {
  const { hasSomeRole } = useUserStore()
  const { personalnummer } = useParams<{ personalnummer: string }>()
  const [mitarbeiterStammdaten, setMitarbeiterStammdaten] =
    useState<StammdatenEntry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitCallback, setSubmitCallback] = useState<
    (() => Promise<void>) | null
  >(null)
  const t = useTranslations('mitarbeiter.bearbeiten')

  useAsyncEffect(async () => {
    if (personalnummer) {
      try {
        const { data } = await executeGET<{
          stammdaten: StammdatenEntry[]
        }>(`/mitarbeiter/stammdaten/edit/${personalnummer}`)

        if (data?.stammdaten[0]) {
          setMitarbeiterStammdaten(data.stammdaten[0])
        }
      } catch (e) {
        showErrorMessage(e)
      } finally {
        setIsLoading(false)
      }
    }
  }, [])

  const onShowModal = useCallback(
    (formValues: StammdatenEntry) => {
      const handleSubmit = async () => {
        setIsLoading(true)

        try {
          const { data } = await executePOST<{
            stammdaten: StammdatenEntry[]
          }>(`/mitarbeiter/stammdaten/edit/${personalnummer}`, formValues)

          if (data?.stammdaten[0]) {
            setMitarbeiterStammdaten(data?.stammdaten[0])
          }
          showSuccess(t('stammdaten.message.success'))
        } catch (e) {
          showErrorMessage(e)
        } finally {
          setIsLoading(false)
          setShowModal(false)
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

  if (!mitarbeiterStammdaten) {
    if (isLoading) {
      return <LoaderWithSpacer />
    }

    return (
      <ErrorSectionTw
        description={t('stammdaten.error.noStammdaten')}
        linkText={t('stammdaten.link.backToOverview')}
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
      <MitarbeiterStammdatenEditForm
        personalnummer={personalnummer as string}
        submitHandler={onShowModal}
        stammDaten={mitarbeiterStammdaten}
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
            description={t('stammdaten.info.preSaveNotification')}
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
