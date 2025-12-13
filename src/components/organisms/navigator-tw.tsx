'use client'

import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { useTranslations } from 'next-intl'
import React, { ReactNode, useCallback, useMemo } from 'react'
import { twMerge } from 'tailwind-merge'

import { BlockingAwareLink } from '@/components/atoms/blocking-aware-link'
import { STEP_STATUS } from '@/lib/constants/mitarbeiter-constants'
import { WorkflowItem } from '@/lib/interfaces/workflow'
import { formatDate } from '@/lib/utils/date-utils'

const NavigatorLink = ({
  wfi,
  disabled,
  children,
}: {
  wfi: number
  disabled: boolean
  children: ReactNode
}) => {
  if (disabled) {
    return <>{children}</>
  }

  return <BlockingAwareLink href={`?wfi=${wfi}`}>{children}</BlockingAwareLink>
}

function NavigatorStep({
  status,
  title,
  changedBy,
  changedOn,
  isLast = false,
}: {
  status: STEP_STATUS
  title: string
  changedBy?: string
  changedOn?: string
  isLast: boolean
}) {
  const t = useTranslations('mitarbeiter.erfassen.navigator')
  const statusChangedBy: string = `${changedBy ? `${t('text.durch')} ${changedBy}` : ''}`
  const statusChangedOn = `${
    changedOn
      ? ` ${t('text.am')} ${formatDate(new Date(changedOn), 'DD.MM.YY, HH:mm')}`
      : ''
  }`
  const getSeparatorColor = useCallback((status: STEP_STATUS) => {
    if (status === STEP_STATUS.COMPLETED) {
      return 'bg-green-600'
    } else if (status === STEP_STATUS.INPROGRESS) {
      return 'bg-ibis-yellow'
    } else if (status === STEP_STATUS.ERROR) {
      return 'bg-red-600'
    }
    return 'bg-gray-300'
  }, [])

  const icon = useMemo(() => {
    if (status === STEP_STATUS.INPROGRESS) {
      return (
        <span
          className="border-ibis-yellow relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white"
          data-testid={`${title}-inprogress`}
        >
          <span className="bg-ibis-yellow h-2.5 w-2.5 rounded-full" />
        </span>
      )
    } else if (status === STEP_STATUS.COMPLETED) {
      return (
        <span
          className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-green-600 group-hover:bg-green-800"
          data-testid={`${title}-completed`}
        >
          <CheckIcon className="h-5 w-5 text-white" aria-hidden="true" />
        </span>
      )
    } else if (status === STEP_STATUS.ERROR) {
      return (
        <span
          className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 group-hover:bg-red-700"
          data-testid={`${title}-error`}
        >
          <XMarkIcon className="h-5 w-5 text-white" aria-hidden="true" />
        </span>
      )
    }

    return (
      <span
        className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white group-hover:border-gray-400"
        data-testid={`${title}-new`}
      >
        <span className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-gray-300" />
      </span>
    )
  }, [status, title])

  return (
    <>
      {!isLast ? (
        <div
          className={`absolute top-4 left-4 mt-0.5 -ml-px h-full w-0.5 ${getSeparatorColor(
            status
          )}`}
          aria-hidden="true"
        />
      ) : null}
      <div className="group relative flex items-center">
        <span className="flex h-9 items-center">{icon}</span>
        <span className="ml-4 flex min-w-0 flex-col">
          <span className="text-sm font-medium" data-testid={title}>
            {title}
          </span>
          {status !== STEP_STATUS.NEW && statusChangedBy && statusChangedOn && (
            <span className="text-sm text-gray-500">
              <span className="block 2xl:inline">{statusChangedBy}</span>
              <span className="block 2xl:inline">{statusChangedOn}</span>
            </span>
          )}
        </span>
      </div>
    </>
  )
}

export default function NavigatorTw({
  workflowItems,
}: {
  workflowItems: WorkflowItem[] | null
}) {
  const isDebugEnabled = process.env.NEXT_PUBLIC_DEBUG_MODE

  return (
    <nav aria-label="Progress">
      <ol className="overflow-hidden">
        {workflowItems?.map((item, index) => {
          const isDisabled =
            !isDebugEnabled && item.workflowItemStatus === STEP_STATUS.NEW

          return (
            <li
              key={index}
              className={twMerge(
                'relative pb-8',
                isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
              )}
              data-testid={`navigator-item-${item.referenceWorkflowItemId}`}
            >
              <NavigatorLink
                wfi={item.referenceWorkflowItemId}
                disabled={isDisabled}
              >
                <NavigatorStep
                  title={item.workflowItemName}
                  status={item.workflowItemStatus}
                  isLast={index === workflowItems.length - 1}
                  changedOn={item.changedOn}
                  changedBy={item.changedBy}
                />
              </NavigatorLink>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
