import { UserRole } from '@/data/models/user-model';
import { CollegeAdministratorRepository } from '@/data/repository/college-administrators-service';
import { CollegeRepository } from '@/data/repository/college-service';
import { UserProfileRepository } from '@/data/repository/user-profile-service';
import { requireRole } from '@/lib/server-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/colleges/[id]/administrators - Get all administrators for a college
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireRole(UserRole.SUPERADMIN)(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  try {
    const { id: collegeId } = await params

    const collegeAdminRepo = new CollegeAdministratorRepository();
    const administrators = await collegeAdminRepo.getCollegeAdministrators(collegeId);

    return NextResponse.json({ 
      success: true,
      administrators
    })
  } catch (error) {
    console.error('Error fetching college administrators:', error)
    return NextResponse.json(
      { error: 'Failed to fetch college administrators' },
      { status: 500 }
    )
  }
}

// POST /api/colleges/[id]/administrators - Assign instructor as college administrator
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireRole(UserRole.SUPERADMIN)(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  try {
    const { id: collegeId } = await params
    const { instructorId, role } = await request.json()

    // Validate required fields
    if (!instructorId || !role) {
      return NextResponse.json(
        { error: 'Instructor ID and role are required' },
        { status: 400 }
      )
    }

    // Validate role
    if (!['administrator', 'co_administrator'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be administrator or co_administrator' },
        { status: 400 }
      )
    }

    // Check if college exists
    const collegeRepo = new CollegeRepository();
    const college = await collegeRepo.getById(collegeId);

    if (!college) {
      return NextResponse.json(
        { error: 'College not found' },
        { status: 404 }
      )
    }

    // Check if instructor exists and is an instructor
    const userProfileRepo = new UserProfileRepository();
    const instructorData = await userProfileRepo.getById(instructorId);

    if (!instructorData) {
      return NextResponse.json(
        { error: 'Instructor not found' },
        { status: 404 }
      )
    }
    
    if (instructorData.role !== 'instructor') {
      return NextResponse.json(
        { error: 'User is not an instructor' },
        { status: 400 }
      )
    }

    const collegeAdministratorRepo = new CollegeAdministratorRepository();
    // Check if instructor is already assigned to this college
    const alreadyAssigned = await collegeAdministratorRepo.checkUserAssignedAsAdmin(collegeId, instructorId);
    if (!alreadyAssigned) {
      return NextResponse.json(
        { error: 'Instructor is already assigned as administrator for this college' },
        { status: 409 }
      )
    }

    // For administrator role, check if there's already an administrator
    if (role === 'administrator') {
      
      const existingAdministratorSnapshot = await collegeAdministratorRepo.checkAdministratorExists(collegeId);

      if (existingAdministratorSnapshot) {
        return NextResponse.json(
          { error: 'College already has an administrator. Please assign as co-administrator or remove existing administrator first.' },
          { status: 409 }
        )
      }
    }

    // Create college administrator assignment
    const administratorData = {
      collegeId,
      instructorId,
      instructorName: instructorData.displayName || `${instructorData.firstName} ${instructorData.lastName}`,
      instructorEmail: instructorData.email,
      role,
      assignedAt: new Date(),
      assignedBy: authResult.user.uid,
      isActive: true
    }

    const docRef= await collegeAdministratorRepo.create(administratorData);
    
    return NextResponse.json({
      success: true,
      administrator: {
        ...docRef
      }
    })
  } catch (error) {
    console.error('Error assigning college administrator:', error)
    return NextResponse.json(
      { error: 'Failed to assign college administrator' },
      { status: 500 }
    )
  }
}
