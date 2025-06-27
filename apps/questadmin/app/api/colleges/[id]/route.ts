import { CollegeRepository } from '@/data/repository/college-service'
import { UserRepository } from '@/data/repository/user-service'
import { isCollegeAdministrator } from '@/lib/college-admin-auth'
import { requireAuth, requireRole } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'
import { UserRole } from '../../firebase-server'

// Helper function to get administrator counts for a college
async function getCollegeAdministratorCounts(collegeId: string) {
  try {
    // This would need a CollegeAdministratorRepository, but for now keeping the direct query
    const { adminDb } = await import('@/data/repository/firebase-admin')
    const adminRef = adminDb.collection('collegeAdministrators')
    const adminQuery = adminRef
      .where('collegeId', '==', collegeId)
      .where('isActive', '==', true)
    
    const adminSnapshot = await adminQuery.get()
    let administratorCount = 0
    let coAdministratorCount = 0
    
    adminSnapshot.docs.forEach(doc => {
      const data = doc.data()
      if (data.role === 'administrator') {
        administratorCount++
      } else if (data.role === 'co_administrator') {
        coAdministratorCount++
      }
    })
    
    return { administratorCount, coAdministratorCount }
  } catch (error) {
    console.error('Error fetching college administrator counts:', error)
    return { administratorCount: 0, coAdministratorCount: 0 }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Allow authenticated users to view college information
  const authResult = await requireAuth()(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  const { user } = authResult
  const { id: collegeId } = await params

  try {
    const collegeRepository = new CollegeRepository()
    const userRepository = new UserRepository()
    
    // Check permissions based on user role
    if (user.role === UserRole.SUPERADMIN) {
      // Superadmins can view any college
    } else if (user.role === UserRole.INSTRUCTOR) {
      // Instructors can view:
      // 1. Their own college (if collegeId matches their profile)
      // 2. Any college if they are a college administrator
      
      // Get user's college association from their profile
      const userData = await userRepository.getById(user.uid)
      
      const userCollegeId = userData?.collegeId
      const isOwnCollege = userCollegeId === collegeId
      const isCollegeAdmin = await isCollegeAdministrator(user.uid, collegeId)
      
      if (!isOwnCollege && !isCollegeAdmin) {
        return NextResponse.json(
          { error: 'Access denied. You can only view your own college information.' },
          { status: 403 }
        )
      }
    } else if (user.role === UserRole.STUDENT) {
      // Students can view their own college (if collegeId matches their profile)
      
      // Get user's college association from their profile
      const userData = await userRepository.getById(user.uid)
      
      const userCollegeId = userData?.collegeId
      const isOwnCollege = userCollegeId === collegeId
      
      if (!isOwnCollege) {
        return NextResponse.json(
          { error: 'Access denied. You can only view your own college information.' },
          { status: 403 }
        )
      }
    } else {
      // Other roles (admin, etc.) are not allowed to view college details
      return NextResponse.json(
        { error: 'Insufficient permissions to view college information' },
        { status: 403 }
      )
    }

    const college = await collegeRepository.getById(collegeId)
    
    if (!college) {
      return NextResponse.json(
        { error: 'College not found' },
        { status: 404 }
      )
    }
    
    // Get administrator counts
    const { administratorCount, coAdministratorCount } = await getCollegeAdministratorCounts(collegeId)
    
    const collegeWithCounts = {
      ...college,
      administratorCount,
      coAdministratorCount,
    }

    return NextResponse.json({
      success: true,
      college: collegeWithCounts
    })
  } catch (error) {
    console.error('Error fetching college:', error)
    return NextResponse.json(
      { error: 'Failed to fetch college' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require superadmin role for college management
  const authResult = await requireRole(UserRole.SUPERADMIN)(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  try {
    const { id } = await params
    const body = await request.json()
    
    // Remove fields that shouldn't be updated directly
    const { id: _, createdAt, createdBy, ...updateData } = body
    
    const collegeRepository = new CollegeRepository()
    
    // Check if college exists
    const college = await collegeRepository.getById(id)
    if (!college) {
      return NextResponse.json(
        { error: 'College not found' },
        { status: 404 }
      )
    }
    
    await collegeRepository.update(id, updateData)
    
    return NextResponse.json({
      success: true,
      message: 'College updated successfully'
    })
  } catch (error) {
    console.error('Error updating college:', error)
    return NextResponse.json(
      { error: 'Failed to update college' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require superadmin role for college management
  const authResult = await requireRole(UserRole.SUPERADMIN)(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  try {
    const { id } = await params
    
    const collegeRepository = new CollegeRepository()
    
    // Check if college exists
    const college = await collegeRepository.getById(id)
    if (!college) {
      return NextResponse.json(
        { error: 'College not found' },
        { status: 404 }
      )
    }
    
    // TODO: Before deleting, check if any users are associated with this college
    // For now, we'll just delete it
    await collegeRepository.delete(id)
    
    return NextResponse.json({
      success: true,
      message: 'College deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting college:', error)
    return NextResponse.json(
      { error: 'Failed to delete college' },
      { status: 500 }
    )
  }
}
