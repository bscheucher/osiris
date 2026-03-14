'use client'

import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import ButtonTw from '@/components/atoms/button-tw'
import ErrorSectionTw from '@/components/molecules/error-section-tw'
import { STEP_STATUS } from '@/lib/constants/mitarbeiter-constants'
import {
  Workflow,
  WorkflowItem,
  WorkflowItemData,
} from '@/lib/interfaces/workflow'
import { formatDate } from '@/lib/utils/date-utils'
import { executePOST } from '@/lib/utils/gateway-utils'
import { showError, showSuccess } from '@/lib/utils/toast-utils'
import useOnboardingStore from '@/stores/onboarding-store'

interface Props {
  personalnummer: string
  workflowItem: WorkflowItem | null
}

const getErrorMessageFromData = (
  t: (key: string) => string,
  data?: WorkflowItemData | string
) => {
  switch (data) {
    case WorkflowItemData.SIGNATURE_DENIED:
      return t('step.unterschriftenlauf.errorStatus.signature_denied')
    case WorkflowItemData.TIMEOUT:
      return t('step.unterschriftenlauf.errorStatus.timeout')
    case WorkflowItemData.CANCELLED:
      return t('step.unterschriftenlauf.errorStatus.cancelled')
    default:
      return t('step.unterschriftenlauf.errorStatus.error')
  }
}

const UnterschriftenlaufDurchfuehren = ({
  personalnummer,
  workflowItem,
}: Props) => {
  const t = useTranslations('mitarbeiter.erfassen')
  const [isLoading, setIsLoading] = useState(false)
  const { setWorkflowItemsFromWorkflow } = useOnboardingStore()

  const onClickHandler = async () => {
    try {
      setIsLoading(true)

      const response = await executePOST<{
        moxis: any
        workflowgroup: Workflow[]
      }>(
        `/mitarbeiter/cancelMoxisSigningRequest?personalnummer=${personalnummer}`
      )
      if (response.data?.workflowgroup) {
        setWorkflowItemsFromWorkflow(response.data.workflowgroup)
      }

      showSuccess(t('unterschriftenlaufDurchfuehren.message.success'))
    } catch (e) {
      console.error(e)
      showError(t('unterschriftenlaufDurchfuehren.message.error'))
    } finally {
      setIsLoading(false)
    }
  }

  const renderStatusText = () => {
    switch (workflowItem?.workflowItemStatus) {
      case STEP_STATUS.INPROGRESS:
        return (
          <>
            <div className="flex flex-col items-center">
              <ClockIcon className="text-ibis-yellow mb-8 h-12 w-12" />
              <p>
                {t('step.unterschriftenlauf.inArbeit')}
                {workflowItem?.changedOn != null
                  ? ', ' +
                    formatDate(
                      new Date(workflowItem.changedOn),
                      'DD.MM.YYYY, HH:mm'
                    )
                  : ''}
              </p>
            </div>
            <br />
            <p className="mb-8">{t('step.unterschriftenlauf.text.inArbeit')}</p>
            <ButtonTw
              onClick={onClickHandler}
              testId="unterschriftenlaufDurchführen-cancel-button"
              disabled={isLoading}
              isLoading={isLoading}
            >
              {t('unterschriftenlaufDurchfuehren.cancel')}
            </ButtonTw>
          </>
        )
      case STEP_STATUS.COMPLETED:
        return (
          <div className="flex flex-col items-center">
            <CheckCircleIcon className="mb-8 h-12 w-12 text-emerald-600" />
            <p>
              {t('step.unterschriftenlauf.erfolgreich')}
              {workflowItem?.changedOn != null
                ? ' ' +
                  t('step.placeholder.am') +
                  ' ' +
                  formatDate(
                    new Date(workflowItem.changedOn),
                    'DD.MM.YYYY, HH:mm'
                  )
                : ''}
            </p>
          </div>
        )
      case STEP_STATUS.ERROR:
        return (
          <div className="flex flex-col items-center">
            <XCircleIcon className="mb-8 h-12 w-12 text-red-600" />
            <ErrorSectionTw
              testId="unterschriftenlauf-error-section"
              description={
                <>
                  <span className="block">
                    {getErrorMessageFromData(t, workflowItem?.data)}
                  </span>
                  <span className="mt-2 block">
                    {!!workflowItem?.changedOn &&
                      `${t('step.unterschriftenlauf.timestamp')}: ${formatDate(
                        new Date(workflowItem.changedOn),
                        'DD.MM.YYYY, HH:mm'
                      )}`}
                  </span>
                </>
              }
            />
          </div>
        )
      default:
        return (
          <>
            <div className="flex flex-col items-center">
              <ClockIcon className="mb-8 h-12 w-12 text-gray-500" />
            </div>
          </>
        )
    }
  }

  return (
    <div className="flex max-w-lg flex-col">
      <h2 className="mb-10 text-3xl font-semibold tracking-tight text-gray-900">
        {t('title.unterschriftenlaufDurchfuehren')}
      </h2>
      <div className="relative flex max-w-lg flex-col rounded-lg bg-white px-12 py-12 shadow">
        {renderStatusText()}
      </div>
    </div>
  )
}

export default UnterschriftenlaufDurchfuehren
