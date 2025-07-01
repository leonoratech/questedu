import { UserRole } from '@/data/models/user-model'
import {
    ActivityRepository
} from '@/data/repository/server-activity-service'
import {
    ActivityListOptionsSchema,
    CreateActivitySchema,
    validateQueryParams,
    validateRequestBody
} from '@/data/validation/validation-schemas'
import { requireAuth } from '@/lib/server-auth'
import { withErrorHandler } from '@/middleware/withErrorHandler'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/activities
 * Fetch recent activities for the authenticated instructor
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  // Require authentication
  const authResult = await requireAuth()(request)

  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  const { user } = authResult

  // Only instructors and superadmins can access activities
  if (user.role !== UserRole.INSTRUCTOR && user.role !== UserRole.SUPERADMIN) {
    return NextResponse.json(
      { error: 'Access denied. Only instructors can view activities.' },
      { status: 403 }
    )
  }

  const url = new URL(request.url)

  // Validate query parameters
  const validation = validateQueryParams(ActivityListOptionsSchema, url.searchParams)

  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: validation.error },
      { status: 400 }
    )
  }

  const { limit = 10 } = validation.data

  // Fetch activities for the authenticated instructor
  const activityRepo = new ActivityRepository();
  const activities = await activityRepo.getInstructorActivitiesServer(user.uid, { limit })

  return NextResponse.json({
    success: true,
    activities: activities
  })

});

/**
 * POST /api/activities
 * Record a new activity for the authenticated instructor
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  // Require authentication
  const authResult = await requireAuth()(request)

  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  const { user } = authResult

  // Only instructors and superadmins can record activities
  if (user.role !== UserRole.INSTRUCTOR && user.role !== UserRole.SUPERADMIN) {
    return NextResponse.json(
      { error: 'Access denied. Only instructors can record activities.' },
      { status: 403 }
    )
  }


  // Parse and validate request body
  const validation = validateRequestBody(CreateActivitySchema, await request.json())

  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid request data', details: validation.error },
      { status: 400 }
    )
  }

  // Map the new activity type to the old enum for backward compatibility
  const mapToLegacyActivityType = (newType: string): any => {
    switch (newType) {
      case 'course_created':
        return 'course_created'
      case 'course_published':
        return 'course_published'
      case 'course_rated':
        return 'course_rated'
      case 'course_enrolled':
        return 'course_enrolled'
      // For new types, we'll use the string value directly
      default:
        return newType
    }
  }

  const activityData = {
    instructorId: user.uid, // Add the instructor ID from the authenticated user
    type: mapToLegacyActivityType(validation.data.type),
    courseId: validation.data.courseId,
    courseName: validation.data.courseName,
    description: validation.data.description,
    metadata: validation.data.metadata || {}
  }

  // Ensure required fields are present for legacy compatibility
  if (!activityData.courseId) {
    return NextResponse.json(
      { error: 'Course ID is required for activity recording' },
      { status: 400 }
    )
  }

  if (!activityData.courseName) {
    return NextResponse.json(
      { error: 'Course name is required for activity recording' },
      { status: 400 }
    )
  }

  // Create an instance of the activity repository
  const activityRepo = new ActivityRepository();
  // Record the activity
  const activityId = await activityRepo.recordActivity(activityData, user.uid)

  return NextResponse.json({
    success: true,
    activityId,
    message: 'Activity recorded successfully'
  })

});
