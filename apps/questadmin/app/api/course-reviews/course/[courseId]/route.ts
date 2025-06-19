import { getCourseRatingStats, getCourseReviews } from '@/data/services/course-review-service'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/course-reviews/course/[courseId] - Get reviews and rating stats for a course
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit')
    const includeStats = searchParams.get('includeStats') === 'true'

    // Get reviews for the course
    const reviews = await getCourseReviews(courseId, limit ? parseInt(limit) : undefined)

    let stats = null
    if (includeStats) {
      stats = await getCourseRatingStats(courseId)
    }

    return NextResponse.json({
      success: true,
      reviews,
      stats
    })

  } catch (error: any) {
    console.error('Get course reviews error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get course reviews' },
      { status: 500 }
    )
  }
}
