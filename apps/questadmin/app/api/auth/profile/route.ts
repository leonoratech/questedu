import { updateEmail, updatePassword, updateProfile } from 'firebase/auth'
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { serverAuth, serverDb } from '../../firebase-server'

export async function PUT(request: NextRequest) {
  try {
    const { email, password, displayName, bio } = await request.json()
    const user = serverAuth.currentUser

    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    const updates: any = {}

    // Update email if provided
    if (email && email !== user.email) {
      await updateEmail(user, email)
      updates.email = email
    }

    // Update password if provided
    if (password) {
      await updatePassword(user, password)
    }

    // Update display name if provided
    if (displayName && displayName !== user.displayName) {
      await updateProfile(user, { displayName })
      updates.displayName = displayName
    }

    // Update Firestore profile
    if (bio !== undefined) {
      updates.bio = bio
    }

    if (Object.keys(updates).length > 0) {
      updates.updatedAt = serverTimestamp()
      await updateDoc(doc(serverDb, 'users', user.uid), updates)
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified
      }
    })

  } catch (error: any) {
    console.error('Profile update error:', error)
    
    let errorMessage = 'An error occurred updating profile'
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Email address is already in use'
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address'
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak'
    } else if (error.code === 'auth/requires-recent-login') {
      errorMessage = 'Please sign in again to update your profile'
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = serverAuth.currentUser

    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified
      }
    })

  } catch (error: any) {
    console.error('Get profile error:', error)
    
    return NextResponse.json(
      { error: 'An error occurred fetching profile' },
      { status: 400 }
    )
  }
}
