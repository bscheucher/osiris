import { BadgeColor } from '@/components/atoms/badge-tw'
import { STEP_NAME, STEP_STATUS } from '@/lib/constants/mitarbeiter-constants'
import { Workflow, WorkflowItem } from '@/lib/interfaces/workflow'

export const getWorkflowItemStatus = (
  name: string,
  workflowItems: WorkflowItem[] | null
) =>
  workflowItems
    ? workflowItems.find((item) => item.workflowItemName === name)
        ?.workflowItemStatus
    : null

export const isWorkflowCompleted = (
  workflows: Workflow[],
  workflowName: string
): boolean => {
  const workflowStatus = workflows?.find(
    (workflow) => workflow.workflowName === workflowName
  )?.workflowStatus

  return workflowStatus === STEP_STATUS.COMPLETED
}

export const getWorkflowItemsFromWorkflow = (
  workflows: Workflow[]
): WorkflowItem[] => workflows.flatMap((workflow) => workflow.workflowItems)

export const getSortedWorkflows = (workflows: Workflow[]): Workflow[] =>
  workflows.sort((a, b) => a.referenceWorkflowId - b.referenceWorkflowId)

export const getSortedWorkflowItems = (
  workflowItems: WorkflowItem[]
): WorkflowItem[] =>
  workflowItems.sort(
    (a, b) => a.referenceWorkflowItemId - b.referenceWorkflowItemId
  )

export const getActiveWorkflow = (workflows: Workflow[]): Workflow | null => {
  const sortedWorkflows = getSortedWorkflows(workflows)
  const reversedWorkflows = [...sortedWorkflows].reverse()

  return reversedWorkflows.find((item) => item.workflowStatus === 'NEW') || null
}

export const getWorkflowItemByReferenceId = (
  workflowItems: WorkflowItem[] | null,
  referenceId: number
) => {
  return (
    workflowItems?.find(
      (item) => item.referenceWorkflowItemId === referenceId
    ) || null
  )
}

export const getWorkflowItemByName = (
  workflowItems: WorkflowItem[] | null,
  itemName: STEP_NAME
): WorkflowItem | null =>
  workflowItems?.find(
    (item: WorkflowItem) => item.workflowItemName === itemName
  ) || null

export const isMAOnboardingReadOnly = (
  workflowItems: WorkflowItem[] | null
): boolean => {
  const wfi = getWorkflowItemByName(
    workflowItems,
    STEP_NAME.UNTERSCHRIFTENLAUF_STARTEN
  )

  return !!wfi && wfi.workflowItemStatus === STEP_STATUS.COMPLETED
}

export const isTNOnboardingReadOnly = (
  workflowItems: WorkflowItem[] | null
): boolean => {
  const wfi = getWorkflowItemByName(
    workflowItems,
    STEP_NAME.MITARBEITERDATEN_PRUEFEN_TN
  )

  return !!wfi && wfi.workflowItemStatus === STEP_STATUS.COMPLETED
}

export const getColorFromStatus = (
  status: WorkflowItem['workflowItemStatus']
) => {
  switch (status) {
    case STEP_STATUS.ERROR:
      return BadgeColor.Red
    case STEP_STATUS.INPROGRESS:
      return BadgeColor.Yellow
    case STEP_STATUS.COMPLETED:
      return BadgeColor.Green
    default:
      return BadgeColor.Gray
  }
}
