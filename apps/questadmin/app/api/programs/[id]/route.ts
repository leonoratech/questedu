import { ProgramRepository } from '@/data/repository/program-repository'
import { AuthenticatedRequest, withRole } from '@/lib/middleware/auth-middleware'
import { ProgramSchema } from '@/lib/validations/server'
import { NextResponse } from 'next/server'

const programRepository = new ProgramRepository()

// GET specific program
export const GET = withRole(['superadmin'])(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const program = await programRepository.findById(params.id)
    if (!program) {
      return NextResponse.json(
        { message: 'Program not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(program)
  } catch (error: any) {
    console.error('Error fetching program:', error)
    return NextResponse.json(
      { message: 'Failed to fetch program' },
      { status: 500 }
    )
  }
})

// PUT update program
export const PUT = withRole(['superadmin'])(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
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

    await programRepository.update(params.id, {
      ...value,
      updatedBy: request.user!.id,
    })

    const program = await programRepository.findById(params.id)
    return NextResponse.json(program)

  } catch (error: any) {
    console.error('Error updating program:', error)
    return NextResponse.json(
      { message: 'Failed to update program' },
      { status: 500 }
    )
  }
})

// DELETE program
export const DELETE = withRole(['superadmin'])(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    await programRepository.delete(params.id)
    return NextResponse.json({ message: 'Program deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting program:', error)
    return NextResponse.json(
      { message: 'Failed to delete program' },
      { status: 500 }
    )
  }
})
