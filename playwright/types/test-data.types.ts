/**
 * TypeScript type definitions for test data structures
 */

/**
 * Personal data (Personendaten) for employee onboarding
 */
export interface PersonendatenData {
  /** Salutation (e.g., "Herr", "Frau", "Divers") */
  anrede?: string
  /** Title (e.g., "Dr.", "Mag.") */
  titel?: string
  /** Second title */
  titel2?: string
  /** Gender (e.g., "männlich", "weiblich", "divers") */
  geschlecht?: string
  /** First name */
  vorname: string
  /** Last name */
  nachname: string
  /** Birth name */
  geburtsname?: string
  /** Marital status (e.g., "ledig", "verheiratet") */
  familienstand?: string
  /** Citizenship (e.g., "Österreich", "Deutschland") */
  staatsbuergerschaft: string
  /** Native language */
  muttersprache?: string
  /** Social security number (10 digits) */
  svnr: string
  /** Birth date in DD.MM.YYYY format */
  geburtsDatum: string
  /** Path to eCard file */
  ecardPath?: string
}

/**
 * Contact data (Kontaktdaten) for employee onboarding
 */
export interface KontaktdatenData {
  /** Street address */
  strasse: string
  /** Postal code */
  plz: string
  /** City */
  ort: string
  /** Country */
  land: string
  /** Email address */
  email: string
  /** Mobile phone number */
  mobilnummer: string
  /** Has mobile signature (Handy-Signatur) */
  handySignatur?: boolean
}

/**
 * Alternative address (Abweichende Postadresse)
 */
export interface AlternativeAddressData {
  /** Alternative street address */
  astrasse?: string
  /** Alternative postal code */
  aplz?: string
  /** Alternative city */
  aort?: string
  /** Alternative country */
  aland?: string
}

/**
 * Bank data (Bankdaten) for employee onboarding
 */
export interface BankdatenData {
  /** Bank name */
  bank: string
  /** IBAN */
  iban: string
  /** BIC/SWIFT code */
  bic: string
  /** Path to bankcard/debit card file */
  bankcardPath?: string
}

/**
 * Work permit data (Arbeitsgenehmigung)
 */
export interface ArbeitsgenehmigungData {
  /** Path to work permit document */
  arbeitsgenehmigungDokPath?: string
  /** Work permit type */
  arbeitsgenehmigung?: string
  /** Valid until date in DD.MM.YYYY format */
  gueltigBis?: string
  /** Path to photo file */
  fotoPath?: string
}

/**
 * Contract data - General section (Allgemein)
 */
export interface VertragsdatenAllgemeinData {
  /** Entry date in DD.MM.YYYY format */
  eintritt: string
  /** Cost center (Kostenstelle) */
  kostenstelle: string
  /** Work location (Dienstort) */
  dienstort: string
  /** Supervisor (Führungskraft) */
  fuehrungskraft: string
  /** Category (e.g., "Lehrling", "Angestellte") */
  kategorie?: string
  /** Activity (Tätigkeit) */
  taetigkeit?: string
  /** Collective agreement (Kollektivvertrag) */
  kollektivvertrag?: string
}

/**
 * Contract data - Salary section (Gehalt)
 */
export interface VertragsdatenGehaltData {
  /** Next advancement date in DD.MM.YYYY format */
  naechsteVorrueckung: string
  /** Class (e.g., "ÜBA", "BAS") */
  klasse: string
  /** Apprenticeship year (for TN) */
  lehrjahr?: string
}

/**
 * Contract data - Working hours section (Arbeitszeiten)
 */
export interface VertragsdatenArbeitszeitenData {
  /** Billing group (Abrechnungsgruppe) */
  abrechnungsgruppe: string
  /** Employee group (Dienstnehmergruppe) */
  dienstnehmergruppe: string
}

/**
 * Complete contract data (Vertragsdaten)
 */
export interface VertragsdatenData {
  allgemein: VertragsdatenAllgemeinData
  gehalt: VertragsdatenGehaltData
  arbeitszeiten: VertragsdatenArbeitszeitenData
}

/**
 * Complete employee master data (Stammdaten)
 */
export interface CompleteStammdatenData {
  personendaten: PersonendatenData
  kontaktdaten: KontaktdatenData
  alternativeAddress?: AlternativeAddressData
  bankdaten: BankdatenData
  arbeitsgenehmigung?: ArbeitsgenehmigungData
  arbeitsbereitschaft?: string[]
}

/**
 * Austrian states for work readiness
 */
export type AustrianState =
  | 'Burgenland'
  | 'Kärnten'
  | 'Niederösterreich'
  | 'Oberösterreich'
  | 'Salzburg'
  | 'Steiermark'
  | 'Tirol'
  | 'Vorarlberg'
  | 'Wien'

/**
 * Workflow status types
 */
export type WorkflowStatus = 'new' | 'inprogress' | 'completed' | 'error' | 'disabled'

/**
 * Employee type
 */
export type EmployeeType = 'mitarbeiter' | 'teilnehmer'

/**
 * Workflow item IDs
 */
export enum MitarbeiterWorkflowItemId {
  StammdatenErfassen = 3,
  VertragsdatenErfassen = 4,
  KVEinstufungBerechnen = 5,
  LohnverrechnungInformieren = 6,
  MitarbeiterdatenPruefen = 7,
  DienstvertragErstellen = 8,
  UnterschriftenlaufStarten = 10,
  UnterschriftenlaufDurchfuehren = 11,
  UnterschriebeneDokumenteSpeichern = 12,
  DatenAnLHRUebergeben = 13,
}

/**
 * Workflow item IDs for Teilnehmer
 */
export enum TeilnehmerWorkflowItemId {
  StammdatenErfassen = 18,
  VertragsdatenErfassen = 19,
  LohnverrechnungInformieren = 20,
  MitarbeiterdatenPruefen = 21,
  DatenAnLHRUebergeben = 22,
  StakeholderInformieren = 23,
}

/**
 * Test configuration
 */
export interface TestConfig {
  /** Base URL for the application */
  baseURL?: string
  /** Default timeout for operations */
  timeout?: number
  /** Whether to run in headless mode */
  headless?: boolean
}

/**
 * Session data structure
 */
export interface SessionData {
  cookies: Array<{
    name: string
    value: string
    domain: string
    path: string
    expires: number
    httpOnly: boolean
    secure: boolean
    sameSite: 'Strict' | 'Lax' | 'None'
  }>
  localStorage?: Record<string, string>
}

/**
 * Stored employee number data
 */
export interface PersonalnummerData {
  personalnummer: string
}
