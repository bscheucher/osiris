import { ROLE } from '../constants/role-constants'

export interface BasicProjectDto {
  projektNumber: number
  project: string
}

export interface ContracDataDto {
  datumVon: string
  datumBis: string
  verwendungsgruppe: string
  stufe: string
  funktion: string
  kst: number
  personalNummer: string
  eintrittsdatum: string
  arbeitszeitmodel: string
  wochenstunden: number
  dienstort: string
  nichtLeistungen: string
}

export interface NewPariticipantsSummaryDto {
  projektNummer: number
  seminarNummer: number
  seminar: string
  massnahmenummer: string
  filename: string
  date: string
  gesamt: number
  valid: string
  invalid: string
}

export interface SeminarDto {
  projektNummer: number
  seminarNummer: number
  ort: string
  seminar: string
  von: string
  bis: string
  uhrzeit: string
}

export interface UserDetailsDto {
  azureId: string
  firstName: string
  lastName: string
  roles: ROLE[]
}
