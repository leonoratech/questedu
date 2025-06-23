import { requireAuth } from '@/lib/server-auth'
import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { serverDb } from '../../firebase-server'

export async function PUT(request: NextRequest) {
  // Require authentication for profile updates
  const authResult = await requireAuth()(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  const { user: authenticatedUser } = authResult

  try {
    const { 
      firstName,
      lastName,
      bio,
      department,
      college,
      collegeId,
      description,
      coreTeachingSkills,
      additionalTeachingSkills,
      mainSubjects,
      class: studentClass,
      role,
      profileCompleted
    } = await request.json()

    const updates: any = {}

    // Update basic profile fields
    if (firstName !== undefined) updates.firstName = firstName
    if (lastName !== undefined) updates.lastName = lastName
    if (bio !== undefined) updates.bio = bio
    if (department !== undefined) updates.department = department
    if (college !== undefined) updates.college = college
    if (collegeId !== undefined) updates.collegeId = collegeId
    if (description !== undefined) updates.description = description
    if (role !== undefined) updates.role = role
    if (profileCompleted !== undefined) updates.profileCompleted = profileCompleted

    // Update display name if firstName or lastName changed
    if (firstName !== undefined || lastName !== undefined) {
      const newFirstName = firstName || authenticatedUser.firstName
      const newLastName = lastName || authenticatedUser.lastName
      updates.displayName = `${newFirstName} ${newLastName}`
    }

    // Update role-specific fields
    if (coreTeachingSkills !== undefined) updates.coreTeachingSkills = coreTeachingSkills
    if (additionalTeachingSkills !== undefined) updates.additionalTeachingSkills = additionalTeachingSkills
    if (mainSubjects !== undefined) updates.mainSubjects = mainSubjects
    if (studentClass !== undefined) updates.class = studentClass

    if (Object.keys(updates).length > 0) {
      updates.updatedAt = serverTimestamp()
      await updateDoc(doc(serverDb, 'users', authenticatedUser.uid), updates)
    }

    // Get updated user profile for response
    const userRef = doc(serverDb, 'users', authenticatedUser.uid)
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    const updatedProfile = userSnap.data()

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        uid: authenticatedUser.uid,
        email: authenticatedUser.email,
        ...updatedProfile
      }
    })

  } catch (error: any) {
    console.error('Profile update error:', error)
    
    return NextResponse.json(
      { error: 'An error occurred updating profile' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Require authentication for profile access
  const authResult = await requireAuth()(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  const { user: authenticatedUser } = authResult

  try {
    // Get user profile from Firestore
    const userRef = doc(serverDb, 'users', authenticatedUser.uid)
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    const userProfile = userSnap.data()

    // Convert Firestore timestamps to ISO strings for proper serialization
    const convertTimestamps = (data: any) => {
      const converted = { ...data }
      
      // Convert common timestamp fields
      if (converted.createdAt && converted.createdAt.toDate) {
        converted.createdAt = converted.createdAt.toDate().toISOString()
      }
      if (converted.updatedAt && converted.updatedAt.toDate) {
        converted.updatedAt = converted.updatedAt.toDate().toISOString()
      }
      if (converted.lastLoginAt && converted.lastLoginAt.toDate) {
        converted.lastLoginAt = converted.lastLoginAt.toDate().toISOString()
      }
      
      return converted
    }

    return NextResponse.json({
      success: true,
      user: {
        uid: authenticatedUser.uid,
        email: authenticatedUser.email,
        displayName: authenticatedUser.displayName,
        ...convertTimestamps(userProfile)
      }
    })

  } catch (error: any) {
    console.error('Get profile error:', error)
    
    return NextResponse.json(
      { error: 'An error occurred fetching profile' },
      { status: 500 }
    )
  }
}
