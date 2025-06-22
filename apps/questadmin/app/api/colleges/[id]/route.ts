import { isCollegeAdministrator } from '@/lib/college-admin-auth'
import { requireAuth, requireRole } from '@/lib/server-auth'
import { collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { serverDb, UserRole } from '../../firebase-server'

// Helper function to get administrator counts for a college
async function getCollegeAdministratorCounts(collegeId: string) {
  try {
    const adminRef = collection(serverDb, 'collegeAdministrators')
    const adminQuery = query(
      adminRef,
      where('collegeId', '==', collegeId),
      where('isActive', '==', true)
    )
    
    const adminSnapshot = await getDocs(adminQuery)
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
    // Check permissions based on user role
    if (user.role === UserRole.SUPERADMIN) {
      // Superadmins can view any college
    } else if (user.role === UserRole.INSTRUCTOR) {
      // Instructors can view:
      // 1. Their own college (if collegeId matches their profile)
      // 2. Any college if they are a college administrator
      
      // Get user's college association from their profile
      const userDoc = await getDoc(doc(serverDb, 'users', user.uid))
      const userData = userDoc.exists() ? userDoc.data() : null
      
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
      const userDoc = await getDoc(doc(serverDb, 'users', user.uid))
      const userData = userDoc.exists() ? userDoc.data() : null
      
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

    const collegeDoc = await getDoc(doc(serverDb, 'colleges', collegeId))
    
    if (!collegeDoc.exists()) {
      return NextResponse.json(
        { error: 'College not found' },
        { status: 404 }
      )
    }

    const data = collegeDoc.data()
    
    // Get administrator counts
    const { administratorCount, coAdministratorCount } = await getCollegeAdministratorCounts(collegeId)
    
    const college = {
      id: collegeDoc.id,
      ...data,
      administratorCount,
      coAdministratorCount,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    }

    return NextResponse.json({
      success: true,
      college
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
    
    const collegeRef = doc(serverDb, 'colleges', id)
    
    // Check if college exists
    const collegeDoc = await getDoc(collegeRef)
    if (!collegeDoc.exists()) {
      return NextResponse.json(
        { error: 'College not found' },
        { status: 404 }
      )
    }
    
    await updateDoc(collegeRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    })
    
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
    const collegeRef = doc(serverDb, 'colleges', id)
    
    // Check if college exists
    const collegeDoc = await getDoc(collegeRef)
    if (!collegeDoc.exists()) {
      return NextResponse.json(
        { error: 'College not found' },
        { status: 404 }
      )
    }
    
    // TODO: Before deleting, check if any users are associated with this college
    // For now, we'll just delete it
    await deleteDoc(collegeRef)
    
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
