/**
 * Instructor Activity Service
 * Handles recording and retrieving instructor activities for the dashboard
 * Updated to use HTTP requests with JWT authentication
 */

import {
  ActivityListOptions,
  ActivitySummary,
  ActivityType,
  CreateActivityData,
  InstructorActivity
} from '@/data/models/data-model'
import { getAuthHeaders } from '../config/firebase-auth'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  activities?: ActivitySummary[]
  activityId?: string
  error?: string
  message?: string
}

/**
 * Record a new instructor activity
 */
export async function recordActivity(activityData: CreateActivityData): Promise<void> {
  try {
    const response = await fetch('/api/activities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(activityData)
    })

    const data: ApiResponse = await response.json()

    if (!response.ok) {
      console.error('Failed to record activity:', data.error)
      // Don't throw error to avoid breaking main operations
      return
    }

    console.log('Activity recorded:', activityData.type, activityData.courseName)
  } catch (error) {
    console.error('Error recording activity:', error)
    // Don't throw error to avoid breaking main operations
  }
}

/**
 * Get recent activities for an instructor
 */
export async function getInstructorActivities(options: ActivityListOptions): Promise<InstructorActivity[]> {
  try {
    const { limit: activityLimit = 10 } = options
    
    const response = await fetch(`/api/activities?limit=${activityLimit}`, {
      headers: getAuthHeaders()
    })

    const data: ApiResponse = await response.json()

    if (!response.ok) {
      console.error('Failed to fetch activities:', data.error)
      return []
    }

    // Note: The API now returns formatted activities, so we need to transform them back
    // or update the response format to match InstructorActivity[]
    return (data.activities || []).map(activity => ({
      id: activity.id,
      instructorId: '', // Not returned by formatted activities
      type: ActivityType.COURSE_CREATED, // Default, should be included in API response
      courseId: activity.courseId,
      courseName: '', // Not returned by formatted activities
      description: activity.action,
      createdAt: new Date(), // Should be parsed from activity.time
      updatedAt: new Date(),
      metadata: {}
    })) as InstructorActivity[]
  } catch (error) {
    console.error('Error fetching instructor activities:', error)
    return []
  }
}

/**
 * Convert activities to dashboard format
 */
export function formatActivitiesForDashboard(activities: InstructorActivity[]): ActivitySummary[] {
  return activities.map(activity => ({
    id: activity.id || '',
    action: activity.description,
    user: 'You', // Since these are instructor's own activities
    time: formatRelativeTime(activity.createdAt instanceof Date ? activity.createdAt : undefined),
    type: 'activity' as const,
    courseId: activity.courseId
  }))
}

/**
 * Helper function to format relative time
 */
function formatRelativeTime(date?: Date): string {
  if (!date) return 'Unknown time'
  
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  
  return date.toLocaleDateString()
}

/**
 * Helper functions to record specific activity types
 */
export const ActivityRecorder = {
  courseCreated: (instructorId: string, courseId: string, courseName: string) =>
    recordActivity({
      instructorId,
      type: ActivityType.COURSE_CREATED,
      courseId,
      courseName,
      description: `Created course "${courseName}"`
    }),

  coursePublished: (instructorId: string, courseId: string, courseName: string) =>
    recordActivity({
      instructorId,
      type: ActivityType.COURSE_PUBLISHED,
      courseId,
      courseName,
      description: `Published course "${courseName}"`
    }),

  courseRated: (instructorId: string, courseId: string, courseName: string, rating: number, studentName?: string) =>
    recordActivity({
      instructorId,
      type: ActivityType.COURSE_RATED,
      courseId,
      courseName,
      description: `Course "${courseName}" received a ${rating}-star rating${studentName ? ` from ${studentName}` : ''}`,
      metadata: { rating, studentName }
    }),

  courseEnrolled: (instructorId: string, courseId: string, courseName: string, studentName?: string) =>
    recordActivity({
      instructorId,
      type: ActivityType.COURSE_ENROLLED,
      courseId,
      courseName,
      description: `${studentName || 'A student'} enrolled in "${courseName}"`,
      metadata: { studentName }
    })
}
