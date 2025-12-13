export interface VertretungsPlan {
  vertretungsplanungMetaData: VertretungsplanungMetaData
  vertretungsplanungTable: VertretungsplanungTableItem[]
}

export interface VertretungsplanungMetaData {
  mitarbeiterId: number
  vorname: string
  nachname: string
  fromDate: string
  toDate: string
  reason: string | null
}

export interface VertretungsplanungTableItem {
  seminarTitle: string
  seminarId: number
  weekData: WeekDataItem[]
}

export interface WeekDataItem<
  T extends SubstitutionCandidate = SubstitutionCandidate,
> {
  date: string
  list: T[]
  selection: T['id']
}

export interface SubstitutionCandidate {
  id: number
  name: string
  punkte: string
  email: string
  phone: string
  hasExperience: boolean
  availability: ('onSite' | 'online')[]
}
