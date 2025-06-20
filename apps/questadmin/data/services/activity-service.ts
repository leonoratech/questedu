/**
 * Instructor Activity Service
 * Handles recording and retrieving instructor activities for the dashboard
 */

import {
    ActivityListOptions,
    ActivitySummary,
    ActivityType,
    CreateActivityData,
    InstructorActivity
} from '@/data/models/data-model'
import {
    addDoc,
    collection,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
    where
} from 'firebase/firestore'
import { getFirestoreDb } from '../config/questdata-config'

const ACTIVITIES_COLLECTION = 'instructor_activities'

/**
 * Record a new instructor activity
 */
export async function recordActivity(activityData: CreateActivityData): Promise<void> {
  try {
    const db = getFirestoreDb()
    await addDoc(collection(db, ACTIVITIES_COLLECTION), {
      ...activityData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
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
    const { instructorId, limit: activityLimit = 10 } = options
    const db = getFirestoreDb()
    
    // Temporarily use a simpler query without orderBy to avoid index requirement
    // TODO: Add proper index and restore orderBy('createdAt', 'desc') for better performance
    const q = query(
      collection(db, ACTIVITIES_COLLECTION),
      where('instructorId', '==', instructorId),
      orderBy('createdAt', 'desc'), // Ensure we order by createdAt
      limit(activityLimit)
    )
    
    const querySnapshot = await getDocs(q)
    const activities: InstructorActivity[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      activities.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
      } as InstructorActivity)
    })
    
    // Sort activities by createdAt in descending order (most recent first) on client-side
    activities.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0
      const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0
      return dateB - dateA
    })
    
    return activities
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
