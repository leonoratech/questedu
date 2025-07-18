import { CourseAssociation } from '@/data/models/course'
import { UserRole } from '@/data/models/user-model'
import { CollegeRepository } from '@/data/repository/college-service'
import { CourseRepository } from '@/data/repository/course-service'
import { ProgramRepository } from '@/data/repository/program-service'
import { SubjectRepository } from '@/data/repository/subject-service'
import { CourseAssociationSchema } from '@/data/validation/validation-schemas'
import { requireAuth } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth()(request)
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }
  const { user } = authResult
  const { id: courseId } = await params
  try {
    const body = await request.json()
    // Validate request body as array of associations
    const arraySchema = CourseAssociationSchema.array().min(1)
    const validation = arraySchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.issues },
        { status: 400 }
      )
    }
    const associationsData = validation.data
    // Initialize repositories
    const courseRepo = new CourseRepository()
    const collegeRepo = new CollegeRepository()
    const programRepo = new ProgramRepository()
    const subjectRepo = new SubjectRepository()
    // Check if course exists and user has permission
    const course = await courseRepo.getById(courseId)
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    if (user.role !== UserRole.SUPERADMIN && course.instructorId !== user.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    // Validate each association
    const validatedAssociations: CourseAssociation[] = []
    for (const associationData of associationsData) {
      const [college, program, subject] = await Promise.all([
        collegeRepo.getById(associationData.collegeId),
        programRepo.getById(associationData.programId),
        subjectRepo.getById(associationData.subjectId)
      ])
      if (!college) {
        return NextResponse.json({ error: 'College not found', details: associationData }, { status: 400 })
      }
      if (!program) {
        return NextResponse.json({ error: 'Program not found', details: associationData }, { status: 400 })
      }
      if (!subject) {
        return NextResponse.json({ error: 'Subject not found', details: associationData }, { status: 400 })
      }
      if (program.collegeId !== associationData.collegeId) {
        return NextResponse.json({ error: 'Program does not belong to the specified college', details: associationData }, { status: 400 })
      }
      if (subject.programId !== associationData.programId) {
        return NextResponse.json({ error: 'Subject does not belong to the specified program', details: associationData }, { status: 400 })
      }
      if (associationData.yearOrSemester > program.years) {
        return NextResponse.json({ 
          error: `Year/semester cannot exceed program duration (${program.years})`,
          details: associationData
        }, { status: 400 })
      }
      validatedAssociations.push({
        collegeId: associationData.collegeId,
        collegeName: college.name,
        programId: associationData.programId,
        programName: program.name,
        yearOrSemester: associationData.yearOrSemester,
        subjectId: associationData.subjectId,
        subjectName: subject.name
      })
    }
    // Update course with all associations
    await courseRepo.updateCourseAssociations(courseId, validatedAssociations)
    return NextResponse.json({ 
      message: 'Course associations updated successfully',
      associations: validatedAssociations
    })
  } catch (error) {
    console.error('Error updating course associations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth()(request)
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }
  const { user } = authResult
  const { id: courseId } = await params
  try {
    const courseRepo = new CourseRepository()
    // Check if course exists and user has permission
    const course = await courseRepo.getById(courseId)
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    if (user.role !== UserRole.SUPERADMIN && course.instructorId !== user.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    // Remove all associations
    await courseRepo.removeAllCourseAssociations(courseId)
    return NextResponse.json({ 
      message: 'All course associations removed successfully' 
    })
  } catch (error) {
    console.error('Error removing course associations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
