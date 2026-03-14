export const dynamic = 'auto'

import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // noop
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
