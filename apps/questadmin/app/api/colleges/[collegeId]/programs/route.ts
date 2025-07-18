import { ProgramRepository } from '@/data/repository/program-service'
import { requireAuth } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const programRepo = new ProgramRepository()

const ProgramSchema = z.object({
  name: z.string().min(2),
  departmentId: z.string(),
  years: z.number().min(1),
  description: z.string().optional(),
  collegeId: z.string(),
  medium: z.enum(['English', 'Telugu'])
})

export async function GET(
  req: NextRequest,
  { params }: any
) {
  const { collegeId } = params
  const departmentId = req.nextUrl.searchParams.get('departmentId') || undefined
  const programs = await programRepo.getPrograms(collegeId, departmentId)
  return NextResponse.json(programs)
}

export async function POST(
  req: NextRequest,
  { params }: any
) {
  const auth = await requireAuth()(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { collegeId } = params
  const body = await req.json()
  const parsed = ProgramSchema.safeParse({ ...body, collegeId })
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const program = await programRepo.createProgram({ 
    ...parsed.data, 
    description: parsed.data.description || '', // Ensure description is always a string
    isActive: true, 
    createdAt: new Date(), 
    updatedAt: new Date(), 
    createdBy: auth.user.uid 
  })
  return NextResponse.json(program)
}
