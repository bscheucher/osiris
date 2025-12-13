import { SeminarWithData } from './teilnehmer-utils'
import { ErrorsResponse } from '../interfaces/mitarbeiter'

export interface UrlaubOverview {
  nextAnspruch: string
  month: string
  rest: number
  konsum: number
  verbraucht: number
  urlaube: UrlaubEntry[]
}

export interface UrlaubEntry {
  id: number
  startDate: string
  endDate: string
  days: string
  saldo: string
  status: AbwesenheitStatus
  comment: string
  urlaubType: UrlaubType
  lhrCalculated: boolean
}

export enum UrlaubType {
  Urlaub = 'Urlaub',
}

export enum AbwesenheitStatus {
  NEW = 'NEW',
  VALID = 'VALID',
  INVALID = 'INVALID',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  ERROR = 'ERROR',
  CANCELED = 'CANCELED',
  REQUEST_CANCELLATION = 'REQUEST_CANCELLATION',
  ACCEPTED_FINAL = 'ACCEPTED_FINAL',
  USED = 'USED',
}

export enum AbwesenheitType {
  URLAU = 'URLAU',
  ZEITAUSGLEICH = 'ZEITAUSGLEICH',
}

export interface AbwesenheitEntry {
  id: number
  fullName: string
  personalnummer: string
  startDate: string
  endDate: string
  durationInDays: string
  type: AbwesenheitType
  comment?: string
  commentFuehrungskraft?: string
  status: AbwesenheitStatus
  changedOn: string
  anspruch: string
  lhrHttpStatus: number
  lhrCalculated: boolean
}

export enum ZeiterfassungUebermittlungStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  VALID = 'VALID',
  CANCELED = 'CANCELED',
  REJECTED = 'REJECTED',
  ERROR = 'ERROR',
  INVALID = 'INVALID',
  PARTIALLY_COMPLETED = 'PARTIALLY_COMPLETED',
}

export interface ZeiterfassungUebermittlung extends ErrorsResponse {
  datumBis: string
  datumSent: string
  datumVon: string
  userName: string
  status: `${ZeiterfassungUebermittlungStatus}`
  teilnehmerNumber: number | null
  seminars: SeminarWithData[] | null
}

export type SortDirection = 'ASC' | 'DESC'

export const getMessageFromStatusCode = (
  errorCode: number,
  t: (key: string) => string
) => {
  switch (errorCode) {
    case 200:
      return t('notification.refreshSuccessful')
    case 409:
      return t('notification.conflict')
    case 405:
      return t('notification.invalidData')
    default:
      return t('notification.internalServerError')
  }
}
