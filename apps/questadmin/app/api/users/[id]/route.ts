import { UpdateUserSchema, validateRequestBody } from '@/data/validation/validation-schemas'
import { requireAuth, requireRole } from '@/lib/server-auth'
import { deleteDoc, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { serverDb, UserRole } from '../../firebase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require authentication for user profile access
  const authResult = await requireAuth()(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  const { user } = authResult
  const { id: userId } = await params
  
  // Users can only view their own profile, instructors can view any profile
  if (user.role !== UserRole.INSTRUCTOR && user.uid !== userId) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    )
  }
  try {
    const { id: userId } = await params
    
    const userRef = doc(serverDb, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Filter sensitive data for non-admin users
    const userData = userSnap.data()
    if (user.role !== UserRole.ADMIN) {
      // Remove sensitive fields for non-admin users
      delete userData.email
      delete userData.lastLoginAt
      delete userData.createdAt
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userSnap.id,
        ...userData
      }
    })

  } catch (error: any) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'An error occurred fetching the user' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require authentication
  const authResult = await requireAuth()(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  const { user } = authResult
  const { id: userId } = await params
  
  // Users can only update their own profile, admins can update any profile
  if (user.role !== UserRole.ADMIN && user.uid !== userId) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    )
  }

  try {
    // Validate request body
    const requestBody = await request.json()
    const validation = validateRequestBody(UpdateUserSchema, requestBody)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }
    
    const updateData = validation.data
    
    // Non-admin users cannot change their role or activation status
    if (user.role !== UserRole.ADMIN) {
      delete updateData.role
      delete updateData.isActive
    }
    
    // Validate role if being updated
    if (updateData.role && !Object.values(UserRole).includes(updateData.role)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      )
    }
    
    const userRef = doc(serverDb, 'users', userId)
    
    // Check if user exists
    const userSnap = await getDoc(userRef)
    if (!userSnap.exists()) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const updatedUser = {
      ...updateData,
      updatedAt: serverTimestamp()
    }

    await updateDoc(userRef, updatedUser)
    
    // Get updated user
    const updatedSnap = await getDoc(userRef)

    return NextResponse.json({
      success: true,
      user: {
        id: updatedSnap.id,
        ...updatedSnap.data()
      },
      message: 'User updated successfully'
    })

  } catch (error: any) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'An error occurred updating the user' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require admin role for user deletion
  const authResult = await requireRole(UserRole.ADMIN)(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  try {
    const { id: userId } = await params
    
    const userRef = doc(serverDb, 'users', userId)
    
    // Check if user exists
    const userSnap = await getDoc(userRef)
    if (!userSnap.exists()) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent deletion of own account
    if (authResult.user.uid === userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Delete user document from Firestore
    await deleteDoc(userRef)
    
    // Note: Deleting the user from Firebase Auth requires admin SDK
    // This is a limitation of the current approach
    // You might want to implement this with Firebase Admin SDK

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })

  } catch (error: any) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'An error occurred deleting the user' },
      { status: 500 }
    )
  }
}
