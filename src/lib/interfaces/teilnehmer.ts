import { StammdatenEntry, VertragsdatenEntry } from './mitarbeiter'
import { ErrorsResponse } from '../utils/gateway-utils'

export interface Teilnehmer extends ErrorsResponse {
  id: number
  anrede: string
  titel: string
  titel2: string
  vorname: string
  nachname: string
  geschlecht: string
  svNummer: string
  geburtsdatum: string
  buchungsstatus: string
  anmerkung: string
  zubuchung: string
  geplant: string
  eintritt: string
  austritt: string
  rgs: number
  massnahmennummer: string
  veranstaltungsnummer: string
  email: string
  betreuerTitel: string
  betreuerVorname: string
  betreuerNachname: string
  telefon: string
  plz: number
  ort: string
  strasse: string
  nation: string
  land: string
  seminarBezeichnung: string
  seminarNumber: string
  rgsBezeichnung: string
  seminarIdentifier: string
  source: SeminarSource
  ueba: boolean | null
  ursprungsland: string
  geburtsort: string
  status: string
  personalnummer: string
  naechsteVorrueckung: string
  hasBisDocument: boolean

  // Vermittlungsdaten
  ziel: string
  vermittelbarAb: string
  vermittlungsnotiz: string

  // Erfahrungen
  kompetenzen: string[]
  zerifikate: string[]
  notizen: TeilnehmerNotiz[]
  ausbildungen: TeilnehmerAusbildung[]
  sprachkenntnisse: TeilnehmerSprachkenntnis[]
  zertifikate: TeilnehmerZertifikat[]
  wunschberufe: string[]

  // Stammdaten & Vertragsdaten
  stammdaten: Partial<StammdatenEntry>
  vertragsdaten: Partial<VertragsdatenEntry>
}

export type LegacyTeilnehmer = Omit<Teilnehmer, 'errors'> & {
  errors: number[]
}

export enum SeminarSource {
  VHS = 0,
  EAMS1 = 1,
  VHS_EAMS = 2,
  OEIF = 3,
  MDLC = 4,
  MANUAL = 5,
}

export enum TeilnehmerValidityStatus {
  VALID = 'VALID',
  INVALID = 'INVALID',
}

export interface SeminarEntry {
  id: number

  projektId: number
  seminarNumber: number
  kursVon: string
  kursBis: string
  kostentraeger: string
  standort: string
  schieneUhrzeit: string
  austritt: string | null
  eintritt: string | null
  kursDatumVon: string | null
  kursDatumBis: string | null
  austrittsgrund: string
  begehrenBis: string
  rgs: string
  rgsBezeichnung: string
  betreuerTitel: string | null
  betreuerVorname: string
  betreuerNachname: string
  zusaetzlicheUnterstuetzung: string
  buchungsstatus: string
  seminarId: string
  projektName: string
  seminarBezeichnung: string
  betreuer: string
  seminarSchliesszeiten: string

  // unclear
  geplant: string
  massnahmennummer: string
  veranstaltungsnummer: string
  zubuchung: string

  // new fields
  lernfortschritt: string
  fruehwarnung: string
  anteilAnwesenheit: string
  anmerkung: string
  gesamtbeurteilungTyp: string
  gesamtbeurteilungErgebnis: string
  pruefungen?: SeminarPruefung[]
  notizen?: TeilnehmerNotiz[]
  trainer: SeminarTrainer[]
}

export interface ProjectEntry {
  id: number

  projektId: number
  projektName: string
}

export interface SeminarPruefung {
  id: number | null
  bezeichnung: string
  pruefungArt: string
  gegenstand: string
  niveau: string
  institut: string
  pruefungsantritt: string
  begruendung: string
  ergebnis: string
  ergebnisInProzent: string
  pruefungAm: string
  anmerkung: string
  antritt: boolean | string | null
}

export interface ApiResponse {
  success: boolean
  data: {
    type: string
    attributes: {
      teilnehmerDto: Teilnehmer
      seminarDtos: SeminarEntry[]
    }[]
  }[]
}

export interface TeilnehmerNotiz extends ErrorsResponse {
  id?: number
  notiz: string
  type: string
  kategorie: string
  createdOn: string
  createdBy: string
}

export interface TeilnehmerAusbildung {
  id?: string
  ausbildungstyp: string
  hoechsterAbschluss: boolean
  erkanntInAt: boolean
}

export interface TeilnehmerBerufserfahrung {
  id?: string
  beruf: string
  dauer: number | string
}

export interface TeilnehmerSprachkenntnis {
  id?: string
  sprache: string
  niveau: string
  bewertungCoach: string
  bewertungDatum: string
}

export interface TeilnehmerZertifikat {
  id?: string
  bezeichnung: string
}

export interface TeilnehmerResult {
  id: number
  nachname: string
  vorname: string
  land: string
  ort: string
  plz: number
  svn: number
  angemeldetIn: string[]
  seminarNamen: string[]
  massnahmennummern: string[]

  ueba: boolean
  status: TeilnehmerValidityStatus
  errors: string[]
}

export interface SeminarTrainer {
  name: string
  email: string
  funktion: string
  bezugsdauerStart?: string
  bezugsdauerEnde?: string
}
