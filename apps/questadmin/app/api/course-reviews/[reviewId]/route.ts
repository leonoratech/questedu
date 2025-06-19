import { deleteCourseReview, updateCourseReview } from '@/data/services/course-review-service'
import { UpdateCourseReviewSchema } from '@/data/validation/validation-schemas'
import { requireAuth } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'
import { UserRole } from '../../firebase-server'

/**
 * PUT /api/course-reviews/[reviewId] - Update an existing course review
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
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
    const { reviewId } = await params

    // Only students can update reviews
    if (user.role !== UserRole.STUDENT) {
      return NextResponse.json(
        { error: 'Only students can update course reviews' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validate request data
    const validationResult = UpdateCourseReviewSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid review data',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const updateData = validationResult.data

    // Update the review
    const result = await updateCourseReview(reviewId, updateData, user.uid)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === 'Unauthorized to update this review' ? 403 : 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Review updated successfully'
    })

  } catch (error: any) {
    console.error('Course review update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update review' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/course-reviews/[reviewId] - Delete a course review
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
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
    const { reviewId } = await params

    // Only students can delete reviews
    if (user.role !== UserRole.STUDENT) {
      return NextResponse.json(
        { error: 'Only students can delete course reviews' },
        { status: 403 }
      )
    }

    // Delete the review
    const result = await deleteCourseReview(reviewId, user.uid)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === 'Unauthorized to delete this review' ? 403 : 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    })

  } catch (error: any) {
    console.error('Course review deletion error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete review' },
      { status: 500 }
    )
  }
}
