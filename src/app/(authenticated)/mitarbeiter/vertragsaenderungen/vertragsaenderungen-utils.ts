import { FieldChange } from '@/components/molecules/field-changes'
import { ErrorsResponse } from '@/lib/interfaces/mitarbeiter'

export interface VertragsaenderungEntry extends ErrorsResponse {
  id?: number
  gueltigAb: string
  interneAnmerkung: string
  offizielleBemerkung: string
  personalnummer?: string
  antragssteller: string
  lhrEmails: string[]
  peopleEmails: string[]
  genehmigendenEmails: string[]
  empfaengerkreis: string[]
  fieldChanges: FieldChange[]
}
