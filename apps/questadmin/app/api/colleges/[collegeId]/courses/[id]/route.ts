import { CourseRepository } from '@/data/repository/course-service'
import { requireAuth } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const courseRepo = new CourseRepository()

const UpdateCourseSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  instructorId: z.string().optional(),
  programId: z.string().optional(),
  subjectId: z.string().optional(),
  year: z.number().min(1).optional(),
  medium: z.enum(['English', 'Telugu']).optional(),
})

export async function PUT(
  req: NextRequest,
  context: any
) {
  const auth = await requireAuth()(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id } = context.params
  const body = await req.json()
  const parsed = UpdateCourseSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  await courseRepo.updateCourse(id, { ...parsed.data, updatedAt: new Date() })
  return NextResponse.json({ success: true })
}

export async function DELETE(
  req: NextRequest,
  context: any
) {
  const auth = await requireAuth()(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id } = context.params
  await courseRepo.deleteCourse(id)
  return NextResponse.json({ success: true })
}
