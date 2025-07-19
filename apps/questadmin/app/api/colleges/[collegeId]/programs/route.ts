import { getPrograms } from '@/data/services/program-service'
import { NextResponse } from 'next/server'

export async function GET(req: Request, { params }: any) {
  const { collegeId } = params
  const programs = await getPrograms(collegeId)
  return NextResponse.json(programs)
}
