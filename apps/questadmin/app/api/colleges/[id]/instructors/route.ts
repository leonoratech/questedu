import { InstructorOption } from '@/data/models/subject'
import { UserRepository } from '@/data/repository/user-service'
import { isCollegeAdministrator } from '@/lib/college-admin-auth'
import { getCurrentUser } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/colleges/[id]/instructors
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: collegeId } = await params
    console.log(`Instructors API - User: ${user.uid}, Role: ${user.role}, College: ${collegeId}`)

    // Check permissions based on user role
    if (user.role === 'superadmin') {
      console.log('Access granted: superadmin role')
      // Superadmins can access any college
    } else if (user.role === 'instructor') {
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

    // Get instructors for this college using UserRepository
    const userRepo = new UserRepository();
    const collegeInstructors = await userRepo.getActiveInstructors(collegeId);
    
    // Transform to InstructorOption format
    const instructors: InstructorOption[] = collegeInstructors.map(instructor => ({
      id: instructor.uid,
      name: `${instructor.firstName} ${instructor.lastName}`,
      email: instructor.email,
      department: instructor.department || 'Not specified'
    }));

    return NextResponse.json({ 
      success: true,
      data: instructors 
    })

  } catch (error) {
    console.error('Error fetching instructors:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
