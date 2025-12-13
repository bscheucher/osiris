import { STEP_NAME, STEP_STATUS } from '@/lib/constants/mitarbeiter-constants'

export enum WorkflowItemData {
  ERROR = 'ERROR',
  SIGNATURE_DENIED = 'SIGNATURE_DENIED',
  TIMEOUT = 'TIMEOUT',
  CANCELLED = 'CANCELLED',
}
export interface Workflow {
  workflowId: number
  referenceWorkflowId: number
  workflowItems: WorkflowItem[]
  workflowName: string
  workflowStatus: STEP_STATUS
  changedOn?: string
  changedBy?: string
}

export interface WorkflowItem {
  workflowItemId: number
  referenceWorkflowItemId: number
  workflowItemName: STEP_NAME | string
  workflowItemStatus: STEP_STATUS
  data?: WorkflowItemData | string
  changedOn?: string
  changedBy?: string
}
