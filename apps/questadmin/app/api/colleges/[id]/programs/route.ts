import { isCollegeAdministrator } from '@/lib/college-admin-auth'
import { requireAuth } from '@/lib/server-auth'
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, where } from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { serverDb, UserRole } from '../../../firebase-server'

// GET /api/colleges/[id]/programs - Get all programs for a college
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
    const { user } = authResult

    console.log(`Programs API - User: ${user.uid}, Role: ${user.role}, College: ${collegeId}`)

    // Check permissions based on user role
    if (user.role === UserRole.SUPERADMIN) {
      console.log('Access granted: superadmin role')
      // Superadmins can access any college
    } else if (user.role === UserRole.INSTRUCTOR) {
      // Instructors can access their own college or colleges they administer
      const userRef = doc(serverDb, 'users', user.uid)
      const userDoc = await getDoc(userRef)
      const userData = userDoc.exists() ? userDoc.data() : null
      
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

    // Get all programs for this college
    const programsRef = collection(serverDb, 'programs')
    const programsQuery = query(
      programsRef,
      where('collegeId', '==', collegeId),
      where('isActive', '==', true)
    )
    
    const snapshot = await getDocs(programsQuery)
    const programs = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      }
    }).sort((a: any, b: any) => (a.name || '').localeCompare(b.name || '')) // Client-side sorting

    return NextResponse.json({ 
      success: true,
      programs
    })
  } catch (error) {
    console.error('Error fetching college programs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch college programs' },
      { status: 500 }
    )
  }
}

// POST /api/colleges/[id]/programs - Create a new program
export async function POST(
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
    const { user } = authResult
    const { name, yearsOrSemesters, semesterType, description } = await request.json()

    // Validate required fields
    if (!name || !yearsOrSemesters || !semesterType || !description) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate semesterType
    if (!['years', 'semesters'].includes(semesterType)) {
      return NextResponse.json(
        { error: 'Invalid semester type. Must be "years" or "semesters"' },
        { status: 400 }
      )
    }

    // Check if user is a college administrator for this college or superadmin
    if (user.role !== UserRole.SUPERADMIN) {
      const isAdmin = await isCollegeAdministrator(user.uid, collegeId)
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'Only college administrators can manage programs' },
          { status: 403 }
        )
      }
    }

    // Create program
    const programData = {
      name,
      yearsOrSemesters: Number(yearsOrSemesters),
      semesterType,
      description,
      collegeId,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: user.uid
    }

    const docRef = await addDoc(collection(serverDb, 'programs'), programData)

    return NextResponse.json({
      success: true,
      program: {
        id: docRef.id,
        ...programData,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
  } catch (error) {
    console.error('Error creating program:', error)
    return NextResponse.json(
      { error: 'Failed to create program' },
      { status: 500 }
    )
  }
}
