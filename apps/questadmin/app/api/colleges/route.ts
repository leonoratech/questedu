import { CollegeRepository } from '@/data/repository/college-repository'
import { AuthenticatedRequest, withRole } from '@/lib/middleware/auth-middleware'
import { CollegeSchema } from '@/lib/validations/server'
import { NextResponse } from 'next/server'

const collegeRepository = new CollegeRepository()

// GET all colleges
export const GET = withRole(['superadmin'])(async (request: AuthenticatedRequest) => {
  try {
    const colleges = await collegeRepository.findAll()
    return NextResponse.json(colleges)
  } catch (error: any) {
    console.error('Error fetching colleges:', error)
    return NextResponse.json(
      { message: 'Failed to fetch colleges' },
      { status: 500 }
    )
  }
})

// POST create college
export const POST = withRole(['superadmin'])(async (request: AuthenticatedRequest) => {
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

    // Check if college with same name exists
    const existingCollege = await collegeRepository.findByName(value.name)
    if (existingCollege) {
      return NextResponse.json(
        { message: 'College with this name already exists' },
        { status: 409 }
      )
    }

    const collegeId = await collegeRepository.create({
      ...value,
      createdBy: request.user!.id,
    })

    const college = await collegeRepository.findById(collegeId)
    return NextResponse.json(college, { status: 201 })

  } catch (error: any) {
    console.error('Error creating college:', error)
    return NextResponse.json(
      { message: 'Failed to create college' },
      { status: 500 }
    )
  }
})
