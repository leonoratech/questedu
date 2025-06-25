/**
 * Server-side Activity Service
 * Handles all Firebase operations for activities on the server
 */

import { serverDb } from '@/app/api/firebase-server'
import { CreateActivityData, InstructorActivity } from '@/data/models/data-model'
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

const ACTIVITIES_COLLECTION = 'activities'

/**
 * Record a new instructor activity (server-side)
 */
export async function recordActivityServer(
  activityData: CreateActivityData, 
  instructorId: string
): Promise<string> {
  try {
    const docRef = await addDoc(collection(serverDb, ACTIVITIES_COLLECTION), {
      ...activityData,
      instructorId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    console.log('Activity recorded:', activityData.type, activityData.courseName)
    return docRef.id
  } catch (error) {
    console.error('Error recording activity:', error)
    throw new Error('Failed to record activity')
  }
}

/**
 * Get recent activities for an instructor (server-side)
 */
export async function getInstructorActivitiesServer(
  instructorId: string,
  options: { limit: number }
): Promise<InstructorActivity[]> {
  try {
    const { limit: activityLimit = 10 } = options
    
    const q = query(
      collection(serverDb, ACTIVITIES_COLLECTION),
      where('instructorId', '==', instructorId),
      orderBy('createdAt', 'desc'),
      limit(Math.min(activityLimit, 50)) // Cap at 50 for performance
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
    
    return activities
  } catch (error) {
    console.error('Error fetching instructor activities:', error)
    throw new Error('Failed to fetch activities')
  }
}

/**
 * Convert activities to dashboard format (server-side)
 */
export function formatActivitiesForDashboardServer(activities: InstructorActivity[]): Array<{
  id: string
  action: string
  user: string
  time: string
  type: 'activity'
  courseId?: string
}> {
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
