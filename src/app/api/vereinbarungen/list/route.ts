export const dynamic = 'auto'

import { NextResponse } from 'next/server'

const REPORT_LIST = [{ id: '123', name: 'Home Office Vereinbarung' }]

const REPORT_FORM_DEFINITIONS = [
  {
    id: '123',
    form: [
      {
        type: 'text',
        name: 'adresse',
        label: 'Außerbetrieblicher Arbeitsort',
        placeholder: 'Adresse eingeben',
        required: true,
      },
      {
        type: 'select',
        name: 'anteilArbeitszeit',
        label: 'Anteil der Arbeitszeit im Home Office',
        required: true,
        options: [
          { id: 1, name: '10%' },
          { id: 2, name: '20%' },
          { id: 3, name: '30%' },
          { id: 4, name: '40%' },
          { id: 5, name: '50%' },
          { id: 6, name: '60%' },
          { id: 7, name: '70%' },
          { id: 8, name: '80%' },
          { id: 9, name: '90%' },
          { id: 10, name: '100%' },
        ],
      },
      {
        type: 'text',
        name: 'zusatzText',
        label: 'Zusatztext',
        placeholder: 'Zusatztext eingeben',
        required: true,
      },
    ],
  },
]

export async function GET(request: Request) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    return NextResponse.json(
      {
        reportList: REPORT_LIST,
        reportFormDefinitions: REPORT_FORM_DEFINITIONS,
        status: 'success',
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Error processing your request' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // noop
  } catch (error) {
    return NextResponse.json(
      { error: 'Error processing your request' },
      { status: 500 }
    )
  }
}
