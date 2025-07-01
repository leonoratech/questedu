/**
 * Activity Recorder using Repository Pattern
 * Server-side activity recording for instructor actions
 */

import {
    ActivityListOptions,
    ActivitySummary,
    CreateInstructorActivityRequest,
    InstructorActivity,
    InstructorActivityType
} from '@/data/models/instructor-activity'
import { InstructorActivityRepository } from '@/data/repository/instructor-activity-service'

const activityRepository = new InstructorActivityRepository()

/**
 * Record a new instructor activity using repository pattern
 */
export async function recordInstructorActivity(activityData: CreateInstructorActivityRequest): Promise<void> {
  try {
    await activityRepository.createActivity(activityData)
    console.log('Activity recorded via repository:', activityData.type, activityData.description)
  } catch (error) {
    console.error('Error recording activity via repository:', error)
    // Don't throw error to avoid breaking main operations
  }
}

/**
 * Get recent activities for an instructor using repository
 */
export async function getInstructorActivities(options: ActivityListOptions): Promise<InstructorActivity[]> {
  try {
    const { limit = 10, instructorId } = options
    
    if (instructorId) {
      return await activityRepository.getActivitiesByInstructor(instructorId, limit)
    } else {
      // If no instructor ID, search without filter (admin view)
      return await activityRepository.searchActivities({ limit })
    }
  } catch (error) {
    console.error('Error fetching instructor activities via repository:', error)
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
    time: formatRelativeTime(activity.createdAt instanceof Date ? activity.createdAt : new Date(activity.createdAt as any)),
    type: 'activity' as const,
    courseId: activity.courseId,
    topicId: activity.topicId,
    questionId: activity.questionId
  }))
}

/**
 * Helper function to format relative time
 */
function formatRelativeTime(date: Date): string {
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
 * Activity Recorder with Repository Pattern
 * Helper functions to record specific activity types using the repository
 */
export const ActivityRecorder = {
  courseCreated: async (instructorId: string, courseId: string, courseName: string) => {
    await recordInstructorActivity({
      instructorId,
      type: InstructorActivityType.COURSE_CREATED,
      courseId,
      courseName,
      description: `Created course "${courseName}"`
    })
  },

  coursePublished: async (instructorId: string, courseId: string, courseName: string) => {
    await recordInstructorActivity({
      instructorId,
      type: InstructorActivityType.COURSE_PUBLISHED,
      courseId,
      courseName,
      description: `Published course "${courseName}"`
    })
  },

  courseUpdated: async (instructorId: string, courseId: string, courseName: string) => {
    await recordInstructorActivity({
      instructorId,
      type: InstructorActivityType.COURSE_UPDATED,
      courseId,
      courseName,
      description: `Updated course "${courseName}"`
    })
  },

  courseDeleted: async (instructorId: string, courseId: string, courseName: string) => {
    await recordInstructorActivity({
      instructorId,
      type: InstructorActivityType.COURSE_DELETED,
      courseId,
      courseName,
      description: `Deleted course "${courseName}"`
    })
  },

  courseRated: async (instructorId: string, courseId: string, courseName: string, rating: number, studentName?: string) => {
    await recordInstructorActivity({
      instructorId,
      type: InstructorActivityType.COURSE_RATED,
      courseId,
      courseName,
      description: `Course "${courseName}" received a ${rating}-star rating${studentName ? ` from ${studentName}` : ''}`,
      metadata: { rating, studentName }
    })
  },

  courseEnrolled: async (instructorId: string, courseId: string, courseName: string, studentName?: string) => {
    await recordInstructorActivity({
      instructorId,
      type: InstructorActivityType.COURSE_ENROLLED,
      courseId,
      courseName,
      description: `${studentName || 'A student'} enrolled in "${courseName}"`,
      metadata: { studentName }
    })
  },

  topicCreated: async (instructorId: string, courseId: string, courseName: string, topicId: string, topicName: string) => {
    await recordInstructorActivity({
      instructorId,
      type: InstructorActivityType.TOPIC_CREATED,
      courseId,
      courseName,
      topicId,
      topicName,
      description: `Created topic "${topicName}" in course "${courseName}"`
    })
  },

  topicUpdated: async (instructorId: string, courseId: string, courseName: string, topicId: string, topicName: string) => {
    await recordInstructorActivity({
      instructorId,
      type: InstructorActivityType.TOPIC_UPDATED,
      courseId,
      courseName,
      topicId,
      topicName,
      description: `Updated topic "${topicName}" in course "${courseName}"`
    })
  },

  topicDeleted: async (instructorId: string, courseId: string, courseName: string, topicId: string, topicName: string) => {
    await recordInstructorActivity({
      instructorId,
      type: InstructorActivityType.TOPIC_DELETED,
      courseId,
      courseName,
      topicId,
      topicName,
      description: `Deleted topic "${topicName}" from course "${courseName}"`
    })
  },

  questionCreated: async (instructorId: string, courseId: string, courseName: string, questionId: string, questionText?: string) => {
    await recordInstructorActivity({
      instructorId,
      type: InstructorActivityType.QUESTION_CREATED,
      courseId,
      courseName,
      questionId,
      description: `Created question in course "${courseName}"${questionText ? `: ${questionText.substring(0, 50)}...` : ''}`,
      metadata: { questionText }
    })
  },

  questionUpdated: async (instructorId: string, courseId: string, courseName: string, questionId: string, questionText?: string) => {
    await recordInstructorActivity({
      instructorId,
      type: InstructorActivityType.QUESTION_UPDATED,
      courseId,
      courseName,
      questionId,
      description: `Updated question in course "${courseName}"${questionText ? `: ${questionText.substring(0, 50)}...` : ''}`,
      metadata: { questionText }
    })
  },

  questionDeleted: async (instructorId: string, courseId: string, courseName: string, questionId: string) => {
    await recordInstructorActivity({
      instructorId,
      type: InstructorActivityType.QUESTION_DELETED,
      courseId,
      courseName,
      questionId,
      description: `Deleted question from course "${courseName}"`
    })
  }
}

/**
 * Get activity repository instance for advanced operations
 */
export function getActivityRepository(): InstructorActivityRepository {
  return activityRepository
}
