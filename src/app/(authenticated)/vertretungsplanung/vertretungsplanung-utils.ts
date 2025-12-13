export const MITARBEITER_OPTIONS = [
  {
    key: '282693',
    label: 'Alexander Pollinger',
  },
  {
    key: '141144',
    label: 'Alexander Pomberger-Hauser',
  },
  {
    key: '66889',
    label: 'Dana Klaus',
  },
  {
    key: '9434',
    label: 'Daniela Datz',
  },
  {
    key: '33646',
    label: 'Evelyn Troppmair',
  },
  {
    key: '182011',
    label: 'Fabian Oster',
  },
]

export const VERTRETUNGSPLANUNG_GRUND = [
  {
    key: 'krankheit',
    label: 'Krankheit',
  },
  {
    key: 'urlaub',
    label: 'Urlaub',
  },
  {
    key: 'pflegeurlaub',
    label: 'Pflegeurlaub',
  },
]

export interface TableEntry {
  datum: string
  uhrzeit: string
  seminar: string
  vertretung: string
  tel: string
  email: string
}

export const TABLE_DATA: TableEntry[] = [
  {
    datum: 'DO, 06.02.2025',
    uhrzeit: '09:45 - 11:45',
    seminar: 'Deutsch_P5_Nord_Standard_A1_K_ST',
    vertretung: 'Karl Moser',
    tel: '0660 48 2323 122',
    email: 'karl.moser@gmail.com',
  },
  {
    datum: 'FR, 07.02.2025',
    uhrzeit: '10:45 - 11:45',
    seminar: 'Englisch_Standard_A1_K_ST',
    vertretung: 'Igor Stiglitz',
    tel: '0660 48 2323 122',
    email: 'igor.stiglitz@gmail.com',
  },
  {
    datum: 'MO, 10.02.2025',
    uhrzeit: '10:45 - 11:45',
    seminar: 'Englisch_Standard_A1_K_ST',
    vertretung: 'Karl Moser',
    tel: '0660 48 2323 122',
    email: 'karl.moser@gmail.com',
  },
  {
    datum: 'DI, 11.02.2025',
    uhrzeit: '09:45 - 11:45',
    seminar: 'Deutsch_P5_Nord_Standard_A1_K_ST',
    vertretung: 'Igor Stiglitz',
    tel: '0660 48 2323 122',
    email: 'igor.stiglitz@gmail.com',
  },
  {
    datum: 'MI, 12.02.2025',
    uhrzeit: '10:45 - 11:45',
    seminar: 'Englisch_Standard_A1_K_ST',
    vertretung: 'Karl Moser',
    tel: '0660 48 2323 122',
    email: 'karl.moser@gmail.com',
  },
  {
    datum: 'DO, 13.02.2025',
    uhrzeit: '09:45 - 11:45',
    seminar: 'Deutsch_P5_Nord_Standard_A1_K_ST',
    vertretung: 'Igor Stiglitz',
    tel: '0660 48 2323 122',
    email: 'igor.stiglitz@gmail.com',
  },
  {
    datum: 'FR, 14.02.2025',
    uhrzeit: '10:45 - 11:45',
    seminar: 'Englisch_Standard_A1_K_ST',
    vertretung: 'Karl Moser',
    tel: '0660 48 2323 122',
    email: 'karl.moser@gmail.com',
  },
  {
    datum: 'MO, 17.02.2025',
    uhrzeit: '09:45 - 11:45',
    seminar: 'Deutsch_P5_Nord_Standard_A1_K_ST',
    vertretung: 'Igor Stiglitz',
    tel: '0660 48 2323 122',
    email: 'igor.stiglitz@gmail.com',
  },
  {
    datum: 'DI, 18.02.2025',
    uhrzeit: '10:45 - 11:45',
    seminar: 'Englisch_Standard_A1_K_ST',
    vertretung: 'Karl Moser',
    tel: '0660 48 2323 122',
    email: 'karl.moser@gmail.com',
  },
  {
    datum: 'MI, 19.02.2025',
    uhrzeit: '09:45 - 11:45',
    seminar: 'Deutsch_P5_Nord_Standard_A1_K_ST',
    vertretung: 'Igor Stiglitz',
    tel: '0660 48 2323 122',
    email: 'igor.stiglitz@gmail.com',
  },
]
