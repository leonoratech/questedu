import { getUserReviewForCourse, submitCourseReview } from '@/data/services/course-review-service'
import { CreateCourseReviewSchema } from '@/data/validation/validation-schemas'
import { requireAuth } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'
import { UserRole } from '../firebase-server'

/**
 * POST /api/course-reviews - Submit a new course review
 */
export async function POST(request: NextRequest) {
  try {
    // Require student authentication
    const authResult = await requireAuth()(request)
    
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const { user } = authResult

    // Only students can submit reviews
    if (user.role !== UserRole.STUDENT) {
      return NextResponse.json(
        { error: 'Only students can submit course reviews' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validate request data
    const validationResult = CreateCourseReviewSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid review data',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const reviewData = {
      ...validationResult.data,
      userId: user.uid
    }

    // Submit the review
    const result = await submitCourseReview(reviewData, user.uid)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      reviewId: result.reviewId,
      message: 'Review submitted successfully'
    })

  } catch (error: any) {
    console.error('Course review submission error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit review' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/course-reviews - Get user's review for a course
 */
export async function GET(request: NextRequest) {
  try {
    // Require student authentication
    const authResult = await requireAuth()(request)
    
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const { user } = authResult
    
    // Only students can view their reviews
    if (user.role !== UserRole.STUDENT) {
      return NextResponse.json(
        { error: 'Only students can view reviews' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      )
    }

    // Get user's review for the course
    const review = await getUserReviewForCourse(courseId, user.uid)

    return NextResponse.json({
      success: true,
      review
    })

  } catch (error: any) {
    console.error('Get course review error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get review' },
      { status: 500 }
    )
  }
}
