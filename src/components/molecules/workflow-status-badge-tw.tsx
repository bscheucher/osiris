import { useTranslations } from 'next-intl'
import { ComponentPropsWithoutRef } from 'react'

import BadgeTw, { BadgeColor } from '../atoms/badge-tw'
import { WorkflowItem } from '@/lib/interfaces/workflow'
import { getColorFromStatus } from '@/lib/utils/mitarbeiter/workflow-utils'

type WorkflowStatusBadgeProps = {
  workflowItem: WorkflowItem | null
}

export const WorkflowStatusBadge = ({
  workflowItem,
  ...props
}: WorkflowStatusBadgeProps & ComponentPropsWithoutRef<typeof BadgeTw>) => {
  const t = useTranslations('components.workflowStatusBadge')

  if (!workflowItem) {
    return (
      <BadgeTw color={BadgeColor.Gray} {...props}>
        {t('finished')}
      </BadgeTw>
    )
  }

  return (
    <BadgeTw
      color={getColorFromStatus(workflowItem.workflowItemStatus)}
      {...props}
    >
      {workflowItem.workflowItemName}
    </BadgeTw>
  )
}
