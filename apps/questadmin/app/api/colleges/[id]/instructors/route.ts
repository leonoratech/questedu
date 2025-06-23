import { getAvailableInstructors } from '@/data/services/subject-service'
import { isCollegeAdministrator } from '@/lib/college-admin-auth'
import { getCurrentUser } from '@/lib/server-auth'
import { doc, getDoc } from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { serverDb } from '../../../firebase-server'

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

    // Check permissions based on user role
    if (user.role === 'superadmin') {
      // Superadmins can access any college
    } else if (user.role === 'instructor') {
      // Instructors can access their own college or colleges they administer
      const userDoc = await getDoc(doc(serverDb, 'users', user.uid))
      const userData = userDoc.exists() ? userDoc.data() : null
      
      const userCollegeId = userData?.collegeId
      const isOwnCollege = userCollegeId === collegeId
      const isCollegeAdmin = await isCollegeAdministrator(user.uid, collegeId)
      
      if (!isOwnCollege && !isCollegeAdmin) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
    } else {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const instructors = await getAvailableInstructors(collegeId)
    return NextResponse.json({ instructors })

  } catch (error) {
    console.error('Error fetching instructors:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
