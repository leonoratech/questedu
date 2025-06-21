import { CreateSubjectRequest } from '@/data/models/subject'
import {
    createSubject,
    getSubjectsByProgram
} from '@/data/services/subject-service'
import { isCollegeAdministrator } from '@/lib/college-admin-auth'
import { getCurrentUser } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'

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

    // Check if user is a college administrator for this college
    const isAdmin = await isCollegeAdministrator(user.uid, collegeId)
    if (!isAdmin && user.role !== 'superadmin') {
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

    // Check if user is a college administrator for this college
    const isAdmin = await isCollegeAdministrator(user.uid, collegeId)
    if (!isAdmin && user.role !== 'superadmin') {
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
