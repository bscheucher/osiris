import Holidays from 'date-holidays'
import dayjs from 'dayjs'
import weekday from 'dayjs/plugin/weekday'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import 'dayjs/locale/de'

dayjs.extend(weekOfYear)
dayjs.extend(weekday)
dayjs.locale('de')

const holidaysAT = new Holidays('AT')
holidaysAT.setHoliday('12-24', 'Heilig Abend')
holidaysAT.setHoliday('12-31', 'Silvester')

type AnAbwesenheit = 'ABWESENHEIT' | 'ANWESENHEIT'

export interface ZeitbuchungMetadata {
  lastSyncedAt: string
  umbuchungAvailable: boolean
}

export interface TimeslotEntry {
  jahr: number
  monat: number
  leistungstyp: string
  leistungsdatum: string
  von: string
  bis: string
  pauseVon: string
  pauseBis: string
  dauerStd: number
  taetigkeit: string
  anAbwesenheit: AnAbwesenheit
  seminar: {
    id: number
    seminarBezeichnung: string
    seminarNumber: number
  }
  kostenstelle: number
  leistungsort: string
  hasError: boolean
}

// Helper function to get entries for a specific date
export const getEntriesForDate = (
  calendarEntries: TimeslotEntry[],
  date: string
): TimeslotEntry[] => {
  return calendarEntries.filter((entry) => entry.leistungsdatum === date)
}

export interface MonthEntry {
  month: number
  year: number
  title: string
  days: CalendarDayEntry[]
}

export interface CalendarDayEntry {
  date: string
  isCurrentMonth?: boolean
  isToday: boolean
  isWeekend: boolean
  hasEntries: boolean
  hasError: boolean
  holiday?: string
}

export function generateMonthData(
  startDateStr: string,
  numberOfMonths: number = 3,
  timeBookings: TimeslotEntry[] = []
): { [key: string]: MonthEntry } {
  const monthData: { [key: string]: MonthEntry } = {}
  const startDate = dayjs(startDateStr)
  const today = dayjs()

  // Create a map of bookings by date for easier lookup
  const bookingsByDate = timeBookings.reduce(
    (acc: { [key: string]: TimeslotEntry[] }, booking) => {
      const date = booking.leistungsdatum
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(booking)
      return acc
    },
    {}
  )

  const hasErrors = (bookings: TimeslotEntry[]): boolean => {
    return bookings.some((booking) => !!booking.hasError)
  }

  for (let i = 0; i < numberOfMonths; i++) {
    const currentMonth = startDate.add(i, 'month')
    const monthKey = currentMonth.format('YYYY-MM')

    // Get calendar boundaries
    const firstDayOfMonth = currentMonth.startOf('month')
    const firstDayOfCalendar = firstDayOfMonth.startOf('week')
    const lastDayOfCalendar = firstDayOfCalendar.add(5, 'weeks').add(6, 'days')

    const days: CalendarDayEntry[] = []
    let currentDay = firstDayOfCalendar

    while (
      currentDay.isBefore(lastDayOfCalendar) ||
      currentDay.isSame(lastDayOfCalendar, 'day')
    ) {
      const currentDate = currentDay.format('YYYY-MM-DD')
      const dayBookings = bookingsByDate[currentDate] || []
      const dayOfWeek = currentDay.day()
      const holiday = holidaysAT.isHoliday(new Date(currentDate))

      days.push({
        date: currentDate,
        isCurrentMonth: currentDay.month() === currentMonth.month(),
        isToday: currentDate === today.format('YYYY-MM-DD'),
        holiday: holiday ? holiday[0].name : undefined,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        hasEntries: dayBookings.length > 0,
        hasError: dayBookings.length > 0 && hasErrors(dayBookings),
      })
      currentDay = currentDay.add(1, 'day')
    }

    monthData[monthKey] = {
      month: currentMonth.month() + 1,
      year: currentMonth.year(),
      title: currentMonth.format('MMMM YYYY'),
      days,
    }
  }

  return monthData
}
