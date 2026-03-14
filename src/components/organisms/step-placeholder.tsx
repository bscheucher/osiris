'use client'

import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import { useTranslations } from 'next-intl'
import { twMerge } from 'tailwind-merge'

import { STEP_STATUS } from '@/lib/constants/mitarbeiter-constants'
import { WorkflowItem } from '@/lib/interfaces/workflow'
import { formatDate } from '@/lib/utils/date-utils'

interface Props {
  title?: string
  workflowItem: WorkflowItem | null
  withBackground?: boolean
}

const StepPlaceholder = ({ title, workflowItem, withBackground }: Props) => {
  const t = useTranslations('mitarbeiter.erfassen.step.placeholder')
  const renderStatusText = () => {
    switch (workflowItem?.workflowItemStatus) {
      case STEP_STATUS.NEW:
        return (
          <>
            <ClockIcon className="mb-8 h-12 w-12 text-gray-600" />
            <p>{t('wartet')}</p>
          </>
        )
      case STEP_STATUS.INPROGRESS:
        return (
          <>
            <ClockIcon className="text-ibis-yellow mb-8 h-12 w-12" />
            <p>{t('inArbeit')}</p>
          </>
        )
      case STEP_STATUS.COMPLETED:
        return (
          <>
            <CheckCircleIcon className="mb-8 h-12 w-12 text-emerald-600" />
            <p>
              {t('duchgefuehrtDurch')} {workflowItem?.changedBy}{' '}
              {workflowItem?.changedOn != null
                ? t('am') +
                  ' ' +
                  formatDate(
                    new Date(workflowItem.changedOn),
                    'DD.MM.YYYY, HH:mm'
                  )
                : ''}
            </p>
          </>
        )
      case STEP_STATUS.ERROR:
        return (
          <>
            <XCircleIcon className="mb-8 h-12 w-12 text-red-600" />
            <p>
              {t('fehlgeschlagenDurch')} {workflowItem?.changedBy}{' '}
              {workflowItem?.changedOn != null
                ? t('am') +
                  ' ' +
                  formatDate(
                    new Date(workflowItem.changedOn),
                    'DD.MM.YYYY, HH:mm'
                  )
                : ''}
            </p>
          </>
        )
      default:
        return null
    }
  }
  return (
    <div className="flex flex-[0_1_auto] flex-col">
      {title && (
        <div className="mb-8 flex items-center">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
            {title}
          </h2>
        </div>
      )}
      <div
        className={twMerge(
          'relative flex max-w-lg flex-col items-center rounded-lg',
          withBackground && 'bg-white p-8 shadow'
        )}
      >
        {renderStatusText()}
      </div>
    </div>
  )
}

export default StepPlaceholder
