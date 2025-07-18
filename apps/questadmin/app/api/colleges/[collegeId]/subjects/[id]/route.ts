import { SubjectRepository } from '@/data/repository/subject-service'
import { requireAuth } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const subjectRepo = new SubjectRepository()

const UpdateSubjectSchema = z.object({
  name: z.string().min(2).optional(),
  year: z.number().min(1).optional(),
  medium: z.enum(['English', 'Telugu']).optional(),
  instructorId: z.string().optional(),
  description: z.string().optional(),
  credits: z.number().optional(),
  prerequisites: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
})

export async function PUT(
  req: NextRequest,
  { params }: any
) {
  const auth = await requireAuth()(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id } = params
  const body = await req.json()
  const parsed = UpdateSubjectSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  await subjectRepo.updateSubject(id, { ...parsed.data, updatedAt: new Date() })
  return NextResponse.json({ success: true })
}

export async function DELETE(
  req: NextRequest,
  { params }: any
) {
  const auth = await requireAuth()(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id } = params
  await subjectRepo.deleteSubject(id)
  return NextResponse.json({ success: true })
}
