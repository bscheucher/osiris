'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import LoaderWithOverlay from '@/components/atoms/loader-with-overlay'
import TeilnehmerStammdatenEditForm from '@/components/forms/teilnehmer-stammdaten-edit-form'
import useAsyncEffect from '@/hooks/use-async-effect'
import { StammdatenEntry } from '@/lib/interfaces/mitarbeiter'
import { Workflow } from '@/lib/interfaces/workflow'
import { executeGET, executePOST } from '@/lib/utils/gateway-utils'
import { isTNOnboardingReadOnly } from '@/lib/utils/mitarbeiter/workflow-utils'
import { showErrorMessage, showSuccess } from '@/lib/utils/toast-utils'
import useOnboardingStore from '@/stores/onboarding-store'

export default function TeilnehmerStammdatenErfassenView({
  personalnummer,
}: {
  personalnummer: string
}) {
  const { setWorkflowItemsFromWorkflow, workflowItems } = useOnboardingStore()
  const t = useTranslations('mitarbeiter.erfassen')
  const [isLoading, setIsLoading] = useState(true)
  const [stammDaten, setStammDaten] = useState<StammdatenEntry | null>(null)

  useAsyncEffect(async () => {
    if (personalnummer) {
      try {
        const response = await executeGET<{
          stammdaten: StammdatenEntry[]
          workflowgroup: Workflow[]
        }>(`/mitarbeiter/stammdaten/edit/${personalnummer}?isOnboarding=true`)

        if (
          response.data?.workflowgroup &&
          response.data.workflowgroup.length
        ) {
          setWorkflowItemsFromWorkflow(response.data.workflowgroup)
        }

        if (response.data?.stammdaten[0]) {
          setStammDaten(response.data?.stammdaten[0])
        }
      } catch (e) {
        showErrorMessage(e)
      }
      setIsLoading(false)
    }
  }, [])

  // standard submission event
  const onSubmit = async (data: StammdatenEntry) => {
    setIsLoading(true)

    try {
      if (workflowItems && workflowItems[0]?.workflowItemId) {
        const response = await executePOST<{
          stammdaten: StammdatenEntry[]
          workflowgroup: Workflow[]
        }>(
          `/mitarbeiter/stammdaten/edit/${personalnummer}?isOnboarding=true`,
          data
        )

        if (
          response.data?.workflowgroup &&
          response.data.workflowgroup.length
        ) {
          setWorkflowItemsFromWorkflow(response.data.workflowgroup)
        }

        if (response.data?.stammdaten[0]) {
          setStammDaten(response.data?.stammdaten[0])
        }
        showSuccess(t('stammdaten.message.success'))
      }
    } catch (e) {
      showErrorMessage(e)
    }
    setIsLoading(false)
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-3xl font-semibold tracking-tight text-gray-900">
          {t('stammdaten.title')}
        </h2>
      </div>
      <div className="relative min-h-[760px] rounded-lg bg-white px-12 py-12 shadow">
        {isLoading && <LoaderWithOverlay />}

        {stammDaten && (
          <TeilnehmerStammdatenEditForm
            personalnummer={personalnummer}
            submitHandler={onSubmit}
            stammDaten={stammDaten}
            isReadOnly={isTNOnboardingReadOnly(workflowItems)}
          />
        )}
      </div>
    </div>
  )
}
