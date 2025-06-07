import { deleteDoc, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { serverDb, UserRole } from '../../firebase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    return NextResponse.json({
      success: true,
      user: {
        id: userSnap.id,
        ...userSnap.data()
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
  try {
    const { id: userId } = await params
    const updateData = await request.json()
    
    // Remove sensitive fields from update data
    delete updateData.id
    delete updateData.createdAt
    delete updateData.email // Email updates should go through auth API
    
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
