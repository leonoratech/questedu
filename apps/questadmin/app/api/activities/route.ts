import {
    formatActivitiesForDashboard,
    getInstructorActivities
} from '@/data/services/activity-service'
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

  // Only instructors can access their activities
  if (user.role !== UserRole.INSTRUCTOR) {
    return NextResponse.json(
      { error: 'Access denied. Only instructors can view activities.' },
      { status: 403 }
    )
  }

  try {
    const url = new URL(request.url)
    const limitParam = url.searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam, 10) : 10

    // Fetch activities for the authenticated instructor
    const activities = await getInstructorActivities({
      instructorId: user.uid,
      limit: Math.min(limit, 50) // Cap at 50 for performance
    })

    // Format for dashboard display
    const formattedActivities = formatActivitiesForDashboard(activities)

    return NextResponse.json({
      success: true,
      activities: formattedActivities
    })
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}
