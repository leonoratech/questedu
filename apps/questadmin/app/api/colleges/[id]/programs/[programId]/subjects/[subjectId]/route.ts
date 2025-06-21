import { UpdateSubjectRequest } from '@/data/models/subject'
import {
    deleteSubject,
    getSubjectById,
    updateSubject
} from '@/data/services/subject-service'
import { isCollegeAdministrator } from '@/lib/college-admin-auth'
import { getCurrentUser } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/colleges/[id]/programs/[programId]/subjects/[subjectId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; programId: string; subjectId: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: collegeId, subjectId } = await params

    // Check if user is a college administrator for this college
    const isAdmin = await isCollegeAdministrator(user.uid, collegeId)
    if (!isAdmin && user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const subject = await getSubjectById(subjectId)
    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }

    return NextResponse.json({ subject })

  } catch (error) {
    console.error('Error fetching subject:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/colleges/[id]/programs/[programId]/subjects/[subjectId]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; programId: string; subjectId: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: collegeId, subjectId } = await params

    // Check if user is a college administrator for this college
    const isAdmin = await isCollegeAdministrator(user.uid, collegeId)
    if (!isAdmin && user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body: Partial<UpdateSubjectRequest> = await request.json()
    const updateRequest: UpdateSubjectRequest = {
      id: subjectId,
      ...body
    }

    await updateSubject(updateRequest, user.uid)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Subject updated successfully' 
    })

  } catch (error) {
    console.error('Error updating subject:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/colleges/[id]/programs/[programId]/subjects/[subjectId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; programId: string; subjectId: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: collegeId, subjectId } = await params

    // Check if user is a college administrator for this college
    const isAdmin = await isCollegeAdministrator(user.uid, collegeId)
    if (!isAdmin && user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    await deleteSubject(subjectId, user.uid)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Subject deleted successfully' 
    })

  } catch (error) {
    console.error('Error deleting subject:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
