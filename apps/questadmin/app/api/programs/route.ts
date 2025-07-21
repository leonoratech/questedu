import { ProgramRepository } from '@/data/repository/program-repository'
import { AuthenticatedRequest, withRole } from '@/lib/middleware/auth-middleware'
import { ProgramSchema } from '@/lib/validations/server'
import { NextResponse } from 'next/server'

const programRepository = new ProgramRepository()

// GET all programs
export const GET = withRole(['superadmin'])(async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('departmentId')

    let programs
    if (departmentId) {
      programs = await programRepository.findByDepartment(departmentId)
    } else {
      programs = await programRepository.findAll()
    }

    return NextResponse.json(programs)
  } catch (error: any) {
    console.error('Error fetching programs:', error)
    return NextResponse.json(
      { message: 'Failed to fetch programs' },
      { status: 500 }
    )
  }
})

// POST create program
export const POST = withRole(['superadmin'])(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json()
    
    // Validate input
    const { error, value } = ProgramSchema.validate(body)
    if (error) {
      return NextResponse.json(
        { message: error.details[0].message },
        { status: 400 }
      )
    }

    // Check if program name already exists in the department
    const existingProgram = await programRepository.findByName(value.name)
    if (existingProgram && existingProgram.departmentId === value.departmentId) {
      return NextResponse.json(
        { message: 'Program with this name already exists in the department' },
        { status: 409 }
      )
    }

    const program = await programRepository.create({
      ...value,
      createdBy: request.user!.id,
    })

    return NextResponse.json(program, { status: 201 })

  } catch (error: any) {
    console.error('Error creating program:', error)
    return NextResponse.json(
      { message: 'Failed to create program' },
      { status: 500 }
    )
  }
})
