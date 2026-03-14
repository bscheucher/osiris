'use client'

import { useTranslations } from 'next-intl'
import { SyntheticEvent, useState } from 'react'

import TeilnehmerdatenPruefenEditForm, {
  TeilnehmerdatenPruefenValues,
} from './teilnehmerdaten-pruefen-edit-form'
import LoaderTw, { LoaderSize } from '@/components/atoms/loader-tw'
import useAsyncEffect from '@/hooks/use-async-effect'
import { Workflow } from '@/lib/interfaces/workflow'
import {
  executeFileDownload,
  executeGET,
  executePOST,
} from '@/lib/utils/gateway-utils'
import { isTNOnboardingReadOnly } from '@/lib/utils/mitarbeiter/workflow-utils'
import { showErrorMessage, showSuccess } from '@/lib/utils/toast-utils'
import useOnboardingStore from '@/stores/onboarding-store'

export default function TeilnehmerdatenPruefenView({
  personalnummer,
}: {
  personalnummer: string
}) {
  const t = useTranslations('mitarbeiter.erfassen')
  const [isLoading, setIsLoading] = useState(true)
  const [teilnehmerPruefenData, setTeilnehmerPruefenData] =
    useState<TeilnehmerdatenPruefenValues | null>(null)
  const { setWorkflowItemsFromWorkflow, workflowItems } = useOnboardingStore()

  useAsyncEffect(async () => {
    setIsLoading(true)

    if (personalnummer) {
      try {
        const { data } = await executeGET<{
          lvAcceptance: TeilnehmerdatenPruefenValues[]
          workflowgroup: Workflow[]
        }>(
          `/mitarbeiter/vertragsdaten/lv-acceptance?personalnummer=${personalnummer}`
        )

        if (data?.lvAcceptance[0]) {
          setTeilnehmerPruefenData({
            ...data?.lvAcceptance[0],
            personalnummer,
          })

          if (data?.workflowgroup && data.workflowgroup.length) {
            setWorkflowItemsFromWorkflow(data.workflowgroup)
          }
        }
      } catch (e) {
        showErrorMessage(e)
      }
      setIsLoading(false)
    }
  }, [])

  const onSubmit = async (
    formValues: Partial<TeilnehmerdatenPruefenValues>
  ) => {
    try {
      setIsLoading(true)
      formValues.personalnummer = personalnummer
      const { data } = await executePOST<{
        lvAcceptance: TeilnehmerdatenPruefenValues[]
        workflowgroup: Workflow[]
      }>(`/mitarbeiter/vertragsdaten/lv-acceptance`, formValues)

      if (data?.workflowgroup) {
        setWorkflowItemsFromWorkflow(data?.workflowgroup)
      }
      showSuccess(t('lvAcceptance.message.success'))
    } catch (e) {
      showErrorMessage(e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async (event: SyntheticEvent, name: string) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      await executeFileDownload(name, personalnummer)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
      showErrorMessage(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-3xl font-semibold tracking-tight text-gray-900">
          {t('title.mitarbeiterdaten')}
        </h2>
      </div>
      <div className="relative min-h-[450px] max-w-[40rem] rounded-lg bg-white px-12 py-12 shadow">
        {isLoading && (
          <div className="absolute top-0 left-0 z-50 flex h-full w-full items-center justify-center rounded-lg bg-white/60">
            <LoaderTw size={LoaderSize.XLarge} />
          </div>
        )}
        {teilnehmerPruefenData && (
          <TeilnehmerdatenPruefenEditForm
            submitHandler={onSubmit}
            teilnehmerPruefenData={teilnehmerPruefenData}
            handleDownload={handleDownload}
            isReadOnly={isTNOnboardingReadOnly(workflowItems)}
          />
        )}
      </div>
    </div>
  )
}
