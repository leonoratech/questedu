/**
 * Course Rating Loader Service
 * Enriches course data with real ratings from the database
 */

import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { getFirestoreDb } from '../config/questdata-config';
import { HybridAdminCourse } from '../models/data-model';
import { AdminCourse } from './admin-course-service';

/**
 * Load rating data for a single course
 */
export async function loadCourseRating(courseId: string): Promise<{ rating: number; ratingCount: number }> {
  try {
    const db = getFirestoreDb()
    const courseRef = doc(db, 'courses', courseId)
    const courseDoc = await getDoc(courseRef)
    
    if (courseDoc.exists()) {
      const data = courseDoc.data()
      return {
        rating: data.rating || 0,
        ratingCount: data.ratingCount || 0
      }
    }
    
    return { rating: 0, ratingCount: 0 }
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
    const db = getFirestoreDb()
    const ratings: Record<string, { rating: number; ratingCount: number }> = {}
    
    // Load ratings in batches of 10 (Firestore limit for 'in' queries)
    const batchSize = 10
    for (let i = 0; i < courseIds.length; i += batchSize) {
      const batch = courseIds.slice(i, i + batchSize)
      const coursesRef = collection(db, 'courses')
      const q = query(coursesRef, where('__name__', 'in', batch))
      
      const querySnapshot = await getDocs(q)
      querySnapshot.docs.forEach(doc => {
        const data = doc.data()
        ratings[doc.id] = {
          rating: data.rating || 0,
          ratingCount: data.ratingCount || 0
        }
      })
    }
    
    // Fill in any missing courses with default values
    courseIds.forEach(id => {
      if (!ratings[id]) {
        ratings[id] = { rating: 0, ratingCount: 0 }
      }
    })
    
    return ratings
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
