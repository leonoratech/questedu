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
    
    // Validate request body
    const validation = CourseAssociationSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.issues },
        { status: 400 }
      )
    }

    const associationData = validation.data

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

    // Check permissions - only course owner or superadmin can manage associations
    if (user.role !== UserRole.SUPERADMIN && course.instructorId !== user.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Validate the association data by checking if referenced entities exist
    const [college, program, subject] = await Promise.all([
      collegeRepo.getById(associationData.collegeId),
      programRepo.getById(associationData.programId),
      subjectRepo.getById(associationData.subjectId)
    ])

    if (!college) {
      return NextResponse.json({ error: 'College not found' }, { status: 400 })
    }

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 400 })
    }

    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 400 })
    }

    // Verify that program belongs to college
    if (program.collegeId !== associationData.collegeId) {
      return NextResponse.json({ error: 'Program does not belong to the specified college' }, { status: 400 })
    }

    // Verify that subject belongs to program
    if (subject.programId !== associationData.programId) {
      return NextResponse.json({ error: 'Subject does not belong to the specified program' }, { status: 400 })
    }

    // Verify year/semester is valid for the program
    if (associationData.yearOrSemester > program.yearsOrSemesters) {
      return NextResponse.json({ 
        error: `Year/semester cannot exceed program duration (${program.yearsOrSemesters})` 
      }, { status: 400 })
    }

    // Create the association with cached names
    const association: CourseAssociation = {
      collegeId: associationData.collegeId,
      collegeName: college.name,
      programId: associationData.programId,
      programName: program.name,
      yearOrSemester: associationData.yearOrSemester,
      subjectId: associationData.subjectId,
      subjectName: subject.name
    }

    // Update course with association
    await courseRepo.updateCourseAssociation(courseId, association)

    return NextResponse.json({ 
      message: 'Course association created successfully',
      association 
    })

  } catch (error) {
    console.error('Error creating course association:', error)
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

    // Check permissions - only course owner or superadmin can manage associations
    if (user.role !== UserRole.SUPERADMIN && course.instructorId !== user.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Remove the association
    await courseRepo.removeCourseAssociation(courseId)

    return NextResponse.json({ 
      message: 'Course association removed successfully' 
    })

  } catch (error) {
    console.error('Error removing course association:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
