// Enrollment service using Next.js API routes

import { getAuthHeaders } from '../config/firebase-auth'

export interface CourseEnrollment {
  id: string
  userId: string
  courseId: string
  status: 'enrolled' | 'completed' | 'dropped' | 'pending'
  enrolledAt: Date
  completedAt?: Date
  lastAccessedAt?: Date
  progress: {
    completedTopics: string[]
    totalTopics: number
    completionPercentage: number
    timeSpent: number
    quizScores: { [topicId: string]: any }
    assignmentSubmissions: { [assignmentId: string]: any }
    bookmarks: string[]
    notes: { [topicId: string]: string }
  }
  finalPrice: number
  discountApplied?: number
  course?: any // Course details when populated
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  enrollments?: T[]
  enrollmentId?: string
  error?: string
  message?: string
}

/**
 * Enroll a student in a course
 */
export const enrollInCourse = async (courseId: string): Promise<{ success: boolean; error?: string; enrollmentId?: string }> => {
  try {
    const response = await fetch('/api/enrollments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ courseId })
    })

    const data: ApiResponse = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to enroll in course' }
    }

    return { 
      success: true, 
      enrollmentId: data.enrollmentId,
    }
  } catch (error) {
    console.error('Error enrolling in course:', error)
    return { success: false, error: 'Network error occurred' }
  }
}

/**
 * Get all enrollments for the current user
 */
export const getUserEnrollments = async (): Promise<CourseEnrollment[]> => {
  try {
    const response = await fetch('/api/enrollments', {
      headers: getAuthHeaders()
    })

    const data: ApiResponse = await response.json()

    if (!response.ok) {
      console.error('Failed to fetch enrollments:', data.error)
      return []
    }

    // Transform Firestore timestamps to Date objects
    const enrollments = data.enrollments?.map((enrollment: any) => ({
      ...enrollment,
      enrolledAt: enrollment.enrolledAt?.seconds 
        ? new Date(enrollment.enrolledAt.seconds * 1000) 
        : new Date(enrollment.enrolledAt),
      completedAt: enrollment.completedAt?.seconds 
        ? new Date(enrollment.completedAt.seconds * 1000) 
        : enrollment.completedAt ? new Date(enrollment.completedAt) : undefined,
      lastAccessedAt: enrollment.lastAccessedAt?.seconds 
        ? new Date(enrollment.lastAccessedAt.seconds * 1000) 
        : enrollment.lastAccessedAt ? new Date(enrollment.lastAccessedAt) : undefined
    })) || []

    return enrollments
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    return []
  }
}

/**
 * Check if user is enrolled in a specific course
 */
export const isEnrolledInCourse = async (courseId: string): Promise<boolean> => {
  try {
    const enrollments = await getUserEnrollments()
    return enrollments.some(enrollment => enrollment.courseId === courseId)
  } catch (error) {
    console.error('Error checking enrollment status:', error)
    return false
  }
}

/**
 * Update enrollment progress
 */
export const updateEnrollmentProgress = async (
  enrollmentId: string, 
  progress: Partial<CourseEnrollment['progress']>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`/api/enrollments/${enrollmentId}/progress`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ progress })
    })

    const data: ApiResponse = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to update progress' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating enrollment progress:', error)
    return { success: false, error: 'Network error occurred' }
  }
}

/**
 * Unenroll from a course
 */
export const unenrollFromCourse = async (enrollmentId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`/api/enrollments/${enrollmentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })

    const data: ApiResponse = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to unenroll from course' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error unenrolling from course:', error)
    return { success: false, error: 'Network error occurred' }
  }
}
