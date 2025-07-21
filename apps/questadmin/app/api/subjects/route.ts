import { SubjectRepository } from '@/data/repository/subject-repository'
import { AuthenticatedRequest, withRole } from '@/lib/middleware/auth-middleware'
import { SubjectSchema } from '@/lib/validations/server'
import { NextResponse } from 'next/server'

const subjectRepository = new SubjectRepository()

// GET all subjects
export const GET = withRole(['superadmin', 'instructor'])(async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const programId = searchParams.get('programId')
    const instructorId = searchParams.get('instructorId')
    const year = searchParams.get('year')

    let subjects
    if (programId && year) {
      subjects = await subjectRepository.findByYear(programId, parseInt(year))
    } else if (programId) {
      subjects = await subjectRepository.findByProgram(programId)
    } else if (instructorId) {
      subjects = await subjectRepository.findByInstructor(instructorId)
    } else if (request.user?.role === 'instructor') {
      // Instructors can only see their own subjects
      subjects = await subjectRepository.findByInstructor(request.user.id)
    } else {
      subjects = await subjectRepository.findAll()
    }

    return NextResponse.json(subjects)
  } catch (error: any) {
    console.error('Error fetching subjects:', error)
    return NextResponse.json(
      { message: 'Failed to fetch subjects' },
      { status: 500 }
    )
  }
})

// POST create subject
export const POST = withRole(['superadmin'])(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json()
    
    // Validate input
    const { error, value } = SubjectSchema.validate(body)
    if (error) {
      return NextResponse.json(
        { message: error.details[0].message },
        { status: 400 }
      )
    }

    const subject = await subjectRepository.create({
      ...value,
      createdBy: request.user!.id,
    })

    return NextResponse.json(subject, { status: 201 })

  } catch (error: any) {
    console.error('Error creating subject:', error)
    return NextResponse.json(
      { message: 'Failed to create subject' },
      { status: 500 }
    )
  }
})
