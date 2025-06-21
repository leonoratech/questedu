import { requireAuth } from '@/lib/server-auth'
import {
    collection,
    getDocs,
    query,
    where
} from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { serverDb } from '../../../firebase-server'

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

  try {
    const { id: collegeId } = await params

    // Get all users associated with this college
    const usersRef = collection(serverDb, 'users')
    const usersQuery = query(
      usersRef,
      where('collegeId', '==', collegeId),
      where('isActive', '==', true)
    )
    
    const usersSnapshot = await getDocs(usersQuery)
    const users = usersSnapshot.docs.map(doc => doc.data())

    // Count users by role
    const studentCount = users.filter(user => user.role === 'student').length
    const instructorCount = users.filter(user => user.role === 'instructor').length
    
    // Staff count includes instructors and any admin roles
    const staffCount = users.filter(user => 
      user.role === 'instructor' || 
      user.role === 'admin' || 
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
