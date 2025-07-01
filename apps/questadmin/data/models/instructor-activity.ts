import { Timestamp } from 'firebase-admin/firestore'

// ================================
// INSTRUCTOR ACTIVITY MODELS
// ================================

export const InstructorActivityType = {
  COURSE_CREATED: 'course_created',
  COURSE_PUBLISHED: 'course_published', 
  COURSE_UPDATED: 'course_updated',
  COURSE_DELETED: 'course_deleted',
  COURSE_RATED: 'course_rated',
  COURSE_ENROLLED: 'course_enrolled',
  TOPIC_CREATED: 'topic_created',
  TOPIC_UPDATED: 'topic_updated',
  TOPIC_DELETED: 'topic_deleted',
  QUESTION_CREATED: 'question_created',
  QUESTION_UPDATED: 'question_updated',
  QUESTION_DELETED: 'question_deleted'
} as const

export type InstructorActivityType = typeof InstructorActivityType[keyof typeof InstructorActivityType]

export interface InstructorActivity {
  id?: string
  instructorId: string
  type: InstructorActivityType
  courseId?: string
  courseName?: string
  topicId?: string
  topicName?: string
  questionId?: string
  description: string
  metadata?: Record<string, any>
  createdAt: Date | Timestamp
  updatedAt: Date | Timestamp
}

export interface CreateInstructorActivityRequest {
  instructorId: string
  type: InstructorActivityType
  courseId?: string
  courseName?: string
  topicId?: string
  topicName?: string
  questionId?: string
  description: string
  metadata?: Record<string, any>
}

export interface ActivitySearchFilters {
  instructorId?: string
  type?: InstructorActivityType
  courseId?: string
  topicId?: string
  questionId?: string
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}

export interface ActivitySummary {
  id: string
  action: string
  user: string
  time: string
  type: 'activity'
  courseId?: string
  topicId?: string
  questionId?: string
}

export interface ActivityListOptions {
  limit?: number
  instructorId?: string
  type?: InstructorActivityType
}

export interface ActivityStats {
  totalActivities: number
  activitiesByType: Record<InstructorActivityType, number>
  activitiesLast24Hours: number
  activitiesLast7Days: number
  activitiesLast30Days: number
  mostActiveInstructor?: {
    instructorId: string
    activityCount: number
  }
}
