import { ProgramRepository } from '@/data/repository/program-service'
import { UserRepository } from '@/data/repository/user-service'
import { isCollegeAdministrator } from '@/lib/college-admin-auth'
import { requireAuth } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'
import { UserRole } from '../../../firebase-server'

// GET /api/colleges/[id]/programs - Get all programs for a college
export async function GET(
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

  try {
    const { id: collegeId } = await params
    const { user } = authResult

    console.log(`Programs API - User: ${user.uid}, Role: ${user.role}, College: ${collegeId}`)

    // Check permissions based on user role
    if (user.role === UserRole.SUPERADMIN) {
      console.log('Access granted: superadmin role')
      // Superadmins can access any college
    } else if (user.role === UserRole.INSTRUCTOR) {
      // Instructors can access their own college or colleges they administer
      const userRepo = new UserRepository();
      const userData = await userRepo.getById(user.uid);
      
      const userCollegeId = userData?.collegeId
      const isOwnCollege = userCollegeId === collegeId
      const isCollegeAdmin = await isCollegeAdministrator(user.uid, collegeId)
      
      console.log(`Permission check - Own college: ${isOwnCollege}, Is admin: ${isCollegeAdmin}`)
      
      if (!isOwnCollege && !isCollegeAdmin) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
    } else {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get all programs for this college
    const programRepo = new ProgramRepository();
    const programs = await programRepo.getCollegePrograms(collegeId, true);

    return NextResponse.json({ 
      success: true,
      programs
    })
  } catch (error) {
    console.error('Error fetching college programs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch college programs' },
      { status: 500 }
    )
  }
}

// POST /api/colleges/[id]/programs - Create a new program
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

  try {
    const { id: collegeId } = await params
    const { user } = authResult
    const { name, yearsOrSemesters, semesterType, description } = await request.json()

    // Validate required fields
    if (!name || !yearsOrSemesters || !semesterType || !description) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate semesterType
    if (!['years', 'semesters'].includes(semesterType)) {
      return NextResponse.json(
        { error: 'Invalid semester type. Must be "years" or "semesters"' },
        { status: 400 }
      )
    }

    // Check if user is a college administrator for this college or superadmin
    if (user.role !== UserRole.SUPERADMIN) {
      const isAdmin = await isCollegeAdministrator(user.uid, collegeId)
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'Only college administrators can manage programs' },
          { status: 403 }
        )
      }
    }

    // Create program
    const programData = {
      name,
      yearsOrSemesters: Number(yearsOrSemesters),
      semesterType,
      description,
      collegeId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: user.uid
    }

    const programRepo = new ProgramRepository();
    const createdProgram = await programRepo.create(programData);

    return NextResponse.json({
      success: true,
      program: createdProgram
    })
  } catch (error) {
    console.error('Error creating program:', error)
    return NextResponse.json(
      { error: 'Failed to create program' },
      { status: 500 }
    )
  }
}
