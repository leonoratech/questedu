import { SubjectRepository } from '@/data/repository/subject-service'
import { requireAuth } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const subjectRepo = new SubjectRepository()

const SubjectSchema = z.object({
  name: z.string().min(2),
  programId: z.string(),
  collegeId: z.string(),
  year: z.number().min(1),
  medium: z.enum(['English', 'Telugu']),
  instructorId: z.string(),
  description: z.string().optional(),
  credits: z.number().optional(),
  prerequisites: z.array(z.string()).optional()
})

export async function GET(
  req: NextRequest,
  { params }: any
) {
  const { collegeId } = params
  const programId = req.nextUrl.searchParams.get('programId') || undefined
  const subjects = await subjectRepo.getSubjects(collegeId, programId)
  return NextResponse.json(subjects)
}

export async function POST(
  req: NextRequest,
  { params }: any
) {
  const auth = await requireAuth()(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { collegeId } = params
  const body = await req.json()
  const parsed = SubjectSchema.safeParse({ ...body, collegeId })
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const subject = await subjectRepo.createSubject({ ...parsed.data, isActive: true, createdAt: new Date(), updatedAt: new Date(), createdBy: auth.user.uid })
  return NextResponse.json(subject)
}
