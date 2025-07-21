import { DepartmentRepository } from '@/data/repository/department-repository'
import { AuthenticatedRequest, withRole } from '@/lib/middleware/auth-middleware'
import { DepartmentSchema } from '@/lib/validations/server'
import { NextResponse } from 'next/server'

const departmentRepository = new DepartmentRepository()

// GET specific department
export const GET = withRole(['superadmin'])(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const department = await departmentRepository.findById(params.id)
    if (!department) {
      return NextResponse.json(
        { message: 'Department not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(department)
  } catch (error: any) {
    console.error('Error fetching department:', error)
    return NextResponse.json(
      { message: 'Failed to fetch department' },
      { status: 500 }
    )
  }
})

// PUT update department
export const PUT = withRole(['superadmin'])(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
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

    await departmentRepository.update(params.id, {
      ...value,
      updatedBy: request.user!.id,
    })

    const department = await departmentRepository.findById(params.id)
    return NextResponse.json(department)

  } catch (error: any) {
    console.error('Error updating department:', error)
    return NextResponse.json(
      { message: 'Failed to update department' },
      { status: 500 }
    )
  }
})

// DELETE department
export const DELETE = withRole(['superadmin'])(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    await departmentRepository.delete(params.id)
    return NextResponse.json({ message: 'Department deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting department:', error)
    return NextResponse.json(
      { message: 'Failed to delete department' },
      { status: 500 }
    )
  }
})
