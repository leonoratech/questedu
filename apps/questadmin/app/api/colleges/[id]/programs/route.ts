import { isCollegeAdministrator } from '@/lib/college-admin-auth'
import { requireAuth } from '@/lib/server-auth'
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, where } from 'firebase/firestore'
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

    // Get all programs for this college
    const programsRef = collection(serverDb, 'programs')
    const programsQuery = query(
      programsRef,
      where('collegeId', '==', collegeId),
      where('isActive', '==', true),
      orderBy('name')
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
    })

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
