import { SubjectRepository } from '@/data/repository/subject-repository'
import { AuthenticatedRequest, withRole } from '@/lib/middleware/auth-middleware'
import { SubjectSchema } from '@/lib/validations/server'
import { NextResponse } from 'next/server'

const subjectRepository = new SubjectRepository()

// GET specific subject
export const GET = withRole(['superadmin', 'instructor'])(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const subject = await subjectRepository.findById(params.id)
    if (!subject) {
      return NextResponse.json(
        { message: 'Subject not found' },
        { status: 404 }
      )
    }

    // Instructors can only access their own subjects
    if (request.user?.role === 'instructor' && subject.instructorId !== request.user.id) {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      )
    }

    return NextResponse.json(subject)
  } catch (error: any) {
    console.error('Error fetching subject:', error)
    return NextResponse.json(
      { message: 'Failed to fetch subject' },
      { status: 500 }
    )
  }
})

// PUT update subject
export const PUT = withRole(['superadmin', 'instructor'])(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const body = await request.json()
    
    // Get existing subject to check permissions
    const existingSubject = await subjectRepository.findById(params.id)
    if (!existingSubject) {
      return NextResponse.json(
        { message: 'Subject not found' },
        { status: 404 }
      )
    }

    // Instructors can only update their own subjects
    if (request.user?.role === 'instructor' && existingSubject.instructorId !== request.user.id) {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      )
    }
    
    // Validate input
    const { error, value } = SubjectSchema.validate(body)
    if (error) {
      return NextResponse.json(
        { message: error.details[0].message },
        { status: 400 }
      )
    }

    // Instructors cannot change the instructor assignment
    if (request.user?.role === 'instructor' && value.instructorId !== request.user.id) {
      return NextResponse.json(
        { message: 'Cannot change instructor assignment' },
        { status: 403 }
      )
    }

    await subjectRepository.update(params.id, {
      ...value,
      updatedBy: request.user!.id,
    })

    const subject = await subjectRepository.findById(params.id)
    return NextResponse.json(subject)

  } catch (error: any) {
    console.error('Error updating subject:', error)
    return NextResponse.json(
      { message: 'Failed to update subject' },
      { status: 500 }
    )
  }
})

// DELETE subject
export const DELETE = withRole(['superadmin'])(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    await subjectRepository.delete(params.id)
    return NextResponse.json({ message: 'Subject deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting subject:', error)
    return NextResponse.json(
      { message: 'Failed to delete subject' },
      { status: 500 }
    )
  }
})
