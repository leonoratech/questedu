import { requireRole } from '@/lib/server-auth';
import {
    doc,
    getDoc,
    updateDoc
} from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { serverDb, UserRole } from '../../../../firebase-server';

// PUT /api/colleges/[id]/administrators/[administratorId] - Update college administrator
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; administratorId: string }> }
) {
  const authResult = await requireRole(UserRole.SUPERADMIN)(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  try {
    const { id: collegeId, administratorId } = await params
    const updates = await request.json()

    // Check if administrator assignment exists
    const adminRef = doc(serverDb, 'collegeAdministrators', administratorId)
    const adminDoc = await getDoc(adminRef)
    
    if (!adminDoc.exists()) {
      return NextResponse.json(
        { error: 'Administrator assignment not found' },
        { status: 404 }
      )
    }

    const adminData = adminDoc.data()
    if (adminData.collegeId !== collegeId) {
      return NextResponse.json(
        { error: 'Administrator assignment does not belong to this college' },
        { status: 400 }
      )
    }

    // Validate role if being updated
    if (updates.role && !['administrator', 'co_administrator'].includes(updates.role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be administrator or co_administrator' },
        { status: 400 }
      )
    }

    // Update the administrator assignment
    const updateData = {
      ...updates,
      updatedAt: new Date(),
      updatedBy: authResult.user.uid
    }

    await updateDoc(adminRef, updateData)

    return NextResponse.json({
      success: true,
      message: 'Administrator assignment updated successfully'
    })
  } catch (error) {
    console.error('Error updating college administrator:', error)
    return NextResponse.json(
      { error: 'Failed to update college administrator' },
      { status: 500 }
    )
  }
}

// DELETE /api/colleges/[id]/administrators/[administratorId] - Remove college administrator
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; administratorId: string }> }
) {
  const authResult = await requireRole(UserRole.SUPERADMIN)(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  try {
    const { id: collegeId, administratorId } = await params

    // Check if administrator assignment exists
    const adminRef = doc(serverDb, 'collegeAdministrators', administratorId)
    const adminDoc = await getDoc(adminRef)
    
    if (!adminDoc.exists()) {
      return NextResponse.json(
        { error: 'Administrator assignment not found' },
        { status: 404 }
      )
    }

    const adminData = adminDoc.data()
    if (adminData.collegeId !== collegeId) {
      return NextResponse.json(
        { error: 'Administrator assignment does not belong to this college' },
        { status: 400 }
      )
    }

    // Soft delete by marking as inactive
    await updateDoc(adminRef, {
      isActive: false,
      removedAt: new Date(),
      removedBy: authResult.user.uid
    })

    return NextResponse.json({
      success: true,
      message: 'Administrator assignment removed successfully'
    })
  } catch (error) {
    console.error('Error removing college administrator:', error)
    return NextResponse.json(
      { error: 'Failed to remove college administrator' },
      { status: 500 }
    )
  }
}
