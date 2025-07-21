import { DepartmentRepository } from '@/data/repository/department-repository'
import { AuthenticatedRequest, withRole } from '@/lib/middleware/auth-middleware'
import { DepartmentSchema } from '@/lib/validations/server'
import { NextResponse } from 'next/server'

const departmentRepository = new DepartmentRepository()

// GET all departments
export const GET = withRole(['superadmin'])(async (request: AuthenticatedRequest) => {
  try {
    const departments = await departmentRepository.findAll()
    return NextResponse.json(departments)
  } catch (error: any) {
    console.error('Error fetching departments:', error)
    return NextResponse.json(
      { message: 'Failed to fetch departments' },
      { status: 500 }
    )
  }
})

// POST create department
export const POST = withRole(['superadmin'])(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json()
    
    // Validate input
    const { error, value } = DepartmentSchema.validate(body)
    if (error) {
      return NextResponse.json(
        { message: error.details[0].message },
        { status: 400 }
      )
    }

    const id = await departmentRepository.create({
      ...value,
      createdBy: request.user!.id,
    })

    const department = await departmentRepository.findById(id)
    return NextResponse.json(department, { status: 201 })

  } catch (error: any) {
    console.error('Error creating department:', error)
    return NextResponse.json(
      { message: 'Failed to create department' },
      { status: 500 }
    )
  }
})
