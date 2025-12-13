import { WorkflowItem } from '@/lib/interfaces/workflow'

export interface Mitarbeiter {
  vorname: string
  nachname: string
  svnr: string
  personalnummer: string
  eintritt: string
  kostenstelle: string
}

export interface MitarbeiterWithWorkflow extends Mitarbeiter {
  workflowItem: WorkflowItem | null
}

export type SortDirection = 'ASC' | 'DESC'
