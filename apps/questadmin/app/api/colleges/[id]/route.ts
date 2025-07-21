import { CollegeRepository } from '@/data/repository/college-repository'
import { AuthenticatedRequest, withRole } from '@/lib/middleware/auth-middleware'
import { CollegeSchema } from '@/lib/validations/server'
import { NextResponse } from 'next/server'

const collegeRepository = new CollegeRepository()

// GET specific college
export const GET = withRole(['superadmin'])(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const college = await collegeRepository.findById(params.id)
    if (!college) {
      return NextResponse.json(
        { message: 'College not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(college)
  } catch (error: any) {
    console.error('Error fetching college:', error)
    return NextResponse.json(
      { message: 'Failed to fetch college' },
      { status: 500 }
    )
  }
})

// PUT update college
export const PUT = withRole(['superadmin'])(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const body = await request.json()
    
    // Validate input
    const { error, value } = CollegeSchema.validate(body)
    if (error) {
      return NextResponse.json(
        { message: error.details[0].message },
        { status: 400 }
      )
    }

    await collegeRepository.update(params.id, {
      ...value,
      updatedBy: request.user!.id,
    })

    const college = await collegeRepository.findById(params.id)
    return NextResponse.json(college)

  } catch (error: any) {
    console.error('Error updating college:', error)
    return NextResponse.json(
      { message: 'Failed to update college' },
      { status: 500 }
    )
  }
})

// DELETE college
export const DELETE = withRole(['superadmin'])(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    await collegeRepository.delete(params.id)
    return NextResponse.json({ message: 'College deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting college:', error)
    return NextResponse.json(
      { message: 'Failed to delete college' },
      { status: 500 }
    )
  }
})
