export const dynamic = 'auto'

import dayjs from 'dayjs'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

import {
  MITARBEITER_OPTIONS,
  VERTRETUNGSPLANUNG_GRUND,
} from '@/app/(authenticated)/vertretungsplanung/vertretungsplanung-utils'

const MA_WEEK_LIST = [
  {
    id: 29191911,
    name: 'Anja Nemec',
    punkte: '10/10',
    email: 'a.nemec@gmail.com',
    phone: '0660 288 182 18',
    hasExperience: true,
    availability: ['online', 'onSite'],
  },
  {
    id: 29191912,
    name: 'Karl Moser',
    punkte: '10/10',
    email: 'karl.moser@gmail.com',
    phone: '0660 288 182 18',
    hasExperience: true,
    availability: ['online', 'onSite'],
  },
  {
    id: 29191913,
    name: 'Igor Stiglitz',
    punkte: '10/5',
    email: 'i.stiglitz@gmail.com',
    phone: '0660 288 182 18',
    hasExperience: false,
    availability: ['onSite'],
  },
  {
    id: 29191914,
    name: 'Thomas Behringer',
    punkte: '5/5',
    email: 'tom.behringer@gmail.com',
    phone: '0660 288 182 18',
    hasExperience: false,
    availability: ['online', 'onSite'],
  },
  {
    id: 29191915,
    name: 'Bernd Markovic',
    punkte: '5/5',
    email: 'bm@gmail.com',
    phone: '0660 288 182 18',
    hasExperience: false,
    availability: ['online'],
  },
]

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams)

    await new Promise((resolve) => setTimeout(resolve, 500))

    const mitarbeiter = MITARBEITER_OPTIONS.find(
      (option) => option.key === searchParams.trainer
    )
    const grund = VERTRETUNGSPLANUNG_GRUND.find(
      (option) => option.key === searchParams.trainer
    )

    const combinedResponse = {
      success: true,
      data: {
        metaData: {
          mitarbeiter,
          grund,
        },
        vertretungsTables: [
          {
            seminarTitle: 'Deutsch_PS Nord_Standard_A1_K_57',
            seminarId: 100203223,
            weekData: [
              {
                date: dayjs('2025-02-06').format(),
                list: MA_WEEK_LIST,
                selection: 29191911,
              },
              {
                date: dayjs('2025-02-07').format(),
                list: MA_WEEK_LIST.slice(0, 4),
                selection: 29191911,
              },
              {
                date: dayjs('2025-02-10').format(),
                list: MA_WEEK_LIST.slice(0, 3),
                selection: 29191911,
              },
              {
                date: dayjs('2025-02-11').format(),
                list: MA_WEEK_LIST,
                selection: 29191911,
              },
              {
                date: dayjs('2025-02-12').format(),
                list: MA_WEEK_LIST.slice(0, 4),
                selection: 29191911,
              },
              {
                date: dayjs('2025-02-13').format(),
                list: MA_WEEK_LIST.slice(0, 3),
                selection: 29191911,
              },
              {
                date: dayjs('2025-02-14').format(),
                list: MA_WEEK_LIST,
                selection: 29191911,
              },
              {
                date: dayjs('2025-02-17').format(),
                list: MA_WEEK_LIST.slice(0, 4),
                selection: 29191911,
              },
            ],
          },
          {
            seminarTitle: 'Englisch_Standard_A1_K_57',
            seminarId: 100203223,
            weekData: [
              {
                date: dayjs('2025-02-06').format(),
                list: MA_WEEK_LIST.slice(1, 4),
              },
              {
                date: dayjs('2025-02-07').format(),
                list: MA_WEEK_LIST.slice(2, 4),
              },
              {
                date: dayjs('2025-02-10').format(),
                list: MA_WEEK_LIST.slice(1, 4),
              },
              {
                date: dayjs('2025-02-12').format(),
                list: MA_WEEK_LIST.slice(0, 4),
              },
              {
                date: dayjs('2025-02-13').format(),
                list: [],
              },
              {
                date: dayjs('2025-02-14').format(),
                list: MA_WEEK_LIST,
              },
              {
                date: dayjs('2025-02-15').format(),
                list: MA_WEEK_LIST.slice(0, 4),
              },
            ],
          },
        ],
      },
    }

    return NextResponse.json(combinedResponse, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        data: null,
        success: true,
        error: 'Error processing your request',
        message: '',
      },
      { status: 500 }
    )
  }
}
