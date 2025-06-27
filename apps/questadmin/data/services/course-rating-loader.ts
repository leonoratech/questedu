/**
 * Course Rating Loader Service
 * Updated to use HTTP requests with JWT authentication
 */

import { getAuthHeaders } from '../config/firebase-auth'
import { HybridAdminCourse } from '../models/data-model'
import { AdminCourse } from './admin-course-service'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  rating?: { rating: number; ratingCount: number }
  ratings?: Record<string, { rating: number; ratingCount: number }>
  error?: string
  message?: string
}

/**
 * Load rating data for a single course
 */
export async function loadCourseRating(courseId: string): Promise<{ rating: number; ratingCount: number }> {
  try {
    const response = await fetch(`/api/courses/${courseId}/ratings`, {
      headers: getAuthHeaders()
    })

    const data: ApiResponse = await response.json()

    if (!response.ok) {
      console.error('Failed to load course rating:', data.error)
      return { rating: 0, ratingCount: 0 }
    }

    return data.rating || { rating: 0, ratingCount: 0 }
  } catch (error) {
    console.error('Error loading course rating:', error)
    return { rating: 0, ratingCount: 0 }
  }
}

/**
 * Load rating data for multiple courses
 */
export async function loadCoursesRatings(courseIds: string[]): Promise<Record<string, { rating: number; ratingCount: number }>> {
  try {
    if (courseIds.length === 0) {
      return {}
    }

    const response = await fetch('/api/courses/ratings/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ courseIds })
    })

    const data: ApiResponse = await response.json()

    if (!response.ok) {
      console.error('Failed to load courses ratings:', data.error)
      return courseIds.reduce((acc, id) => {
        acc[id] = { rating: 0, ratingCount: 0 }
        return acc
      }, {} as Record<string, { rating: number; ratingCount: number }>)
    }

    return data.ratings || {}
  } catch (error) {
    console.error('Error loading courses ratings:', error)
    return courseIds.reduce((acc, id) => {
      acc[id] = { rating: 0, ratingCount: 0 }
      return acc
    }, {} as Record<string, { rating: number; ratingCount: number }>)
  }
}

/**
 * Enrich a single course with rating data
 */
export async function enrichCourseWithRating(course: AdminCourse): Promise<AdminCourse> {
  if (!course.id) return course
  
  const ratingData = await loadCourseRating(course.id)
  
  return {
    ...course,
    rating: ratingData.rating,
    ratingCount: ratingData.ratingCount
  }
}

/**
 * Enrich multiple courses with rating data
 */
export async function enrichCoursesWithRatings(courses: AdminCourse[]): Promise<AdminCourse[]>
export async function enrichCoursesWithRatings(courses: HybridAdminCourse[]): Promise<HybridAdminCourse[]>
export async function enrichCoursesWithRatings(courses: AdminCourse[] | HybridAdminCourse[]): Promise<AdminCourse[] | HybridAdminCourse[]> {
  const courseIds = courses.filter(c => c.id).map(c => c.id!)
  
  if (courseIds.length === 0) return courses
  
  const ratingsData = await loadCoursesRatings(courseIds)
  
  return courses.map(course => {
    if (!course.id) return course
    
    const ratingData = ratingsData[course.id]
    return {
      ...course,
      rating: ratingData.rating,
      ratingCount: ratingData.ratingCount
    }
  })
}
