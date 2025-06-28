import { UserRepository } from '@/data/repository/user-service'
import { isCollegeAdministrator } from '@/lib/college-admin-auth'
import { requireAuth } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'
import { UserRole } from '../../../firebase-server'

// GET /api/colleges/[id]/stats - Get college statistics
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

  const { user } = authResult

  try {
    const { id: collegeId } = await params

    // Check permissions based on user role
    if (user.role === UserRole.SUPERADMIN) {
      // Superadmins can view any college stats
    } else if (user.role === UserRole.INSTRUCTOR) {
      // Instructors can view stats for:
      // 1. Their own college (if collegeId matches their profile)
      // 2. Any college if they are a college administrator
      
      const userRepo = new UserRepository()
      const userProfile = await userRepo.getById(user.uid)
      const userCollegeId = userProfile?.collegeId
      const isOwnCollege = userCollegeId === collegeId
      const isAdmin = await isCollegeAdministrator(user.uid, collegeId)
      
      if (!isOwnCollege && !isAdmin) {
        return NextResponse.json(
          { error: 'Access denied. You can only view your own college statistics.' },
          { status: 403 }
        )
      }
    } else if (user.role === UserRole.STUDENT) {
      // Students can view stats for their own college (if collegeId matches their profile)
      
      const userRepo = new UserRepository()
      const userProfile = await userRepo.getById(user.uid)
      const userCollegeId = userProfile?.collegeId
      const isOwnCollege = userCollegeId === collegeId
      
      if (!isOwnCollege) {
        return NextResponse.json(
          { error: 'Access denied. You can only view your own college statistics.' },
          { status: 403 }
        )
      }
    } else {
      // Other roles are not allowed to view college stats
      return NextResponse.json(
        { error: 'Insufficient permissions to view college statistics' },
        { status: 403 }
      )
    }

    // Use repository to get all users for this college
    const userRepo = new UserRepository()
    const users = await userRepo.getCollegeUsers(collegeId)

    // Count users by role
    const studentCount = users.filter(user => user.role === 'student').length
    const instructorCount = users.filter(user => user.role === 'instructor').length
    
    // Staff count includes instructors and superadmins (no 'admin' role in UserRole)
    const staffCount = users.filter(user => 
      user.role === 'instructor' || 
      user.role === 'superadmin'
    ).length

    const stats = {
      studentCount,
      instructorCount,
      staffCount,
      totalUsers: users.length
    }

    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('Error fetching college stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch college statistics' },
      { status: 500 }
    )
  }
}
