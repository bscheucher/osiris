'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import LoaderWithOverlay from '@/components/atoms/loader-with-overlay'
import TeilnehmerVertragsdatenEditForm from '@/components/forms/teilnehmer-vertragsdaten-edit-form'
import useAsyncEffect from '@/hooks/use-async-effect'
import { VertragsdatenEntry } from '@/lib/interfaces/mitarbeiter'
import { Workflow } from '@/lib/interfaces/workflow'
import { executeGET, executePOST } from '@/lib/utils/gateway-utils'
import { isTNOnboardingReadOnly } from '@/lib/utils/mitarbeiter/workflow-utils'
import { showErrorMessage, showSuccess } from '@/lib/utils/toast-utils'
import useOnboardingStore from '@/stores/onboarding-store'

export default function TeilnehmerVertragsdatenErfassenView({
  personalnummer,
}: {
  personalnummer: string
}) {
  const { setWorkflowItemsFromWorkflow, workflowItems } = useOnboardingStore()
  const t = useTranslations('mitarbeiter.erfassen')

  const [isLoading, setIsLoading] = useState(true)
  const [vertragsDaten, setVertragsdaten] = useState<VertragsdatenEntry | null>(
    null
  )

  useAsyncEffect(async () => {
    if (personalnummer) {
      try {
        const response = await executeGET<{
          vertragsdaten: VertragsdatenEntry[]
          workflowgroup: Workflow[]
        }>(
          `/mitarbeiter/vertragsdaten/edit/${personalnummer}?isOnboarding=true`
        )

        if (response.data?.workflowgroup && response.data.workflowgroup) {
          setWorkflowItemsFromWorkflow(response.data.workflowgroup)
        }

        if (response.data?.vertragsdaten[0]) {
          setVertragsdaten(response.data?.vertragsdaten[0])
        }
      } catch (e) {
        showErrorMessage(e)
      }
      setIsLoading(false)
    }
  }, [])

  // standard submission event
  const onSubmit = async (data: VertragsdatenEntry) => {
    setIsLoading(true)

    try {
      if (workflowItems && workflowItems[0]?.workflowItemId) {
        const response = await executePOST<{
          vertragsdaten: VertragsdatenEntry[]
          workflowgroup: Workflow[]
        }>(
          `/mitarbeiter/vertragsdaten/edit/${personalnummer}?isOnboarding=true`,
          data
        )

        if (
          response.data?.workflowgroup &&
          response.data?.workflowgroup.length
        ) {
          setWorkflowItemsFromWorkflow(response.data?.workflowgroup)
        }

        if (response.data?.vertragsdaten[0]) {
          setVertragsdaten(response.data?.vertragsdaten[0])
        }
        showSuccess(t('vertragsdaten.message.success.save'))
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
          {t('vertragsdaten.title')}
        </h2>
      </div>
      <div className="relative min-h-[760px] rounded-lg bg-white px-12 py-12 shadow">
        {isLoading && <LoaderWithOverlay />}

        {vertragsDaten && (
          <TeilnehmerVertragsdatenEditForm
            personalnummer={personalnummer}
            submitHandler={onSubmit}
            vertragsDaten={vertragsDaten}
            isReadOnly={isTNOnboardingReadOnly(workflowItems)}
          />
        )}
      </div>
    </div>
  )
}
