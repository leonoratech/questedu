import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { serverAuth, serverDb } from '../../firebase-server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Sign in user with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(serverAuth, email, password)
    const user = userCredential.user

    // Update last login time in Firestore
    await setDoc(
      doc(serverDb, 'users', user.uid),
      { lastLoginAt: serverTimestamp() },
      { merge: true }
    )

    // Create session token (you may want to implement JWT tokens here)
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified
    }

    return NextResponse.json({
      success: true,
      user: userData,
      message: 'Sign in successful'
    })

  } catch (error: any) {
    console.error('Sign in error:', error)
    
    let errorMessage = 'An error occurred during sign in'
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No user found with this email address'
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password'
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address'
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later'
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    )
  }
}
