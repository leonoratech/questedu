import { requireRole } from '@/lib/server-auth'
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    where
} from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { serverDb, UserRole } from '../../../firebase-server'

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

    // Get all college administrators for this college
    const administratorsRef = collection(serverDb, 'collegeAdministrators')
    const administratorsQuery = query(
      administratorsRef,
      where('collegeId', '==', collegeId),
      where('isActive', '==', true),
      orderBy('assignedAt', 'desc')
    )
    
    const snapshot = await getDocs(administratorsQuery)
    const administrators = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        assignedAt: data.assignedAt?.toDate?.() || data.assignedAt,
      }
    })

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
    const collegeRef = doc(serverDb, 'colleges', collegeId)
    const collegeDoc = await getDoc(collegeRef)
    
    if (!collegeDoc.exists()) {
      return NextResponse.json(
        { error: 'College not found' },
        { status: 404 }
      )
    }

    // Check if instructor exists and is an instructor
    const instructorRef = doc(serverDb, 'users', instructorId)
    const instructorDoc = await getDoc(instructorRef)
    
    if (!instructorDoc.exists()) {
      return NextResponse.json(
        { error: 'Instructor not found' },
        { status: 404 }
      )
    }

    const instructorData = instructorDoc.data()
    if (instructorData.role !== 'instructor') {
      return NextResponse.json(
        { error: 'User is not an instructor' },
        { status: 400 }
      )
    }

    // Check if instructor is already assigned to this college
    const existingAdminQuery = query(
      collection(serverDb, 'collegeAdministrators'),
      where('collegeId', '==', collegeId),
      where('instructorId', '==', instructorId),
      where('isActive', '==', true)
    )
    
    const existingSnapshot = await getDocs(existingAdminQuery)
    if (!existingSnapshot.empty) {
      return NextResponse.json(
        { error: 'Instructor is already assigned as administrator for this college' },
        { status: 409 }
      )
    }

    // For administrator role, check if there's already an administrator
    if (role === 'administrator') {
      const existingAdministratorQuery = query(
        collection(serverDb, 'collegeAdministrators'),
        where('collegeId', '==', collegeId),
        where('role', '==', 'administrator'),
        where('isActive', '==', true)
      )
      
      const existingAdministratorSnapshot = await getDocs(existingAdministratorQuery)
      if (!existingAdministratorSnapshot.empty) {
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
      assignedAt: serverTimestamp(),
      assignedBy: authResult.user.uid,
      isActive: true
    }

    const docRef = await addDoc(collection(serverDb, 'collegeAdministrators'), administratorData)

    return NextResponse.json({
      success: true,
      administrator: {
        id: docRef.id,
        ...administratorData,
        assignedAt: new Date()
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
