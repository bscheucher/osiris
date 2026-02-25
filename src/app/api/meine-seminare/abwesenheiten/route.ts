import { NextResponse } from 'next/server'
import dummyData from '@/app/(authenticated)/meine-seminare/dummy-data/dummy-data.json'

export async function GET() {
  return NextResponse.json(dummyData)
}
