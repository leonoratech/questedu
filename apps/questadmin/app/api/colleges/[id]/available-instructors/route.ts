import { UserRole } from '@/data/models/user-model'
import { CollegeAdministratorRepository } from '@/data/repository/college-administrators-service'
import { UserProfileRepository } from '@/data/repository/user-profile-service'
import { requireRole } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/colleges/[id]/available-instructors - Get instructors available for assignment
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

    const userProfileRepo = new UserProfileRepository()
    const collegeAdminRepo = new CollegeAdministratorRepository();
    // Get all instructors
    const allAvailableInstructors = await userProfileRepo.getUsersByRole('instructor');
    const assignedAdminForCollege = await collegeAdminRepo.getCollegeAdministrators(collegeId);
    
    const allInstructors = allAvailableInstructors.map(doc => {
      return {
        id: doc.id,
        uid: doc.uid,
        email: doc.email,
        displayName: doc.displayName,
        firstName: doc.firstName,
        lastName: doc.lastName,
        department: doc.department,
        collegeId: doc.collegeId,
        college: doc.college
      }
    })

    // Create a set of assigned instructor IDs for quick lookup
    const assignedInstructorIds = new Set(assignedAdminForCollege.map(admin => admin.instructorId))

    // Filter out already assigned instructors
    const availableInstructors = allInstructors.filter(
      instructor => !assignedInstructorIds.has(instructor.uid)
    )

    return NextResponse.json({ 
      success: true,
      data: availableInstructors
    })
  } catch (error) {
    console.error('Error fetching available instructors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch available instructors' },
      { status: 500 }
    )
  }
}
