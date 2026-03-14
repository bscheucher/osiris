'use client'

import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

import StepPlaceholder from './step-placeholder'
import ButtonTw, { ButtonSize } from '@/components/atoms/button-tw'
import ErrorSectionTw from '@/components/molecules/error-section-tw'
import InfoSectionTw from '@/components/molecules/info-section-tw'
import { STEP_STATUS } from '@/lib/constants/mitarbeiter-constants'
import { ROLE } from '@/lib/constants/role-constants'
import { Workflow, WorkflowItem } from '@/lib/interfaces/workflow'
import { executePOST } from '@/lib/utils/gateway-utils'
import { showErrorMessage } from '@/lib/utils/toast-utils'
import useOnboardingStore from '@/stores/onboarding-store'
import useUserStore from '@/stores/user-store'

interface Props {
  personalnummer: string
  workflowItem: WorkflowItem | null
}

const LohnverrechnungInformieren = ({
  workflowItem,
  personalnummer,
}: Props) => {
  const t = useTranslations('mitarbeiter.erfassen.lohnverrechnungInformieren')
  const [isLoading, setIsLoading] = useState(false)
  const { setWorkflowItemsFromWorkflow } = useOnboardingStore()
  const { hasSomeRole } = useUserStore()

  const onClickHandler = async () => {
    setIsLoading(true)

    try {
      const response = await executePOST<{ workflowgroup: Workflow[] }>(
        `/mitarbeiter/informLohnverrechnung?personalnummer=${personalnummer}`
      )
      if (response.data?.workflowgroup) {
        setWorkflowItemsFromWorkflow(response.data.workflowgroup)
      }
    } catch (e) {
      showErrorMessage(e)
    } finally {
      setIsLoading(false)
    }
  }

  if (!workflowItem) {
    return null
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-3xl font-semibold tracking-tight text-gray-900">
          {t('labels.title')}
        </h2>
      </div>
      <div className="relative flex max-w-lg flex-col gap-8 rounded-lg bg-white p-8 shadow">
        {hasSomeRole([ROLE.MA_ONBOARDING_LV_INFORMIEREN]) ? (
          workflowItem?.workflowItemStatus === STEP_STATUS.INPROGRESS ? (
            <>
              <InfoSectionTw description={t('labels.info')} />
              <ButtonTw
                onClick={onClickHandler}
                testId="lohnverrechnungInformieren-button"
                size={ButtonSize.XLarge}
                disabled={isLoading}
                isLoading={isLoading}
              >
                {t('labels.start')}
              </ButtonTw>
            </>
          ) : (
            <StepPlaceholder workflowItem={workflowItem} />
          )
        ) : (
          <ErrorSectionTw description={t('labels.keineRechte')} />
        )}
      </div>
    </div>
  )
}

export default LohnverrechnungInformieren
