import { requireRole } from '@/lib/server-auth'
import { deleteDoc, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { serverDb, UserRole } from '../../firebase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require superadmin role for college management
  const authResult = await requireRole(UserRole.SUPERADMIN)(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  try {
    const { id } = await params
    const collegeDoc = await getDoc(doc(serverDb, 'colleges', id))
    
    if (!collegeDoc.exists()) {
      return NextResponse.json(
        { error: 'College not found' },
        { status: 404 }
      )
    }

    const data = collegeDoc.data()
    const college = {
      id: collegeDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    }

    return NextResponse.json({
      success: true,
      college
    })
  } catch (error) {
    console.error('Error fetching college:', error)
    return NextResponse.json(
      { error: 'Failed to fetch college' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require superadmin role for college management
  const authResult = await requireRole(UserRole.SUPERADMIN)(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  try {
    const { id } = await params
    const body = await request.json()
    
    // Remove fields that shouldn't be updated directly
    const { id: _, createdAt, createdBy, ...updateData } = body
    
    const collegeRef = doc(serverDb, 'colleges', id)
    
    // Check if college exists
    const collegeDoc = await getDoc(collegeRef)
    if (!collegeDoc.exists()) {
      return NextResponse.json(
        { error: 'College not found' },
        { status: 404 }
      )
    }
    
    await updateDoc(collegeRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    })
    
    return NextResponse.json({
      success: true,
      message: 'College updated successfully'
    })
  } catch (error) {
    console.error('Error updating college:', error)
    return NextResponse.json(
      { error: 'Failed to update college' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require superadmin role for college management
  const authResult = await requireRole(UserRole.SUPERADMIN)(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  try {
    const { id } = await params
    const collegeRef = doc(serverDb, 'colleges', id)
    
    // Check if college exists
    const collegeDoc = await getDoc(collegeRef)
    if (!collegeDoc.exists()) {
      return NextResponse.json(
        { error: 'College not found' },
        { status: 404 }
      )
    }
    
    // TODO: Before deleting, check if any users are associated with this college
    // For now, we'll just delete it
    await deleteDoc(collegeRef)
    
    return NextResponse.json({
      success: true,
      message: 'College deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting college:', error)
    return NextResponse.json(
      { error: 'Failed to delete college' },
      { status: 500 }
    )
  }
}
