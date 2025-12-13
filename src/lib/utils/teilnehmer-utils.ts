'use client'

import { Teilnehmer } from '@/lib/interfaces/teilnehmer'
import { InputType } from '@/lib/types/types'

export interface Seminar {
  name: string
  seminarNummer: number
  teilnehmer: number[]
}

export type ParticipantsMapperType = {
  group: string
  gap?: boolean
  dtoFieldname: keyof Teilnehmer
  type: InputType
  readableFieldname: string
  errorMessage?: string
}
export type Selection = { seminar: string; massnahme: string }

export type SeminarWithData = {
  id: number
  seminarBezeichnung: string
  seminarNumber: number
}
