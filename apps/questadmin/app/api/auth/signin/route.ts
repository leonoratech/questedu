import { generateJWTToken } from '@/lib/jwt-utils'
import { withSecurity } from '@/middleware/security-middleware'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { serverAuth, serverDb, UserRole } from '../../firebase-server'

const signInHandler = async (request: NextRequest) => {
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

    // Get user profile from Firestore to include role and other details
    const userRef = doc(serverDb, 'users', user.uid)
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    const userProfile = userSnap.data()

    // Check if user is active
    if (!userProfile.isActive) {
      return NextResponse.json(
        { error: 'Account is inactive. Please contact administrator.' },
        { status: 403 }
      )
    }

    // Update last login time in Firestore
    await setDoc(
      userRef,
      { lastLoginAt: serverTimestamp() },
      { merge: true }
    )

    // Generate JWT token with user information and role as claims
    const jwtPayload = {
      uid: user.uid,
      email: user.email || '',
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      displayName: user.displayName,
      role: userProfile.role as UserRole,
      isActive: userProfile.isActive
    }

    const jwtToken = generateJWTToken(jwtPayload)

    // Return user data and JWT token
    const userData = {
      ...userProfile,
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified
    }

    return NextResponse.json({
      success: true,
      user: userData,
      token: jwtToken,
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

// Export with security middleware - rate limiting for auth endpoints
export const POST = withSecurity(signInHandler, {
  rateLimit: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 requests per 15 minutes
  validateInput: true
})
