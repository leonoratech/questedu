// Only support single college (app-level)
import { getDefaultCollege } from '@/data/services/college-service'
import { NextResponse } from 'next/server'

export async function GET() {
  const college = await getDefaultCollege()
  return NextResponse.json({ college })
}
