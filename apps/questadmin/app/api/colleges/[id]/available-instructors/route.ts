import { requireRole } from '@/lib/server-auth'
import {
    collection,
    getDocs,
    orderBy,
    query,
    where
} from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { serverDb, UserRole } from '../../../firebase-server'

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

    // Get all instructors
    const instructorsRef = collection(serverDb, 'users')
    const instructorsQuery = query(
      instructorsRef,
      where('role', '==', 'instructor'),
      where('isActive', '==', true),
      orderBy('displayName')
    )
    
    const instructorsSnapshot = await getDocs(instructorsQuery)
    const allInstructors = instructorsSnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        uid: data.uid,
        email: data.email,
        displayName: data.displayName,
        firstName: data.firstName,
        lastName: data.lastName,
        department: data.department,
        collegeId: data.collegeId,
        college: data.college
      }
    })

    // Get already assigned administrators for this college
    const assignedAdminsRef = collection(serverDb, 'collegeAdministrators')
    const assignedAdminsQuery = query(
      assignedAdminsRef,
      where('collegeId', '==', collegeId),
      where('isActive', '==', true)
    )
    
    const assignedSnapshot = await getDocs(assignedAdminsQuery)
    const assignedInstructorIds = new Set(
      assignedSnapshot.docs.map(doc => doc.data().instructorId)
    )

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
