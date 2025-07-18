import { CourseRepository } from '@/data/repository/course-service'
import { requireAuth } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const courseRepo = new CourseRepository()

const CourseSchema = z.object({
  title: z.string().min(2),
  description: z.string(),
  instructorId: z.string(),
  programId: z.string(),
  subjectId: z.string(),
  year: z.number().min(1),
  medium: z.enum(['English', 'Telugu']),
  collegeId: z.string(),
})

export async function GET(req: NextRequest, context: any) {
  const { collegeId } = context.params
  const programId = req.nextUrl.searchParams.get('programId') || undefined
  const subjectId = req.nextUrl.searchParams.get('subjectId') || undefined
  const courses = await courseRepo.getCourses(collegeId, programId, subjectId)
  return NextResponse.json(courses)
}

export async function POST(req: NextRequest, context: any) {
  const auth = await requireAuth()(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { collegeId } = context.params
  const body = await req.json()
  const parsed = CourseSchema.safeParse({ ...body, collegeId })
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const course = await courseRepo.createCourse({ ...parsed.data, createdAt: new Date(), updatedAt: new Date(), createdBy: auth.user.uid })
  return NextResponse.json(course)
}
