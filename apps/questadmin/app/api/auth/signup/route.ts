import { generateJWTToken } from '@/lib/jwt-utils'
import { withSecurity } from '@/lib/security-middleware'
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { serverAuth, serverDb, UserProfile, UserRole } from '../../firebase-server'

const signUpHandler = async (request: NextRequest) => {
  try {
    const { email, password, firstName, lastName, role = UserRole.INSTRUCTOR } = await request.json()

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(serverAuth, email, password)
    const user = userCredential.user

    const displayName = `${firstName} ${lastName}`
    
    // Update the user's display name
    await updateProfile(user, { displayName })

    // Send email verification
    await sendEmailVerification(user)

    // Create user profile in Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      firstName,
      lastName,
      displayName,
      role,
      isActive: true,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      profileCompleted: false // Set to false for new users to require profile completion
    }

    await setDoc(doc(serverDb, 'users', user.uid), {
      ...userProfile,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    })

    // Generate JWT token with user information and role as claims
    const jwtPayload = {
      uid: user.uid,
      email: user.email || '',
      firstName,
      lastName,
      displayName,
      role,
      isActive: true
    }

    const jwtToken = generateJWTToken(jwtPayload)

    // Return full user profile data and JWT token
    const userData = {
      uid: user.uid,
      email: user.email,
      firstName,
      lastName,
      displayName,
      role,
      isActive: true,
      emailVerified: user.emailVerified,
      profileCompleted: false,
      createdAt: new Date(),
      lastLoginAt: new Date()
    }

    return NextResponse.json({ 
      success: true,
      user: userData,
      token: jwtToken,
      message: 'Account created successfully'
    })
  } catch (error: any) {
    console.error('Sign up error:', error)
    return NextResponse.json(
      { user: null, error: error.message },
      { status: 400 }
    )
  }
}

// Export with security middleware - rate limiting for auth endpoints
export const POST = withSecurity(signUpHandler, {
  rateLimit: { maxRequests: 3, windowMs: 15 * 60 * 1000 }, // 3 requests per 15 minutes
  validateInput: true
})
