import { ReportFormField } from '@/components/organisms/dynamic-form-fields'
import { STEP_STATUS } from '@/lib/constants/mitarbeiter-constants'
import { WorkflowItem } from '@/lib/interfaces/workflow'
import { getWorkflowItemByReferenceId } from '@/lib/utils/mitarbeiter/workflow-utils'

export const MOXIS_DELAY_TIMEOUT = 5000

export interface VereinbarungEntry {
  id: number
  vorname: string
  nachname: string
  personalnummer: string
  svnr: string
  gueltigAb: string
  vereinbarungName: string
  status: VereinbarungsStatus
  wfiStatus: VereinbarungsWorkflowStatus
  firma: string
  mitarbeiterId: string
  parameters?: ReportFormField[]
  workflowItem: WorkflowItem
}

export enum VereinbarungsStatus {
  NEW = 'new',
  GENEHMIGT = 'genehmigt',
  ABGELEHNT = 'abgelehnt',
  COMPLETED = 'completed',
  ERROR = 'error',
}

export enum VereinbarungsWorkflowStatus {
  VEREINBARUNG_ERSTELLT = 'VEREINBARUNG_ERSTELLT',
  VEREINBARUNG_VERVOLLSTAENDIGT = 'VEREINBARUNG_VERVOLLSTAENDIGT',
  DOKUMENT_ERSTELLT = 'DOKUMENT_ERSTELLT',
  UNTERSCHRIFTENLAUF_GESTARTET = 'UNTERSCHRIFTENLAUF_GESTARTET',
  UNTERSCHRIFTENLAUF_DURCHGEFUEHRT = 'UNTERSCHRIFTENLAUF_DURCHGEFUEHRT',
  UNTERSCHRIFTENLAUF_GESCHEITERT = 'UNTERSCHRIFTENLAUF_GESCHEITERT',
  UNTERSCHRIEBENES_DOKUMENT_GESPEICHERT = 'UNTERSCHRIEBENES_DOKUMENT_GESPEICHERT',
  UNTERSCHRIEBENES_DOKUMENT_GUELTIG = 'UNTERSCHRIEBENES_DOKUMENT_GUELTIG',
  UNTERSCHRIEBENES_DOKUMENT_GESCHEITERT = 'UNTERSCHRIEBENES_DOKUMENT_GESCHEITERT',
}

export enum VertragsaenderungsStatus {
  ALL = 'ALL',
  NEW = 'NEW',
  CLOSED = 'CLOSED',
  CANCELED = 'CANCELED',
  ERROR = 'ERROR',
  IN_PROGRESS = 'IN_PROGRESS',
}

export interface VertragsaenderungsEntry {
  id: number
  personalnummer: string
  nachname: string
  vorname: string
  svnr: string
  gueltigAb: string
  kostenstelle: string
  status: VertragsaenderungsStatus
  interneAnmerkung: string
}

export const VEREINBARUNG_EDIT_WFI_ID = 38
export const UNTERSCHRIFTENLAUF_WFI_ID = 41
export const DOKUMENT_SPEICHERN_WFI_ID = 42

export const isVereinbarungEditComplete = (
  workflowItems: WorkflowItem[] | null
): boolean => {
  const wfi = getWorkflowItemByReferenceId(
    workflowItems,
    VEREINBARUNG_EDIT_WFI_ID
  )

  return !!wfi && wfi.workflowItemStatus === STEP_STATUS.COMPLETED
}
