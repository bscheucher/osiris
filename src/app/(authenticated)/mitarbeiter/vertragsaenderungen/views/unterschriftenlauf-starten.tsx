'use client'

import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

import ButtonTw from '@/components/atoms/button-tw'
import HorizontalRow from '@/components/atoms/hr-tw'
import InfoSectionTw from '@/components/molecules/info-section-tw'
import useAsyncEffect from '@/hooks/use-async-effect'
import { VertragsdatenEntry } from '@/lib/interfaces/mitarbeiter'
import { Workflow, WorkflowItem } from '@/lib/interfaces/workflow'
import { executeGET, executePOST } from '@/lib/utils/gateway-utils'
import {
  getSortedWorkflowItems,
  getWorkflowItemsFromWorkflow,
} from '@/lib/utils/mitarbeiter/workflow-utils'
import {
  showError,
  showErrorMessage,
  showSuccess,
} from '@/lib/utils/toast-utils'

interface Props {
  setWorkflowItems: React.Dispatch<React.SetStateAction<WorkflowItem[]>>
  vertragsdatenAenderungId: string
}
const UnterschriftenlaufStarten = ({
  vertragsdatenAenderungId,
  setWorkflowItems,
}: Props) => {
  const t = useTranslations(
    'mitarbeiterVertragsaenderungen.detail.unterschriftenlaufStarten'
  )
  const [isLoading, setIsLoading] = useState(true)
  const [personalnummer, setPersonalnummer] = useState<null | string>(null)

  useAsyncEffect(async () => {
    try {
      const { data } = await executeGET<{
        vertragsaenderung: VertragsdatenEntry[]
        workflowgroup: Workflow[]
      }>(
        `/ma-verwalten/vertragsaenderung?vertragsaenderungId=${vertragsdatenAenderungId}`
      )

      if (data?.vertragsaenderung[0].personalnummer) {
        setPersonalnummer(data.vertragsaenderung[0].personalnummer)
      } else {
        throw new Error('Die Personalnummer konnte nicht geladen werden.')
      }

      if (setWorkflowItems && data?.workflowgroup) {
        const workflowItems = getSortedWorkflowItems(
          getWorkflowItemsFromWorkflow(data?.workflowgroup)
        )

        setWorkflowItems(workflowItems)
      }
    } catch (e) {
      showError(t('error.laden'))
    }
    setIsLoading(false)
  }, [])

  const onClickHandler = async () => {
    setIsLoading(true)

    try {
      const { data } = await executePOST<{
        moxis: any
        workflowgroup: Workflow[]
      }>(
        `/mitarbeiter/sendMoxisSigningRequest?personalnummer=${personalnummer}`
      )

      if (setWorkflowItems && data?.workflowgroup) {
        const workflowItems = getSortedWorkflowItems(
          getWorkflowItemsFromWorkflow(data?.workflowgroup)
        )
        setWorkflowItems(workflowItems)
      }
      showSuccess(t('label.success'))
    } catch (e) {
      showErrorMessage(e)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col space-y-8">
      <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
        {t('label.unterschriftenlaufStarten')}
      </h2>
      <div className="mb-8">
        <InfoSectionTw
          description={t('label.infoDescripton')}
          testId="unterschriftenlaufStarten-infoText"
        />
      </div>
      <HorizontalRow />

      <ButtonTw
        onClick={onClickHandler}
        isLoading={isLoading}
        size="xlarge"
        testId="unterschriftenlaufStarten-button"
      >
        {t('label.unterschriftenlaufStarten')}
      </ButtonTw>
    </div>
  )
}

export default UnterschriftenlaufStarten
