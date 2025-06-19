import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where
} from 'firebase/firestore'
import { getFirestoreDb } from '../config/questdata-config'
import { CourseReview, CreateCourseReviewData, UpdateCourseReviewData } from '../models/data-model'
import { isEnrolledInCourse } from './enrollment-service'

const REVIEWS_COLLECTION = 'course_reviews'
const COURSES_COLLECTION = 'courses'

/**
 * Check if user can rate a course (must be enrolled)
 */
export async function canUserRateCourse(courseId: string, userId: string): Promise<boolean> {
  try {
    return await isEnrolledInCourse(courseId)
  } catch (error) {
    console.error('Error checking if user can rate course:', error)
    return false
  }
}

/**
 * Get existing review by user for a course
 */
export async function getUserReviewForCourse(courseId: string, userId: string): Promise<CourseReview | null> {
  try {
    const db = getFirestoreDb()
    const reviewsRef = collection(db, REVIEWS_COLLECTION)
    const q = query(
      reviewsRef,
      where('courseId', '==', courseId),
      where('userId', '==', userId)
    )

    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return null
    }

    const reviewDoc = querySnapshot.docs[0]
    return {
      id: reviewDoc.id,
      ...reviewDoc.data(),
      createdAt: reviewDoc.data().createdAt?.toDate() || new Date(),
      updatedAt: reviewDoc.data().updatedAt?.toDate() || new Date()
    } as CourseReview
  } catch (error) {
    console.error('Error getting user review for course:', error)
    return null
  }
}

/**
 * Submit or update a course review
 */
export async function submitCourseReview(
  reviewData: CreateCourseReviewData,
  userId: string
): Promise<{ success: boolean; reviewId?: string; error?: string }> {
  try {
    const db = getFirestoreDb()

    // Check if user is enrolled in the course
    const canRate = await canUserRateCourse(reviewData.courseId, userId)
    if (!canRate) {
      return { success: false, error: 'You must be enrolled in this course to rate it' }
    }

    // Check if user already has a review for this course
    const existingReview = await getUserReviewForCourse(reviewData.courseId, userId)
    
    if (existingReview) {
      // Update existing review
      const reviewRef = doc(db, REVIEWS_COLLECTION, existingReview.id!)
      await updateDoc(reviewRef, {
        rating: reviewData.rating,
        feedback: reviewData.feedback || '',
        isPublished: reviewData.isPublished,
        updatedAt: serverTimestamp()
      })
      
      // Recalculate course rating
      await updateCourseRating(reviewData.courseId)
      
      return { success: true, reviewId: existingReview.id }
    } else {
      // Create new review
      const reviewsRef = collection(db, REVIEWS_COLLECTION)
      const newReview = {
        ...reviewData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        helpfulVotes: 0,
        reportedCount: 0
      }

      const docRef = await addDoc(reviewsRef, newReview)
      
      // Recalculate course rating
      await updateCourseRating(reviewData.courseId)
      
      return { success: true, reviewId: docRef.id }
    }
  } catch (error) {
    console.error('Error submitting course review:', error)
    return { success: false, error: 'Failed to submit review' }
  }
}

/**
 * Update an existing course review
 */
export async function updateCourseReview(
  reviewId: string,
  updateData: UpdateCourseReviewData,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getFirestoreDb()
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId)
    
    // Check if review exists and belongs to user
    const reviewDoc = await getDoc(reviewRef)
    if (!reviewDoc.exists()) {
      return { success: false, error: 'Review not found' }
    }
    
    const reviewData = reviewDoc.data()
    if (reviewData.userId !== userId) {
      return { success: false, error: 'Unauthorized to update this review' }
    }

    // Update the review
    await updateDoc(reviewRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    })

    // Recalculate course rating
    await updateCourseRating(reviewData.courseId)
    
    return { success: true }
  } catch (error) {
    console.error('Error updating course review:', error)
    return { success: false, error: 'Failed to update review' }
  }
}

/**
 * Delete a course review
 */
export async function deleteCourseReview(
  reviewId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getFirestoreDb()
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId)
    
    // Check if review exists and belongs to user
    const reviewDoc = await getDoc(reviewRef)
    if (!reviewDoc.exists()) {
      return { success: false, error: 'Review not found' }
    }
    
    const reviewData = reviewDoc.data()
    if (reviewData.userId !== userId) {
      return { success: false, error: 'Unauthorized to delete this review' }
    }

    const courseId = reviewData.courseId

    // Delete the review
    await deleteDoc(reviewRef)

    // Recalculate course rating
    await updateCourseRating(courseId)
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting course review:', error)
    return { success: false, error: 'Failed to delete review' }
  }
}

/**
 * Get all reviews for a course
 */
export async function getCourseReviews(
  courseId: string,
  limit?: number
): Promise<CourseReview[]> {
  try {
    const db = getFirestoreDb()
    const reviewsRef = collection(db, REVIEWS_COLLECTION)
    let q = query(
      reviewsRef,
      where('courseId', '==', courseId),
      where('isPublished', '==', true),
      orderBy('createdAt', 'desc')
    )

    if (limit) {
      q = query(q, orderBy('createdAt', 'desc'))
    }

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    })) as CourseReview[]
  } catch (error) {
    console.error('Error getting course reviews:', error)
    return []
  }
}

/**
 * Calculate and update course rating based on reviews
 */
export async function updateCourseRating(courseId: string): Promise<void> {
  try {
    const db = getFirestoreDb()
    
    // Get all published reviews for the course
    const reviewsRef = collection(db, REVIEWS_COLLECTION)
    const q = query(
      reviewsRef,
      where('courseId', '==', courseId),
      where('isPublished', '==', true)
    )

    const querySnapshot = await getDocs(q)
    const reviews = querySnapshot.docs.map(doc => doc.data())

    let totalRating = 0
    let totalReviews = reviews.length

    // Calculate average rating
    if (totalReviews > 0) {
      totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    }

    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0

    // Update course document
    const courseRef = doc(db, COURSES_COLLECTION, courseId)
    await updateDoc(courseRef, {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      ratingCount: totalReviews,
      updatedAt: serverTimestamp()
    })

    console.log(`Updated course ${courseId} rating: ${averageRating} (${totalReviews} reviews)`)
  } catch (error) {
    console.error('Error updating course rating:', error)
  }
}

/**
 * Get course rating statistics
 */
export async function getCourseRatingStats(courseId: string) {
  try {
    const reviews = await getCourseReviews(courseId)
    
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    let totalRating = 0

    reviews.forEach(review => {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++
      totalRating += review.rating
    })

    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
      ratingDistribution,
      reviews: reviews.slice(0, 5) // Return latest 5 reviews for preview
    }
  } catch (error) {
    console.error('Error getting course rating stats:', error)
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      reviews: []
    }
  }
}
