// Import dayjs for date manipulation
import dayjs from 'dayjs'
import localeData from 'dayjs/plugin/localeData'
import weekday from 'dayjs/plugin/weekday'
import 'dayjs/locale/de'

dayjs.extend(weekday)
dayjs.extend(localeData)
dayjs.locale('de')

// Define the Leistung interface based on the provided file

export interface Leistung {
  id: string
  von: string
  bis: string
  datum: string
  dayOfWeek?: number
  ort: string
  leistungsart?: string
  kostentraeger: string
  taetigkeit: string
  bemerkung?: string
  seminarbucheintrag?: string
  status: 'confirmed' | 'draft'
  colorScheme?: 'blue' | 'pink' | 'gray' | 'green' | 'yellow' | 'purple' | 'red'
}

// Helper function to generate IDs
export const generateId = () => Math.random().toString(36).substring(2, 11)

const startOfWeek = dayjs().startOf('week')

// Current week dates (using the same dates from the provided file)
const mondayDate = startOfWeek // Monday
const tuesdayDate = startOfWeek.weekday(1) // Tuesday
const wednesdayDate = startOfWeek.weekday(2) // Wednesday
const thursdayDate = startOfWeek.weekday(3) // Thursday
const fridayDate = startOfWeek.weekday(4) // Friday

export interface LeistungMetadata {
  kernZeitVon: string
  kernZeitBis: string
  message: string[]
  weekStatus: 'OPEN' | 'CLOSED'
  total: number[]
  weekData: number[][]
}

export const APPOINTMENT_METADATA: LeistungMetadata = {
  kernZeitVon: '08:30:00',
  kernZeitBis: '16:30:00',
  weekStatus: 'OPEN',
  message: [
    'Heute wurde noch keine Mittagspause erfasst.',
    'Für Seminar ÜBA 15 Waldviertel wurde noch kein Lernstudio durch einen Trainer erfasst.',
  ],
  total: [38, 37.5],
  weekData: [
    [7.5, 7.5],
    [7.5, 7.5],
    [6.5, 7.5],
    [7.5, 7.5],
    [0, 0],
    [0, 0],
    [0, 0],
  ],
}

export const APPOINTMENT_METADATA_ALT: LeistungMetadata = {
  kernZeitVon: '08:30:00',
  kernZeitBis: '16:30:00',
  weekStatus: 'CLOSED',
  message: [],
  total: [38, 37.5],
  weekData: [
    [7.5, 7.5],
    [7.5, 7.5],
    [6.5, 7.5],
    [7.5, 7.5],
    [7.5, 7.5],
    [0, 0],
    [0, 0],
  ],
}

// Initial test data
export const DEFAULT_APPOINTMENTS: Leistung[] = [
  {
    id: generateId(),
    datum: mondayDate.format('YYYY-MM-DD'),
    von: '07:45',
    bis: '11:30',
    kostentraeger: 'ÜBA 16 LG',
    taetigkeit: 'Unterricht',
    ort: 'Office',
    status: 'confirmed',
    bemerkung: 'Einführungskurs für neue Teilnehmer',
  },
  {
    id: generateId(),
    datum: mondayDate.format('YYYY-MM-DD'),
    von: '11:30',
    bis: '12:30',
    kostentraeger: 'Pause',
    taetigkeit: 'Pause',
    ort: 'Office',
    status: 'confirmed',
    bemerkung: 'Vormittagspause',
  },
  {
    id: generateId(),
    datum: mondayDate.format('YYYY-MM-DD'),
    von: '12:30',
    bis: '16:30',
    kostentraeger: 'ÜBA 16 LG',
    taetigkeit: 'Unterricht',
    ort: 'Office',
    status: 'confirmed',
    bemerkung: 'Fortgeschrittene Module',
  },
  {
    id: generateId(),
    datum: tuesdayDate.format('YYYY-MM-DD'),
    von: '08:00',
    bis: '11:30',
    kostentraeger: 'ÜBA 16 LG',
    taetigkeit: 'Unterricht',
    ort: 'Office',
    status: 'confirmed',
    bemerkung: 'Einführungskurs für neue Teilnehmer',
  },
  {
    id: generateId(),
    datum: tuesdayDate.format('YYYY-MM-DD'),
    von: '11:30',
    bis: '12:30',
    kostentraeger: 'Pause',
    taetigkeit: 'Pause',
    ort: 'Office',
    status: 'confirmed',
    bemerkung: 'Vormittagspause',
  },
  {
    id: generateId(),
    datum: tuesdayDate.format('YYYY-MM-DD'),
    von: '12:30',
    bis: '16:00',
    kostentraeger: 'ÜBA 16 LG',
    taetigkeit: 'Unterricht',
    ort: 'Office',
    status: 'confirmed',
    bemerkung: 'Fortgeschrittene Module',
  },
  {
    id: generateId(),
    datum: wednesdayDate.format('YYYY-MM-DD'),
    von: '08:15',
    bis: '12:00',
    kostentraeger: 'ÜBA 15 Waldviertel',
    taetigkeit: 'Unterricht',
    ort: 'Office',
    status: 'confirmed',
    bemerkung: 'Projektarbeit für Waldviertel-Teilnehmer',
  },
  {
    id: generateId(),
    datum: wednesdayDate.format('YYYY-MM-DD'),
    von: '12:00',
    bis: '12:45',
    kostentraeger: 'Pause',
    taetigkeit: 'Pause',
    ort: 'Office',
    status: 'confirmed',
    bemerkung: 'Mittagspause',
  },
  {
    id: generateId(),
    datum: wednesdayDate.format('YYYY-MM-DD'),
    von: '12:45',
    bis: '16:30',
    kostentraeger: 'ÜBA 16 LG',
    taetigkeit: 'Unterricht',
    ort: 'Office',
    status: 'confirmed',
    bemerkung: 'Fortgeschrittene Module',
  },
  {
    id: generateId(),
    datum: thursdayDate.format('YYYY-MM-DD'),
    von: '07:45',
    bis: '11:30',
    kostentraeger: 'ÜBA 15 Waldviertel',
    taetigkeit: 'Unterricht',
    ort: 'Office',
    status: 'draft',
    bemerkung: 'Projektarbeit für Waldviertel-Teilnehmer',
  },
  {
    id: generateId(),
    datum: thursdayDate.format('YYYY-MM-DD'),
    von: '11:30',
    bis: '12:30',
    kostentraeger: 'Pause',
    taetigkeit: 'Pause',
    ort: 'Office',
    status: 'draft',
    bemerkung: 'Mittagspause',
  },
  {
    id: generateId(),
    datum: thursdayDate.format('YYYY-MM-DD'),
    von: '12:30',
    bis: '15:30',
    kostentraeger: 'ÜBA 16 LG',
    taetigkeit: 'Unterricht',
    ort: 'Office',
    status: 'draft',
    bemerkung: 'Fortgeschrittene Module',
  },
]

export const DEFAULT_APPOINTMENTS_ALT: Leistung[] = [
  {
    id: generateId(),
    datum: mondayDate.subtract(1, 'week').format('YYYY-MM-DD'),
    von: '08:15',
    bis: '11:30',
    kostentraeger: 'ÜBA 16 LG',
    taetigkeit: 'Unterricht',
    ort: 'Office',
    status: 'confirmed',
    bemerkung: 'Einführungskurs für neue Teilnehmer',
  },
  {
    id: generateId(),
    datum: mondayDate.subtract(1, 'week').format('YYYY-MM-DD'),
    von: '11:30',
    bis: '12:30',
    kostentraeger: 'Pause',
    taetigkeit: 'Pause',
    ort: 'Office',
    status: 'confirmed',
    bemerkung: 'Vormittagspause',
  },
  {
    id: generateId(),
    datum: mondayDate.subtract(1, 'week').format('YYYY-MM-DD'),
    von: '12:30',
    bis: '16:30',
    kostentraeger: 'ÜBA 16 LG',
    taetigkeit: 'Unterricht',
    ort: 'Office',
    status: 'confirmed',
    bemerkung: 'Fortgeschrittene Module',
  },
  {
    id: generateId(),
    datum: tuesdayDate.subtract(1, 'week').format('YYYY-MM-DD'),
    von: '08:15',
    bis: '11:30',
    kostentraeger: 'ÜBA 16 LG',
    taetigkeit: 'Unterricht',
    ort: 'Office',
    status: 'confirmed',
    bemerkung: 'Einführungskurs für neue Teilnehmer',
  },
  {
    id: generateId(),
    datum: tuesdayDate.subtract(1, 'week').format('YYYY-MM-DD'),
    von: '11:30',
    bis: '12:30',
    kostentraeger: 'Pause',
    taetigkeit: 'Pause',
    ort: 'Office',
    status: 'confirmed',
    bemerkung: 'Vormittagspause',
  },
  {
    id: generateId(),
    datum: tuesdayDate.subtract(1, 'week').format('YYYY-MM-DD'),
    von: '12:30',
    bis: '16:00',
    kostentraeger: 'ÜBA 16 LG',
    taetigkeit: 'Unterricht',
    ort: 'Office',
    status: 'confirmed',
    bemerkung: 'Fortgeschrittene Module',
  },
  {
    id: generateId(),
    datum: wednesdayDate.subtract(1, 'week').format('YYYY-MM-DD'),
    von: '08:15',
    bis: '12:00',
    kostentraeger: 'ÜBA 15 Waldviertel',
    taetigkeit: 'Unterricht',
    ort: 'Office',
    status: 'confirmed',
    bemerkung: 'Projektarbeit für Waldviertel-Teilnehmer',
  },
  {
    id: generateId(),
    datum: wednesdayDate.subtract(1, 'week').format('YYYY-MM-DD'),
    von: '12:00',
    bis: '12:45',
    kostentraeger: 'Pause',
    taetigkeit: 'Pause',
    ort: 'Office',
    status: 'confirmed',
    bemerkung: 'Mittagspause',
  },
  {
    id: generateId(),
    datum: wednesdayDate.subtract(1, 'week').format('YYYY-MM-DD'),
    von: '12:45',
    bis: '16:30',
    kostentraeger: 'ÜBA 16 LG',
    taetigkeit: 'Unterricht',
    ort: 'Office',
    status: 'confirmed',
    bemerkung: 'Fortgeschrittene Module',
  },
  {
    id: generateId(),
    datum: thursdayDate.subtract(1, 'week').format('YYYY-MM-DD'),
    von: '08:00',
    bis: '11:30',
    kostentraeger: 'ÜBA 15 Waldviertel',
    taetigkeit: 'Unterricht',
    ort: 'Office',
    status: 'confirmed',
    bemerkung: 'Projektarbeit für Waldviertel-Teilnehmer',
  },
  {
    id: generateId(),
    datum: thursdayDate.subtract(1, 'week').format('YYYY-MM-DD'),
    von: '11:30',
    bis: '12:30',
    kostentraeger: 'Pause',
    taetigkeit: 'Pause',
    ort: 'Office',
    status: 'confirmed',
    bemerkung: 'Mittagspause',
  },
  {
    id: generateId(),
    datum: thursdayDate.subtract(1, 'week').format('YYYY-MM-DD'),
    von: '12:30',
    bis: '15:30',
    kostentraeger: 'ÜBA 16 LG',
    taetigkeit: 'Unterricht',
    ort: 'Office',
    status: 'confirmed',
    bemerkung: 'Fortgeschrittene Module',
  },
  {
    id: generateId(),
    datum: fridayDate.subtract(1, 'week').format('YYYY-MM-DD'),
    von: '08:15',
    bis: '11:30',
    kostentraeger: 'ÜBA 15 Waldviertel',
    taetigkeit: 'Unterricht',
    ort: 'Office',
    status: 'confirmed',
    bemerkung: 'Projektarbeit für Waldviertel-Teilnehmer',
  },
  {
    id: generateId(),
    datum: fridayDate.subtract(1, 'week').format('YYYY-MM-DD'),
    von: '11:30',
    bis: '12:30',
    kostentraeger: 'Pause',
    taetigkeit: 'Pause',
    ort: 'Office',
    status: 'confirmed',
    bemerkung: 'Mittagspause',
  },
  {
    id: generateId(),
    datum: fridayDate.subtract(1, 'week').format('YYYY-MM-DD'),
    von: '12:30',
    bis: '15:30',
    kostentraeger: 'ÜBA 16 LG',
    taetigkeit: 'Unterricht',
    ort: 'Office',
    status: 'confirmed',
    bemerkung: 'Fortgeschrittene Module',
  },
]

// adds metadata to determine color scheme and day of the week
export const addMetaData = (data: Leistung[]): Leistung[] => {
  return data.map((entry) => {
    // Determine color based on taetigkeit
    const colorScheme = entry.taetigkeit === 'Pause' ? 'green' : 'blue'

    // Calculate day of week (dayjs returns 0 for Sunday, so we need to adjust)
    const date = dayjs(entry.datum)
    const dayOfWeek = date.day() === 0 ? 6 : date.day() - 1 // Convert to Monday=0, Sunday=6

    return {
      ...entry,
      colorScheme,
      dayOfWeek,
    }
  })
}

// Get color classes for styling
export const getColorClasses = (colorScheme: Leistung['colorScheme']) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50',
      hover: 'hover:bg-blue-100',
      text: 'text-blue-600',
      highlight: 'bg-blue-200',
    },
    pink: {
      bg: 'bg-pink-50',
      hover: 'hover:bg-pink-100',
      text: 'text-pink-700',
      highlight: 'bg-pink-200',
    },
    gray: {
      bg: 'bg-gray-100',
      hover: 'hover:bg-gray-200',
      text: 'text-gray-700',
      highlight: 'bg-gray-1200',
    },
    green: {
      bg: 'bg-green-50',
      hover: 'hover:bg-green-100',
      text: 'text-green-700',
      highlight: 'bg-green-200',
    },
    yellow: {
      bg: 'bg-yellow-50',
      hover: 'hover:bg-yellow-100',
      text: 'text-yellow-700',
      highlight: 'bg-yellow-200',
    },
    purple: {
      bg: 'bg-purple-50',
      hover: 'hover:bg-purple-100',
      text: 'text-purple-700',
      highlight: 'bg-purple-200',
    },
    red: {
      bg: 'bg-red-50',
      hover: 'hover:bg-red-100',
      text: 'text-red-700',
      highlight: 'bg-red-200',
    },
  }

  return colorScheme ? colorMap[colorScheme] : colorMap.blue
}

export const TAETIGKEITEN_OPTIONS = [
  'Seminar',
  'Seminar-Vertretung',
  'Büro',
  'Ersatzruhe',
  'Einzelcoaching',
  'unterstützendes Personal',
  'Weiterbildung',
  'Bildungsfreistellung',
  'Aufbau',
  'Externer Einsatz (Support vor Ort)',
  'Arztbesuch',
  'Behördenweg und sonstiges',
  'Krankenstand', // will later be handled in Abwesenheit
  'Sonderurlaub', // will later be handled in Abwesenheit
  // 'Urlaub', // will later be handled in Abwesenheit
  'Zeitausgleich',
  'Pflegefreistellung',
  'Mittagspause',
  'Administration',
  'Dienstfreistellung',
  'unbezahlter Urlaub',
  'ibis Event',
  'Lernstudio',
  'ibis Event Konsum',
  'Dienstfreistellung Betriebsversammlung',
  'Streik',
  'Arbeitsunfall',
]

export const KOSTENSTELLEN_OPTIONS = [
  'ÜBA 16 LG (Seminar)',
  'ÜBA 15 Waldviertel (Seminar)',
  '10 People (Kostenstelle)',
  '40 Jugend (Kostenstelle)',
  '41 Sprachen & Integragtion (Kostenstelle)',
  '42 Erwachsene (Kostenstelle)',
  '43 Frauen (Kostenstelle)',
  '44 Talent Link (Kostenstelle)',
  '45 Beratung & Coaching (Kostenstelle)',
  '50 KAOS Bildungsservice (Kostenstelle)',
  '80 PSC (Produkt Service Center) (Kostenstelle)',
]
