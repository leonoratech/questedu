import { Timestamp } from 'firebase-admin/firestore'

// Activity data model interface for user activity tracking
export interface Activity {
  id?: string
  userId: string
  userName?: string // Cached user name for display
  userRole?: string // Cached user role for display
  actionType: ActivityType
  resourceType: ResourceType
  resourceId: string
  resourceName?: string // Cached resource name for display
  description: string
  metadata?: Record<string, any> // Additional context data
  ipAddress?: string
  userAgent?: string
  timestamp: Date | Timestamp
  collegeId?: string // For college-specific activities
  programId?: string // For program-specific activities
  batchId?: string // For batch-specific activities
}

export const ActivityType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  VIEW: 'view',
  LOGIN: 'login',
  LOGOUT: 'logout',
  ENROLL: 'enroll',
  UNENROLL: 'unenroll',
  COMPLETE: 'complete',
  SUBMIT: 'submit',
  APPROVE: 'approve',
  REJECT: 'reject',
  PUBLISH: 'publish',
  UNPUBLISH: 'unpublish',
  ARCHIVE: 'archive',
  RESTORE: 'restore'
} as const

export type ActivityType = typeof ActivityType[keyof typeof ActivityType]

export const ResourceType = {
  USER: 'user',
  COURSE: 'course',
  PROGRAM: 'program',
  BATCH: 'batch',
  COLLEGE: 'college',
  SUBJECT: 'subject',
  ASSIGNMENT: 'assignment',
  QUIZ: 'quiz',
  SUBMISSION: 'submission',
  ENROLLMENT: 'enrollment',
  NOTIFICATION: 'notification'
} as const

export type ResourceType = typeof ResourceType[keyof typeof ResourceType]

export interface CreateActivityRequest {
  userId: string
  actionType: ActivityType
  resourceType: ResourceType
  resourceId: string
  description: string
  metadata?: Record<string, any>
  collegeId?: string
  programId?: string
  batchId?: string
}

export interface ActivitySearchFilters {
  userId?: string
  actionType?: ActivityType
  resourceType?: ResourceType
  resourceId?: string
  collegeId?: string
  programId?: string
  batchId?: string
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}

export interface ActivityStats {
  totalActivities: number
  activitiesByType: Record<ActivityType, number>
  activitiesByResource: Record<ResourceType, number>
  activitiesLast24Hours: number
  activitiesLast7Days: number
  activitiesLast30Days: number
  topUsers: Array<{
    userId: string
    userName: string
    activityCount: number
  }>
}
