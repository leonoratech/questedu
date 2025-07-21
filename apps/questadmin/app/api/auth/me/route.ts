import { UserRepository } from '@/data/repository/user-repository'
import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

const userRepository = new UserRepository()

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { message: 'No authentication token' },
        { status: 401 }
      )
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    // Get current user profile
    const userProfile = await userRepository.findByUid(decoded.uid)
    if (!userProfile || !userProfile.isActive) {
      return NextResponse.json(
        { message: 'User not found or inactive' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        id: userProfile.id,
        uid: userProfile.uid,
        email: userProfile.email,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        displayName: userProfile.displayName,
        role: userProfile.role,
        profileCompleted: userProfile.profileCompleted,
        departmentId: userProfile.departmentId,
        programId: userProfile.programId,
        bio: userProfile.bio,
        description: userProfile.description,
        mainSubjects: userProfile.mainSubjects,
        profilePicture: userProfile.profilePicture,
      }
    })

  } catch (error: any) {
    console.error('Get current user error:', error)
    return NextResponse.json(
      { message: 'Authentication failed' },
      { status: 401 }
    )
  }
}
