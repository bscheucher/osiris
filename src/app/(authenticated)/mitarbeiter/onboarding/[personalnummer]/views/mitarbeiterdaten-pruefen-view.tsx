'use client'

import { useTranslations } from 'next-intl'
import { SyntheticEvent, useState } from 'react'

import MitarbeiterdatenPruefenEditForm, {
  MitarbeiterdatenPruefenFormValues,
} from './mitarbeiterdaten-pruefen-form'
import LoaderTw, { LoaderSize } from '@/components/atoms/loader-tw'
import useAsyncEffect from '@/hooks/use-async-effect'
import { Workflow } from '@/lib/interfaces/workflow'
import {
  executeFileDownload,
  executeGET,
  executePOST,
} from '@/lib/utils/gateway-utils'
import { isMAOnboardingReadOnly } from '@/lib/utils/mitarbeiter/workflow-utils'
import { showErrorMessage, showSuccess } from '@/lib/utils/toast-utils'
import useOnboardingStore from '@/stores/onboarding-store'

export default function MitarbeiterPruefenView({
  personalnummer,
}: {
  personalnummer: string
}) {
  const t = useTranslations('mitarbeiter.erfassen')
  const [isLoading, setIsLoading] = useState(true)
  const [mitarbeiterdaten, setMitarbeiterdaten] =
    useState<MitarbeiterdatenPruefenFormValues | null>(null)
  const { setWorkflowItemsFromWorkflow, workflowItems } = useOnboardingStore()

  useAsyncEffect(async () => {
    setIsLoading(true)

    if (personalnummer) {
      try {
        const response = await executeGET<{
          lvAcceptance: MitarbeiterdatenPruefenFormValues[]
          workflowgroup: Workflow[]
        }>(
          `/mitarbeiter/vertragsdaten/lv-acceptance?personalnummer=${personalnummer}`
        )

        if (response.data?.lvAcceptance[0]) {
          setMitarbeiterdaten({
            ...response.data?.lvAcceptance[0],
            personalnummer,
          })

          if (
            response.data?.workflowgroup &&
            response.data?.workflowgroup.length
          ) {
            setWorkflowItemsFromWorkflow(response.data?.workflowgroup)
          }
        }
      } catch (e) {
        showErrorMessage(e)
      }
      setIsLoading(false)
    }
  }, [])

  const onSubmit = async (data: Partial<MitarbeiterdatenPruefenFormValues>) => {
    try {
      setIsLoading(true)
      data.personalnummer = personalnummer
      const response = await executePOST<{
        lvAcceptance: MitarbeiterdatenPruefenFormValues[]
        workflowgroup: Workflow[]
      }>(`/mitarbeiter/vertragsdaten/lv-acceptance`, data)

      if (response.data?.workflowgroup && response.data?.workflowgroup.length) {
        setWorkflowItemsFromWorkflow(response.data?.workflowgroup)
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
        {mitarbeiterdaten && (
          <MitarbeiterdatenPruefenEditForm
            submitHandler={onSubmit}
            mitarbeiterPruefenData={mitarbeiterdaten}
            handleDownload={handleDownload}
            isReadOnly={isMAOnboardingReadOnly(workflowItems)}
          />
        )}
      </div>
    </div>
  )
}
