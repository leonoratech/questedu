import { UserProfileRepository } from '@/data/repository/user-profile-service';
import { requireAuth } from '@/lib/server-auth';
import { withErrorHandler } from '@/middleware/withErrorHandler';
import { NextRequest, NextResponse } from 'next/server';

export const PUT = withErrorHandler(async (request: NextRequest) => {
  // Require authentication for profile updates
  const authResult = await requireAuth()(request)

  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  const { user: authenticatedUser } = authResult

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

  const userProfileRepo = new UserProfileRepository();
  const updatedProfile = await userProfileRepo.update(authenticatedUser.uid, updates);

  return NextResponse.json({
    success: true,
    message: 'Profile updated successfully',
    user: updatedProfile
  })

});

export const GET = withErrorHandler(async (request: NextRequest) => {
  // Require authentication for profile access
  const authResult = await requireAuth()(request)

  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  const { user: authenticatedUser } = authResult

  // Get user profile from Firestore
  const userProfileRepo = new UserProfileRepository();
  const userProfile = await userProfileRepo.getById(authenticatedUser.uid);

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
});
