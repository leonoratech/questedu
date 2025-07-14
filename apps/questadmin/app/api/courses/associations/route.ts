import { CourseRepository } from '@/data/repository/course-service'
import { requireAuth } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const authResult = await requireAuth()(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  try {
    const url = new URL(request.url)
    const programId = url.searchParams.get('programId')
    const subjectId = url.searchParams.get('subjectId')
    const yearOrSemester = url.searchParams.get('yearOrSemester')

    const courseRepo = new CourseRepository()
    let courses = []

    if (programId && yearOrSemester) {
      // Get courses by program and year/semester
      courses = await courseRepo.getCoursesByProgramAndYear(programId, parseInt(yearOrSemester))
    } else if (programId) {
      // Get courses by program
      courses = await courseRepo.getCoursesByProgram(programId)
    } else if (subjectId) {
      // Get courses by subject
      courses = await courseRepo.getCoursesBySubject(subjectId)
    } else {
      return NextResponse.json(
        { error: 'Either programId or subjectId is required' },
        { status: 400 }
      )
    }

    return NextResponse.json({ courses })

  } catch (error) {
    console.error('Error fetching associated courses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
