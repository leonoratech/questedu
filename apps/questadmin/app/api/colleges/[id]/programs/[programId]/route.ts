import { isCollegeAdministrator } from '@/lib/college-admin-auth'
import { requireAuth } from '@/lib/server-auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { serverDb, UserRole } from '../../../../firebase-server'

// PUT /api/colleges/[id]/programs/[programId] - Update a program
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; programId: string }> }
) {
  const authResult = await requireAuth()(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  try {
    const { id: collegeId, programId } = await params
    const { user } = authResult
    const updates = await request.json()

    // Check if program exists
    const programRef = doc(serverDb, 'programs', programId)
    const programDoc = await getDoc(programRef)
    
    if (!programDoc.exists()) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      )
    }

    const programData = programDoc.data()
    if (programData.collegeId !== collegeId) {
      return NextResponse.json(
        { error: 'Program does not belong to this college' },
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

    // Validate semesterType if being updated
    if (updates.semesterType && !['years', 'semesters'].includes(updates.semesterType)) {
      return NextResponse.json(
        { error: 'Invalid semester type. Must be "years" or "semesters"' },
        { status: 400 }
      )
    }

    // Update the program
    const updateData = {
      ...updates,
      updatedAt: new Date()
    }

    // Convert yearsOrSemesters to number if provided
    if (updateData.yearsOrSemesters) {
      updateData.yearsOrSemesters = Number(updateData.yearsOrSemesters)
    }

    await updateDoc(programRef, updateData)

    return NextResponse.json({
      success: true,
      message: 'Program updated successfully'
    })
  } catch (error) {
    console.error('Error updating program:', error)
    return NextResponse.json(
      { error: 'Failed to update program' },
      { status: 500 }
    )
  }
}

// DELETE /api/colleges/[id]/programs/[programId] - Delete a program (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; programId: string }> }
) {
  const authResult = await requireAuth()(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  try {
    const { id: collegeId, programId } = await params
    const { user } = authResult

    // Check if program exists
    const programRef = doc(serverDb, 'programs', programId)
    const programDoc = await getDoc(programRef)
    
    if (!programDoc.exists()) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      )
    }

    const programData = programDoc.data()
    if (programData.collegeId !== collegeId) {
      return NextResponse.json(
        { error: 'Program does not belong to this college' },
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

    // Soft delete by marking as inactive
    await updateDoc(programRef, {
      isActive: false,
      deletedAt: new Date(),
      deletedBy: user.uid
    })

    return NextResponse.json({
      success: true,
      message: 'Program deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting program:', error)
    return NextResponse.json(
      { error: 'Failed to delete program' },
      { status: 500 }
    )
  }
}
