'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useCallback, useState } from 'react'

import {
  DOKUMENT_SPEICHERN_WFI_ID,
  isVereinbarungEditComplete,
  UNTERSCHRIFTENLAUF_WFI_ID,
  VEREINBARUNG_EDIT_WFI_ID,
} from '../vereinbarungen-utils'
import DocumentPreview from '../views/document-preview'
import UnterschriftenlaufAbbrechen from '../views/unterschriftenlauf-abbrechen'
import VereinbarungBearbeitenForm from '../views/vereinbarung-bearbeiten-form'
import LoaderTw, { LoaderSize } from '@/components/atoms/loader-tw'
import { LayoutWrapper } from '@/components/molecules/layout-wrapper'
import NavigatorTw from '@/components/organisms/navigator-tw'
import StepPlaceholder from '@/components/organisms/step-placeholder'
import useAsyncEffect from '@/hooks/use-async-effect'
import { Workflow, WorkflowItem } from '@/lib/interfaces/workflow'
import { executeGET } from '@/lib/utils/gateway-utils'
import {
  getSortedWorkflowItems,
  getWorkflowItemByReferenceId,
  getWorkflowItemsFromWorkflow,
} from '@/lib/utils/mitarbeiter/workflow-utils'

export default function Page() {
  const t = useTranslations('mitarbeiterVereinbarungen.detail')
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const wfiSearchParam = searchParams.get('wfi') || ''
  const [isLoading, setIsLoading] = useState(true)

  const [workflowItems, setWorkflowItems] = useState<WorkflowItem[]>([])
  const isVereinbarungSigned = isVereinbarungEditComplete(workflowItems)

  const updateWorkflowGroup = useCallback((workflowgroup?: Workflow[]) => {
    if (workflowgroup) {
      const workflowItems = getSortedWorkflowItems(
        getWorkflowItemsFromWorkflow(workflowgroup)
      )
      setWorkflowItems(workflowItems)
    }
  }, [])

  useAsyncEffect(async () => {
    const { data } = await executeGET<{ workflowgroup: Workflow[] }>(
      `/vereinbarung/getWorkflowgroup?vereinbarungId=${id}`
    )

    if (data?.workflowgroup) {
      updateWorkflowGroup(data?.workflowgroup)
    }

    setIsLoading(false)
  }, [])

  const getStepByWfi = () => {
    switch (parseInt(wfiSearchParam)) {
      case VEREINBARUNG_EDIT_WFI_ID:
        return (
          <VereinbarungBearbeitenForm
            vereinbarungId={id}
            updateWorkflowGroup={updateWorkflowGroup}
            isSigned={isVereinbarungSigned}
          />
        )
      case UNTERSCHRIFTENLAUF_WFI_ID:
        return (
          <UnterschriftenlaufAbbrechen
            vereinbarungId={id}
            updateWorkflowGroup={updateWorkflowGroup}
          />
        )
      case DOKUMENT_SPEICHERN_WFI_ID:
        return (
          <DocumentPreview
            vereinbarungId={id}
            updateWorkflowGroup={updateWorkflowGroup}
          />
        )
      default: {
        const wfi = getWorkflowItemByReferenceId(
          workflowItems,
          parseInt(wfiSearchParam)
        )
        return wfi ? (
          <StepPlaceholder workflowItem={wfi} />
        ) : (
          <StepPlaceholder title={'keinStatus'} workflowItem={wfi} />
        )
      }
    }
  }

  return (
    <LayoutWrapper
      className="2xl:max-w-8xl max-w-6xl"
      title={t('label.headline')}
    >
      {isLoading ? (
        <div className="flex h-[760px] items-center justify-center">
          <LoaderTw size={LoaderSize.XLarge} />
        </div>
      ) : (
        <div className="flex gap-12">
          <div
            id="navigator-container"
            className="flex-[0_0_300px] border-r border-gray-200 pr-8"
            data-testid="navigator-container"
          >
            {workflowItems && <NavigatorTw workflowItems={workflowItems} />}
          </div>
          <div className="flex flex-[1_1_auto]">{getStepByWfi()}</div>
        </div>
      )}
    </LayoutWrapper>
  )
}
