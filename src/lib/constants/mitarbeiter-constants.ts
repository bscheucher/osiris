export enum STEP_NAME {
  // MA Onboarding
  STAMMDATEN_ERFASSEN = 'Stammdaten erfassen',
  VERTRAGSDATEN_ERFASSEN = 'Vertragsdaten erfassen',
  KV_EINSTUFUNG_BERECHNEN = 'KV-Einstufung berechnen',

  LOHNVERRECHUNG_INFORMIEREN = 'Lohnverrechnung informieren',
  MITARBEITERDATEN_PRUEFEN = 'Mitarbeitendedaten prüfen',
  DIENSTVERTRAG_ERSTELLEN = 'Dienstvertrag erstellen',

  UNTERSCHRIFTENLAUF_STARTEN = 'Unterschriftenlauf starten',
  UNTERSCHRIFTENLAUF_DURCHFUEHREN = 'Unterschriftenlauf durchführen',
  UNTERSCHRIEBENE_DOKUMENTE_SPEICHERN = 'Unterschriebene Dokumente speichern',

  DATEN_AN_LHR_UEBERGEBEN = 'Daten an LHR übergeben',

  // TN Onboarding
  STAMMDATEN_ERFASSEN_TN = 'Stammdaten erfassen (Teilnehmende)',
  VERTRAGSDATEN_ERFASSEN_TN = 'Vertragsdaten erfassen (Teilnehmende)',
  LOHNVERRECHUNG_INFORMIEREN_TN = 'Lohnverrechnung informieren (Teilnehmende)',
  MITARBEITERDATEN_PRUEFEN_TN = 'Mitarbeitendedaten prüfen (Teilnehmende)',
  DATEN_AN_LHR_UEBERGEBEN_TN = 'Daten an LHR übergeben (Teilnehmende)',
  STAKEHOLDER_INFORMIEREN_TN = 'Stakeholder informieren (Teilnehmende)',

  // deprecated
  // MA_ANLEGEN_TN = 'Neuen MA anlegen for TN onboarding',
  // ANLAGE_BEAUFTRAGEN_TN = 'User Anlage beauftragen for TN onboarding',
  // USER_ANLEGEN_TN = 'AD & ibos User anlegen for TN onboarding',
  // IBOS_ANLEGEN_TN = 'IbosNG User anlege for TN onboarding',
}

export const STEP_NAME_TO_ID: { [key in STEP_NAME]: number } = {
  // MA Onboarding
  [STEP_NAME.STAMMDATEN_ERFASSEN]: 3,
  [STEP_NAME.VERTRAGSDATEN_ERFASSEN]: 4,
  [STEP_NAME.KV_EINSTUFUNG_BERECHNEN]: 5,
  [STEP_NAME.LOHNVERRECHUNG_INFORMIEREN]: 6,
  [STEP_NAME.MITARBEITERDATEN_PRUEFEN]: 7,
  [STEP_NAME.DIENSTVERTRAG_ERSTELLEN]: 8,
  // id 9 was removed,
  [STEP_NAME.UNTERSCHRIFTENLAUF_STARTEN]: 10,
  [STEP_NAME.UNTERSCHRIFTENLAUF_DURCHFUEHREN]: 11,
  [STEP_NAME.UNTERSCHRIEBENE_DOKUMENTE_SPEICHERN]: 12,
  [STEP_NAME.DATEN_AN_LHR_UEBERGEBEN]: 13,

  // TN Onboarding
  [STEP_NAME.STAMMDATEN_ERFASSEN_TN]: 18,
  [STEP_NAME.VERTRAGSDATEN_ERFASSEN_TN]: 19,
  [STEP_NAME.LOHNVERRECHUNG_INFORMIEREN_TN]: 20,
  [STEP_NAME.MITARBEITERDATEN_PRUEFEN_TN]: 21,
  [STEP_NAME.DATEN_AN_LHR_UEBERGEBEN_TN]: 22,
  [STEP_NAME.STAKEHOLDER_INFORMIEREN_TN]: 23,

  // [STEP_NAME.ANLAGE_BEAUFTRAGEN_TN]: 24,
  // [STEP_NAME.USER_ANLEGEN_TN]: 25,
  // [STEP_NAME.IBOS_ANLEGEN_TN]: 26,
}

export const ID_TO_STEP_NAME: { [key: number]: STEP_NAME } = Object.fromEntries(
  Object.entries(STEP_NAME_TO_ID).map(([key, value]) => [
    value,
    key as STEP_NAME,
  ])
)

export enum WORKFLOW_NAME {
  COLLECT_DATA_FOR_MA = 'Collect Data for New Mitarbeiter',
  COLLECT_DATA_FOR_TN = 'Collect Data for TN onboarding',
}

export enum STEP_STATUS {
  NEW = 'NEW',
  DISABLED = 'disabled',
  INPROGRESS = 'IN_PROGRESS',
  ERROR = 'ERROR',
  COMPLETED = 'COMPLETED',
}

export enum FileUploadType {
  ECARD = 'ecard',
  BANKCARD = 'bankcard',
  ARBEITSGENEHMIGUNG = 'arbeitsgenehmigung',
  FOTO = 'foto',
  VORDIENSTZEITEN_NACHWEIS = 'vordienstzeit',
  DIENSTVERTRAG = 'dienstvertrag',
}

export const formFieldToUploadTypeMap = new Map([
  ['ecard', FileUploadType.ECARD],
  ['bankcard', FileUploadType.BANKCARD],
  ['stammdaten.bankcard', FileUploadType.BANKCARD],
  ['arbeitsgenehmigungDok', FileUploadType.ARBEITSGENEHMIGUNG],
  ['foto', FileUploadType.FOTO],
  ['nachweis', FileUploadType.VORDIENSTZEITEN_NACHWEIS],
  ['dienstvertrag', FileUploadType.DIENSTVERTRAG],
])

export enum FileStatus {
  NONE = 'none',
  NOT_VERIFIED = 'not_verified',
  VERIFIED = 'verified',
}
