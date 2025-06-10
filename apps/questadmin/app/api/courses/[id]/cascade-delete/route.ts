import { deleteCourseWithCascade, getCourseRelatedItemsCounts } from '@/data/services/course-cascade-delete'
import { requireCourseAccess } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params
    
    // Check authentication and course access permissions
    const authResult = await requireCourseAccess(courseId)(request)
    
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    // Get counts of related items
    const relatedCounts = await getCourseRelatedItemsCounts(courseId)
    
    return NextResponse.json({
      success: true,
      relatedCounts
    })

  } catch (error: any) {
    console.error('Get related counts error:', error)
    return NextResponse.json(
      { error: 'An error occurred getting related item counts' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params
    
    // Check authentication and course access permissions
    const authResult = await requireCourseAccess(courseId)(request)
    
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    // Get counts of related items for logging
    const relatedCounts = await getCourseRelatedItemsCounts(courseId)
    
    // Perform cascading delete
    const deleteResult = await deleteCourseWithCascade(courseId)
    
    if (!deleteResult.success) {
      return NextResponse.json(
        { error: deleteResult.error || 'Failed to delete course' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Course and all related data deleted successfully',
      deletedItems: deleteResult.deletedItems,
      relatedCounts
    })

  } catch (error: any) {
    console.error('Delete course cascade error:', error)
    return NextResponse.json(
      { error: 'An error occurred deleting the course and related data' },
      { status: 500 }
    )
  }
}
