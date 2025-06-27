import { UserRole } from '@/data/models/user-model'
import { UserRepository } from '@/data/repository/user-service'
import { UpdateUserSchema, validateRequestBody } from '@/data/validation/validation-schemas'
import { requireAuth, requireRole } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'

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
    
    const userRepository = new UserRepository()
    const userData = await userRepository.getById(userId)
    
    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    if (user.role !== UserRole.INSTRUCTOR && user.uid !== userId) {
      // Remove sensitive fields for non-instructor users viewing other profiles
      const { email, lastLoginAt, createdAt, ...safeUserData } = userData
      return NextResponse.json({
        success: true,
        user: safeUserData
      })
    }

    return NextResponse.json({
      success: true,
      user: userData
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
  if (user.role !== UserRole.INSTRUCTOR && user.uid !== userId) {
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
    if (user.role !== UserRole.INSTRUCTOR) {
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
    
    const userRepository = new UserRepository()
    
    // Check if user exists
    const existingUser = await userRepository.getById(userId)
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update user
    await userRepository.update(userId, updateData)
    
    // Get updated user
    const updatedUser = await userRepository.getById(userId)

    return NextResponse.json({
      success: true,
      user: updatedUser,
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
  const authResult = await requireRole(UserRole.INSTRUCTOR)(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  try {
    const { id: userId } = await params
    
    const userRepository = new UserRepository()
    
    // Check if user exists
    const existingUser = await userRepository.getById(userId)
    if (!existingUser) {
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
    await userRepository.delete(userId)
    
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
