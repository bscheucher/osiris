export enum AustrittsgrundType {
  AFL1 = 'AFL1',
  AFL2 = 'AFL2',
  AFL3 = 'AFL3',
  AFL4 = 'AFL4',
  AFL5 = 'AFL5',
  AFL6 = 'AFL6',
  AFL7 = 'AFL7',
  AFL8 = 'AFL8',
  AFL9 = 'AFL9',
  AFL10 = 'AFL10',
  AFL11 = 'AFL11',
  AFL12 = 'AFL12',
  AFL13 = 'AFL13',
  AFL14 = 'AFL14',
  AFL15 = 'AFL15',
}

export interface Austritt {
  id: number
  teilnehmerId: number
  vorname: string
  nachname: string
  svNummer: number
  austrittsDatum: string
  austrittsgrund: string
  bemerkung: string
  kostenstelle: string
  status: AustrittStatus
}

export enum AustrittStatus {
  NEW = 'NEW',
  ABMELDUNG_BEI_LV = 'ABMELDUNG_BEI_LV',
  ABGEMELDET = 'ABGEMELDET',
  ERROR = 'ERROR',
}
