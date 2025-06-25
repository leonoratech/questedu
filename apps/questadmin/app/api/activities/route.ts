import { ActivityType } from '@/data/models/data-model'
import {
    ActivityListOptionsSchema,
    CreateActivitySchema,
    validateQueryParams,
    validateRequestBody
} from '@/data/validation/validation-schemas'
import {
    getInstructorActivitiesServer,
    recordActivityServer
} from '@/lib/server-activity-service'
import { requireAuth } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'
import { UserRole } from '../firebase-server'

/**
 * GET /api/activities
 * Fetch recent activities for the authenticated instructor
 */
export async function GET(request: NextRequest) {
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

  try {
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
    const activities = await getInstructorActivitiesServer(user.uid, { limit })

    return NextResponse.json({
      success: true,
      activities: activities
    })
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/activities
 * Record a new activity for the authenticated instructor
 */
export async function POST(request: NextRequest) {
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

  try {
    // Parse and validate request body
    const validation = validateRequestBody(CreateActivitySchema, await request.json())
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error },
        { status: 400 }
      )
    }

    const activityData = {
      ...validation.data,
      instructorId: user.uid, // Add the instructor ID from the authenticated user
      type: validation.data.type as ActivityType // Transform string literal to enum
    }

    // Record the activity
    const activityId = await recordActivityServer(activityData, user.uid)

    return NextResponse.json({
      success: true,
      activityId,
      message: 'Activity recorded successfully'
    })
  } catch (error) {
    console.error('Error recording activity:', error)
    return NextResponse.json(
      { error: 'Failed to record activity' },
      { status: 500 }
    )
  }
}
