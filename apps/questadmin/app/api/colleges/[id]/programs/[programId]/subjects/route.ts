import { CreateSubjectRequest } from '@/data/models/subject'
import {
    createSubject,
    getSubjectsByProgram
} from '@/data/services/subject-service'
import { isCollegeAdministrator } from '@/lib/college-admin-auth'
import { getCurrentUser } from '@/lib/server-auth'
import { doc, getDoc } from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { serverDb } from '../../../../../firebase-server'

// GET /api/colleges/[id]/programs/[programId]/subjects
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; programId: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: collegeId, programId } = await params
    console.log(`Subjects API - User: ${user.uid}, Role: ${user.role}, College: ${collegeId}, Program: ${programId}`)

    // Check permissions based on user role
    if (user.role === 'superadmin') {
      console.log('Access granted: superadmin role')
      // Superadmins can access any college
    } else if (user.role === 'instructor') {
      // Instructors can access their own college or colleges they administer
      const userDoc = await getDoc(doc(serverDb, 'users', user.uid))
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

    const subjects = await getSubjectsByProgram(programId)
    return NextResponse.json({ subjects })

  } catch (error) {
    console.error('Error fetching subjects:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/colleges/[id]/programs/[programId]/subjects
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; programId: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: collegeId, programId } = await params
    console.log(`Subjects POST API - User: ${user.uid}, Role: ${user.role}, College: ${collegeId}, Program: ${programId}`)

    // Check permissions based on user role
    if (user.role === 'superadmin') {
      console.log('Access granted: superadmin role')
      // Superadmins can access any college
    } else if (user.role === 'instructor') {
      // Instructors can access their own college or colleges they administer
      const userDoc = await getDoc(doc(serverDb, 'users', user.uid))
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

    const body: CreateSubjectRequest = await request.json()

    // Validate required fields
    if (!body.name || !body.yearOrSemester || !body.instructorId) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, yearOrSemester, instructorId' 
      }, { status: 400 })
    }

    const subjectId = await createSubject(body, programId, collegeId, user.uid)
    
    return NextResponse.json({ 
      success: true, 
      subjectId,
      message: 'Subject created successfully' 
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating subject:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
