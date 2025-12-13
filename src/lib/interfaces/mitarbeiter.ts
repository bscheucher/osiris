import { FileStatus } from '../constants/mitarbeiter-constants'
import { FieldType } from '@/lib/types/types'
import { ValueField } from '@/lib/utils/object-utils'

export enum MitarbeiterType {
  Mitarbeiter = 'MITARBEITER',
  Teilnehmer = 'TEILNEHMER',
}

export type MitarbeiterTypeAsString = `${MitarbeiterType}`

export interface ErrorsResponse {
  errors?: string[]
  errorsMap?: Record<string, string>
}

export interface VertragsdatenEntry extends ErrorsResponse {
  id?: number
  // Personendaten
  personalnummer: string
  abrechnungsgruppe: string
  adienstagBis: string
  adienstagNetto: string
  adienstagVon: string
  adonnerstagBis: string
  adonnerstagNetto: string
  adonnerstagVon: string
  afreitagBis: string
  afreitagNetto: string
  afreitagVon: string
  amittwochBis: string
  amittwochNetto: string
  amittwochVon: string
  amontagBis: string
  amontagNetto: string
  amontagVon: string
  angerechneteFacheinschlaegigeTaetigkeitenMonate: string
  angerechneteIbisMonate: string
  arbeitszeitmodell: string
  arbeitszeitmodellBis: string
  arbeitszeitmodellVon: string
  asamstagBis: string
  asamstagNetto: string
  asamstagVon: string
  asonntagBis: string
  asonntagNetto: string
  asonntagVon: string
  auswahlBegruendungFuerDurchrechner: string
  befristungBis: string
  beschaeftigungsausmass: string
  beschaeftigungsstatus: string
  deckungspruefung: string
  dienstnehmergruppe: string
  dienstort: string
  eintritt: string
  facheinschlaegigeTaetigkeitenGeprueft: string
  fixZulage: string
  fuehrungskraft: string
  funktionsZulage: string
  gehaltVereinbart: string
  gesamtBrutto: string
  geschaeftsbereichsaenderung: string
  isBefristet: string
  jobBezeichnung: string
  jobticket: string
  jobticketTitle: string
  kategorie: string
  kdienstagBis: string
  kdienstagVon: string
  kdonnerstagBis: string
  kdonnerstagVon: string
  kernzeit: boolean
  kfreitagBis: string
  kfreitagVon: string
  klasse: string
  kmittwochBis: string
  kmittwochVon: string
  kmontagBis: string
  kmontagVon: string
  kollektivvertrag: string
  kostenstelle: string
  ksamstagBis: string
  ksamstagVon: string
  ksonntagBis: string
  ksonntagVon: string
  kvErhoehung: string
  kvGehaltBerechnet: string
  land: string
  lehrjahr: string
  leitungsZulage: string
  mobileWorking: string
  naechsteVorrueckung: string
  notizAllgemein: string
  notizArbeitszeit: string
  notizGehalt: string
  notizZusatzvereinbarung: string
  ort: string
  plz: string
  spezielleMittagspausenregelung: string
  startcoach: string
  strasse: string
  stufe: string
  stufenwechsel: string
  stundenaenderung: string
  taetigkeit: string
  ueberzahlung: string
  uestPauschale: string
  unterhaltsberechtigte: string
  urlaubVorabVereinbart: string
  vereinbarungUEberstunden: string
  verwendungsbereichsaenderung: string
  verwendungsgruppe: string
  vordienstzeiten: string
  weitereAdressezuHauptwohnsitz: string
  wochenstunden: string
  zulageInEuroFix: string
  zulageInEuroFunktion: string
  zulageInEuroLeitung: string
}

export interface StammdatenEntry extends ErrorsResponse {
  id?: number
  // Personendaten
  personalnummer?: string
  firma?: string
  anrede: string
  titel: string
  titel2: string
  nachname: string
  vorname: string
  geburtsname: string
  svnr: string
  ecard: FileStatus
  geschlecht: string
  familienstand: string
  geburtsDatum: string
  alter: string
  staatsbuergerschaft: string
  muttersprache: string

  // Kontaktdaten
  strasse: string
  land: string
  plz: string
  ort: string
  email: string
  mobilnummer: string
  handySignatur: boolean
  astrasse: string
  aland: string
  aplz: string
  aort: string

  // Bankdaten
  bank: string
  iban: string
  bic: string
  bankcard: FileStatus

  // ZusatzInfo
  burgenland: boolean
  kaernten: boolean
  niederoesterreich: boolean
  oberoesterreich: boolean
  salzburg: boolean
  steiermark: boolean
  tirol: boolean
  vorarlberg: boolean
  wien: boolean
  arbeitsgenehmigungDok: FileStatus
  arbeitsgenehmigung: string
  gueltigBis: string
  foto: FileStatus
}

export interface VordienstzeitEntry extends ErrorsResponse {
  id?: number
  personalnummer: string
  vertragsart: string
  firma: string
  vordienstzeitenVon: string
  vordienstzeitenBis: string
  vwochenstunden: string
  anrechenbar: boolean
  nachweis: FileStatus
  nachweisFilename?: string
  facheinschlaegig: number
}

export interface UnterhaltsberechtigteEntry extends ErrorsResponse {
  id?: number
  personalnummer: string
  uvorname: string
  unachname: string
  usvnr: string
  ugeburtsdatum: string
  uverwandtschaft: string
  alter: string
}

export interface MitarbeiterResult {
  name: string
  kostenstelle: string
  fuehrungskraft: string
  svnr: number
  personalnummer: string
}

// Legacy type definitions

export type SetPropFieldType = Partial<FormField<any> & { value: any }>

export interface FormFieldDependency {
  showConditionField?: string
  setPropFieldName?: string
  showCondition?: (value: ValueField) => boolean
  setProp?: (
    value: ValueField,
    mitarbeiterType?: MitarbeiterTypeAsString
  ) => SetPropFieldType
}

export interface FormField<T> {
  max?: number
  maxLength?: number
  maxDate?: Date
  minDate?: Date
  gap?: boolean
  masterdataField?: string
  disabled?: boolean | ((type: MitarbeiterTypeAsString) => boolean)
  type: FieldType
  dtoFieldName: string
  placeholder: string
  options?: string[]
  required?: boolean
  validationRegex?: RegExp
  group?: keyof T
  subGroup?: string
  dependency?: FormFieldDependency
  showFor: MitarbeiterTypeAsString[]
  forceLeadingZeros?: boolean
}

export interface MitarbeiterSeminar {
  seminarId: number
  bezeichnung: string
  standort: string
  masnahmennummer: string
  startDate: string
  endDate: string
  role: string
}

export interface MitarbeiterProjekt {
  projectId: number
  bezeichnung: string
  startDate: string
  endDate: string | null
}
