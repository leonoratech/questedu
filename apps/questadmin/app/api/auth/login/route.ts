import { UserRepository } from '@/data/repository/user-repository'
import { auth } from '@/lib/firebase/config'
import { LoginSchema } from '@/lib/validations/server'
import { signInWithEmailAndPassword } from 'firebase/auth'
import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

const userRepository = new UserRepository()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const { error, value } = LoginSchema.validate(body)
    if (error) {
      return NextResponse.json(
        { message: error.details[0].message },
        { status: 400 }
      )
    }

    const { email, password } = value

    // Authenticate with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Get user profile from database
    const userProfile = await userRepository.findByUid(user.uid)
    if (!userProfile) {
      return NextResponse.json(
        { message: 'User profile not found' },
        { status: 404 }
      )
    }

    if (!userProfile.isActive) {
      return NextResponse.json(
        { message: 'Account is deactivated' },
        { status: 403 }
      )
    }

    // Update last login
    await userRepository.updateLastLogin(userProfile.id!)

    // Create JWT token
    const token = jwt.sign(
      { 
        uid: user.uid, 
        email: user.email, 
        role: userProfile.role,
        id: userProfile.id 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    )

    // Set HTTP-only cookie
    const response = NextResponse.json({
      user: {
        id: userProfile.id,
        uid: userProfile.uid,
        email: userProfile.email,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        displayName: userProfile.displayName,
        role: userProfile.role,
        profileCompleted: userProfile.profileCompleted,
      }
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
    })

    return response
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: error.message || 'Authentication failed' },
      { status: 401 }
    )
  }
}
