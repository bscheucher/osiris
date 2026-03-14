import {AbwesenheitStatus} from '@/lib/utils/abwesenheit-utils'

export interface Abwesenheit {
  createdAt: string
  startDate: string
  endDate: string
  legacyTageCalculation: number | null | undefined
  consumesInCurrentUrlaubsjahr: number | null | undefined
  consumesInPreviousUrlaubsjahr: number | null | undefined
  consumesInNextUrlaubsjahr: number | null | undefined
  status: AbwesenheitStatus
  balanceAfter: number | null | undefined
  comment: string | null | undefined
  commentFuehrungskraft: string | null | undefined
}

export interface Urlaubsjahr {
  firstDay: string
  lastDay: string
  totalConsumption: number | null | undefined
  balanceAfterLastDay: number
  anspruch: number
  uebertrag: number
  balanceAtStart: number
  abwesenheiten: Abwesenheit[]
}

export interface NextUrlaubsjahr {
  firstDay: string
  lastDay: string
  anspruch: number
  uebertrag: number
  balanceAtStart: number
  abwesenheiten: Abwesenheit[]
}

export interface HistoricalAbwesenheit {
  createdAt: string
  startDate: string
  endDate: string
  durationInDays: number
  comment: string | null | undefined
  commentFuehrungskraft: string | null | undefined
}

export interface AbwesenheitenOverviewV2Dto {
  currentUrlaubsjahr: Urlaubsjahr
  nextUrlaubsjahr: NextUrlaubsjahr
  historicalAbwesenheiten: HistoricalAbwesenheit[]
}

// For local development: replace the executeGET call in page.tsx with setOverview(MOCK_OVERVIEW_EMPTY), setOverview(MOCK_OVERVIEW) or MOCK_OVERVIEW_WITH_LEGACY_OVERLAP
export const MOCK_OVERVIEW_EMPTY: AbwesenheitenOverviewV2Dto = {
  currentUrlaubsjahr: {
    firstDay: '2025-01-01',
    lastDay: '2025-12-31',
    totalConsumption: 0,
    balanceAfterLastDay: 25,
    anspruch: 25,
    uebertrag: 0,
    balanceAtStart: 25,
    abwesenheiten: [],
  },
  nextUrlaubsjahr: {
    firstDay: '2026-01-01',
    lastDay: '2026-12-31',
    anspruch: 25,
    uebertrag: 0,
    balanceAtStart: 25,
    abwesenheiten: [],
  },
  historicalAbwesenheiten: [],
}

// For local development: replace the executeGET call in page.tsx with setOverview(MOCK_OVERVIEW) or MOCK_OVERVIEW_WITH_LEGACY_OVERLAP
// MOCK_OVERVIEW_WITH_LEGACY_OVERLAP triggers the "cannot display total consumption" scenario:
// an Abwesenheit crosses the Urlaubsjahr boundary but has no rework consumes* fields — only legacyTageCalculation.
export const MOCK_OVERVIEW_WITH_LEGACY_OVERLAP: AbwesenheitenOverviewV2Dto = {
  historicalAbwesenheiten: [],
  nextUrlaubsjahr: {
    firstDay: '2026-01-01',
    lastDay: '2026-12-31',
    anspruch: 25,
    uebertrag: 0,
    balanceAtStart: 25,
    abwesenheiten: [],
  },
  currentUrlaubsjahr: {
    firstDay: '2025-01-01',
    lastDay: '2025-12-31',
    totalConsumption: 13,
    balanceAfterLastDay: 12,
    anspruch: 25,
    uebertrag: 0,
    balanceAtStart: 25,
    abwesenheiten: [
      {
        createdAt: '2025-02-14T09:23:11',
        startDate: '2025-03-10',
        endDate: '2025-03-14',
        legacyTageCalculation: 5,
        consumesInCurrentUrlaubsjahr: 5,
        consumesInPreviousUrlaubsjahr: null,
        consumesInNextUrlaubsjahr: null,
        status: AbwesenheitStatus.ACCEPTED,
        balanceAfter: 20,
        comment: 'Familienurlaub',
        commentFuehrungskraft: null,
      },
      {
        // Overlaps year-end, but consumes* not yet calculated — only legacyTageCalculation known.
        // This triggers cannotDisplayTotalConsumption.
        createdAt: '2025-12-01T10:00:00',
        startDate: '2025-12-29',
        endDate: '2026-01-05',
        legacyTageCalculation: 8,
        consumesInCurrentUrlaubsjahr: null,
        consumesInPreviousUrlaubsjahr: null,
        consumesInNextUrlaubsjahr: null,
        status: AbwesenheitStatus.NEW,
        balanceAfter: null,
        comment: 'Jahreswechsel',
        commentFuehrungskraft: null,
      },
    ],
  },
}

// For local development: replace the executeGET call in page.tsx with setOverview(MOCK_OVERVIEW)
export const MOCK_OVERVIEW: AbwesenheitenOverviewV2Dto = {
  nextUrlaubsjahr: {
    firstDay: '2026-01-01',
    lastDay: '2026-12-31',
    anspruch: 25,
    uebertrag: 17,
    balanceAtStart: 42,
    abwesenheiten: [
      {
        createdAt: '2025-11-15T10:00:00',
        startDate: '2026-02-09',
        endDate: '2026-02-13',
        legacyTageCalculation: 5,
        consumesInCurrentUrlaubsjahr: 5,
        consumesInPreviousUrlaubsjahr: null,
        consumesInNextUrlaubsjahr: null,
        status: AbwesenheitStatus.ACCEPTED,
        balanceAfter: 37,
        comment: 'Winterurlaub',
        commentFuehrungskraft: null,
      },
    ],
  },
  currentUrlaubsjahr: {
    firstDay: '2025-01-01',
    lastDay: '2025-12-31',
    totalConsumption: 11,
    balanceAfterLastDay: 17,
    anspruch: 25,
    uebertrag: 3,
    balanceAtStart: 28,
    abwesenheiten: [
      {
        createdAt: '2025-02-14T09:23:11',
        startDate: '2025-03-10',
        endDate: '2025-03-14',
        legacyTageCalculation: 5,
        consumesInCurrentUrlaubsjahr: 5,
        consumesInPreviousUrlaubsjahr: null,
        consumesInNextUrlaubsjahr: null,
        status: AbwesenheitStatus.ACCEPTED,
        balanceAfter: 20,
        comment: 'Familienurlaub',
        commentFuehrungskraft: null,
      },
      {
        createdAt: '2025-11-30T14:05:42',
        startDate: '2025-12-29',
        endDate: '2026-01-09',
        legacyTageCalculation: 10,
        consumesInCurrentUrlaubsjahr: 3,
        consumesInPreviousUrlaubsjahr: null,
        consumesInNextUrlaubsjahr: 7,
        status: AbwesenheitStatus.VALID,
        balanceAfter: 17,
        comment: 'Silvester und Neujahr',
        commentFuehrungskraft: null,
      },
      {
        createdAt: '2024-12-01T08:00:00',
        startDate: '2024-12-27',
        endDate: '2025-01-03',
        legacyTageCalculation: 8,
        consumesInCurrentUrlaubsjahr: 3,
        consumesInPreviousUrlaubsjahr: 5,
        consumesInNextUrlaubsjahr: null,
        status: AbwesenheitStatus.ACCEPTED,
        balanceAfter: 25,
        comment: null,
        commentFuehrungskraft: 'Genehmigt, bitte Übergabe sicherstellen.',
      },
      {
        // REJECTED — Dauer should NOT be displayed
        createdAt: '2025-04-01T11:00:00',
        startDate: '2025-05-05',
        endDate: '2025-05-09',
        legacyTageCalculation: 5,
        consumesInCurrentUrlaubsjahr: 5,
        consumesInPreviousUrlaubsjahr: null,
        consumesInNextUrlaubsjahr: null,
        status: AbwesenheitStatus.REJECTED,
        balanceAfter: null,
        comment: 'Urlaub im Mai',
        commentFuehrungskraft: 'Leider nicht möglich.',
      },
    ],
  },
  historicalAbwesenheiten: [
    {
      createdAt: '2023-06-01T10:00:00',
      startDate: '2023-07-10',
      endDate: '2023-07-21',
      durationInDays: 8,
      comment: 'Sommerurlaub mit Familie',
      commentFuehrungskraft: null,
    },
    {
      createdAt: '2023-11-05T14:00:00',
      startDate: '2023-12-23',
      endDate: '2024-01-05',
      durationInDays: 9,
      comment: 'Weihnachtsurlaub',
      commentFuehrungskraft: 'Jahresabschluss vorher fertig',
    },
    {
      createdAt: '2024-06-10T09:00:00',
      startDate: '2024-07-15',
      endDate: '2024-08-02',
      durationInDays: 13,
      comment: 'Sommerurlaub Kroatien',
      commentFuehrungskraft: 'Vertretung durch Markus geregelt',
    },
    {
      createdAt: '2024-10-14T08:30:00',
      startDate: '2024-10-28',
      endDate: '2024-11-01',
      durationInDays: 5,
      comment: 'Herbstferien',
      commentFuehrungskraft: null,
    },
  ],
}
