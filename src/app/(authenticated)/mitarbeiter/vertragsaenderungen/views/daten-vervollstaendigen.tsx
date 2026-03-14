'use client'

import { useTranslations } from 'next-intl'
import { useCallback, useState } from 'react'

import BasisDatenVertragsdatenForm from './basisdaten-vertragsdaten-form'
import { VertragsaenderungEntry } from '../vertragsaenderungen-utils'
import HorizontalRow from '@/components/atoms/hr-tw'
import useAsyncEffect from '@/hooks/use-async-effect'
import { VertragsdatenEntry } from '@/lib/interfaces/mitarbeiter'
import { Workflow, WorkflowItem } from '@/lib/interfaces/workflow'
import { executeGET, executePOST } from '@/lib/utils/gateway-utils'
import {
  getSortedWorkflowItems,
  getWorkflowItemsFromWorkflow,
} from '@/lib/utils/mitarbeiter/workflow-utils'
import { showErrorMessage } from '@/lib/utils/toast-utils'

export default function DatenVervollstaendigen({
  setWorkflowItems,
  vertragsdatenAenderungId,
}: {
  setWorkflowItems: React.Dispatch<React.SetStateAction<WorkflowItem[]>>
  vertragsdatenAenderungId: string
}) {
  const t = useTranslations('mitarbeiterVertragsaenderungen.detail')

  const [isLoading, setIsLoading] = useState(true)
  const [vertragsDaten, setVertragsdaten] = useState<VertragsdatenEntry | null>(
    null
  )
  const [vertragsAenderung, setVertragsAenderung] =
    useState<VertragsaenderungEntry | null>(null)

  // reusable helper method to update state
  const updateStateFromResponse = useCallback(
    (data: {
      vertragsaenderung: VertragsaenderungEntry[]
      vertragsdaten: VertragsdatenEntry[]
      workflowgroup: Workflow[]
    }) => {
      if (data) {
        const {
          vertragsaenderung: [latestVertragsaenderung],
          vertragsdaten: [latestVertragsdaten],
          workflowgroup: latestWorkflowGroup,
        } = data

        if (latestVertragsaenderung) {
          setVertragsAenderung(latestVertragsaenderung)
        }

        if (latestVertragsdaten) {
          setVertragsdaten(latestVertragsdaten)
        }

        if (setWorkflowItems && latestWorkflowGroup) {
          const workflowItems = getSortedWorkflowItems(
            getWorkflowItemsFromWorkflow(latestWorkflowGroup)
          )
          setWorkflowItems(workflowItems)
        }
      } else {
        throw new Error('Daten konnten nicht geladen werden')
      }
    },
    [setWorkflowItems]
  )

  useAsyncEffect(async () => {
    if (vertragsdatenAenderungId) {
      try {
        const response = await executeGET<{
          vertragsaenderung: VertragsaenderungEntry[]
          vertragsdaten: VertragsdatenEntry[]
          workflowgroup: Workflow[]
        }>(
          `/ma-verwalten/vertragsaenderung?vertragsaenderungId=${vertragsdatenAenderungId}`
        )
        if (response.data) {
          updateStateFromResponse(response.data)
        }
      } catch (e) {
        showErrorMessage(e)
      }
      setIsLoading(false)
    }
  }, [])

  const onFormSave = async (payload: {
    vertragsdatenDto: Partial<VertragsdatenEntry>
    vertragsaenderungDto: Partial<VertragsaenderungEntry>
  }) => {
    try {
      setIsLoading(true)

      const response = await executePOST<{
        vertragsaenderung: VertragsaenderungEntry[]
        vertragsdaten: VertragsdatenEntry[]
        workflowgroup: Workflow[]
      }>('/ma-verwalten/vertragsaenderung', payload)
      if (response.data) {
        updateStateFromResponse(response.data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <h2 className="mb-6 text-3xl font-semibold tracking-tight text-gray-900">
        {t('labels.datenVervollstaendigen')}
      </h2>
      <HorizontalRow className="mb-6" />
      <BasisDatenVertragsdatenForm
        vertragsDaten={vertragsDaten}
        vertragsAenderung={vertragsAenderung}
        isLoading={isLoading}
        onSubmitHandler={onFormSave}
      />
    </>
  )
}
