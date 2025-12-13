import dayjs from 'dayjs'
import 'dayjs/locale/de'
import customParseFormat from 'dayjs/plugin/customParseFormat'

export const DAY = 60 * 60 * 1000 * 24
export const WEEK = DAY * 7

export function getNextMonday(startDate = new Date()) {
  const day = startDate.getDay()
  const diff = startDate.getDate() - day + (day == 0 ? -6 : 1) + 7 // adjust when day is sunday
  return new Date(startDate.setDate(diff))
}

export function getEndOfWeek(nextMonday: Date = getNextMonday()) {
  const nextSunday = new Date(nextMonday)
  nextSunday.setDate(nextSunday.getDate() + 6)
  return nextSunday
}

export function getNextDay(range = 1) {
  const today = new Date()
  today.setDate(today.getDate() + range)
  return today
}

export function formatDate(d: Date, format = 'YYYY-MM-DD') {
  return dayjs(d).format(format)
}

export function getFirstDayOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function getFirstDayOfNextMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1)
}

export function getLastDayOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

export function getFirstDayOfYear(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), 0, 1)
}

export function getLastDayOfYear(date: Date = new Date()): Date {
  return new Date(date.getFullYear() + 1, 0, 0)
}

export function getFutureDate(
  amount: number,
  unit: string,
  fromDate: Date = new Date()
): Date {
  const date = new Date(fromDate)
  if (unit === 'days') {
    date.setDate(date.getDate() + amount)
  } else if (unit === 'months') {
    date.setMonth(date.getMonth() + amount)
  }
  return date
}

// Date handling

dayjs.extend(customParseFormat)

export const getAgeAsString = (birthday: string) => {
  const parsedDate = dayjs(
    birthday,
    ['YYYY-MM-DD', 'DD-MM-YYYY', 'DD.MM.YYYY'],
    'de'
  )
  return Math.floor(dayjs().diff(parsedDate, 'year', true)).toString()
}

export const isValidDateString = (
  dateString: string,
  format?: string
): boolean => {
  if (!dateString || typeof dateString !== 'string') {
    return false
  }

  if (format) {
    // Strict parsing with specific format
    return dayjs(dateString, format, true).isValid()
  }

  // Try parsing without specific format
  const parsed = dayjs(dateString)

  // Additional validation to avoid false positives
  // Ensures the date actually makes sense (e.g., not February 31st)
  if (!parsed.isValid()) {
    return false
  }

  // Verify that the parsed date components match the input
  // This helps catch cases where dayjs might do too much automatic correction
  const originalParts = dateString.match(/\d+/g)
  if (!originalParts) {
    return false
  }

  return true
}

// static date options

export const MONTH_OPTIONS = [
  { key: '01', label: 'Jänner' },
  { key: '02', label: 'Februar' },
  { key: '03', label: 'März' },
  { key: '04', label: 'April' },
  { key: '05', label: 'Mai' },
  { key: '06', label: 'Juni' },
  { key: '07', label: 'Juli' },
  { key: '08', label: 'August' },
  { key: '09', label: 'September' },
  { key: '10', label: 'Oktober' },
  { key: '11', label: 'November' },
  { key: '12', label: 'Dezember' },
]

export const generateYearOptions = (startYear: number, endYear: number) => {
  const years = []
  for (let year = startYear; year <= endYear; year++) {
    years.push({
      key: year.toString(),
      label: year.toString(),
    })
  }
  return years
}
