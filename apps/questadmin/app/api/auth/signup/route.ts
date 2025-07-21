import { UserProfile, UserRole } from '@/data/models/user-model'
import { UserRepository } from '@/data/repository/user-repository'
import { adminAuth } from '@/lib/firebase/admin'
import { auth } from '@/lib/firebase/config'
import { SignupSchema } from '@/lib/validations/server'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { NextRequest, NextResponse } from 'next/server'

const userRepository = new UserRepository()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const { error, value } = SignupSchema.validate(body)
    if (error) {
      return NextResponse.json(
        { message: error.details[0].message },
        { status: 400 }
      )
    }

    const { email, password, firstName, lastName, role, departmentId, programId } = value

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists with this email' },
        { status: 409 }
      )
    }

    // Create Firebase user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Set custom claims for role
    await adminAuth.setCustomUserClaims(user.uid, { role })

    // Create user profile in database
    const userProfile: Omit<UserProfile, 'id'> = {
      uid: user.uid,
      email: user.email!,
      firstName,
      lastName,
      displayName: `${firstName} ${lastName}`,
      role: role as UserRole,
      isActive: true,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      profileCompleted: false,
      ...(departmentId && departmentId.trim() !== '' && { departmentId }),
      ...(programId && programId.trim() !== '' && { programId }),
    }

    const userId = await userRepository.create(userProfile)

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: userId,
        uid: user.uid,
        email: user.email,
        firstName,
        lastName,
        role,
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Signup error:', error)
    
    // If Firebase user was created but database failed, clean up
    if (error.code !== 'auth/email-already-in-use') {
      // Handle cleanup if needed
    }

    return NextResponse.json(
      { message: error.message || 'User creation failed' },
      { status: 400 }
    )
  }
}
