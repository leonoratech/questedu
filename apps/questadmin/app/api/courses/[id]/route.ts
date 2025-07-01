import { CourseRepository } from '@/data/repository/course-service'
import { UserRepository } from '@/data/repository/user-service'
import { ActivityRecorder } from '@/data/services/activity-recorder'
import { requireCourseAccess } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params
    
    const courseRepository = new CourseRepository()
    const userRepository = new UserRepository()
    
    const course = await courseRepository.getById(courseId)
    
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }
    
    // Populate instructor name if instructorId exists
    let instructorName = ''
    if (course.instructorId) {
      try {
        const instructor = await userRepository.getById(course.instructorId)
        if (instructor) {
          instructorName = `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim()
        }
      } catch (error) {
        console.warn('Failed to fetch instructor details:', error)
      }
    }

    return NextResponse.json({
      success: true,
      course: {
        ...course,
        instructor: instructorName || course.instructor || 'Unknown Instructor'
      }
    })

  } catch (error: any) {
    console.error('Get course error:', error)
    return NextResponse.json(
      { error: 'An error occurred fetching the course' },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    const { user } = authResult
    const updateData = await request.json()
    
    const courseRepository = new CourseRepository()
    
    // Check if course exists
    const currentCourse = await courseRepository.getById(courseId)
    if (!currentCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    const wasPublished = currentCourse.isPublished || currentCourse.status === 'published'
    const willBePublished = updateData.isPublished || updateData.status === 'published'

    // Remove fields that shouldn't be updated
    delete updateData.id
    delete updateData.createdAt

    await courseRepository.update(courseId, updateData)
    
    // Record activity if course is being published for the first time
    if (!wasPublished && willBePublished) {
      await ActivityRecorder.coursePublished(
        currentCourse.instructorId,
        courseId,
        currentCourse.title || updateData.title || 'Untitled Course'
      )
    }
    
    // Get updated course
    const updatedCourse = await courseRepository.getById(courseId)

    return NextResponse.json({
      success: true,
      course: updatedCourse,
      message: 'Course updated successfully'
    })

  } catch (error: any) {
    console.error('Update course error:', error)
    return NextResponse.json(
      { error: 'An error occurred updating the course' },
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

    const { user } = authResult
    const courseRepository = new CourseRepository()
    
    // Check if course exists
    const course = await courseRepository.getById(courseId)
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    await courseRepository.delete(courseId)

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully'
    })

  } catch (error: any) {
    console.error('Delete course error:', error)
    return NextResponse.json(
      { error: 'An error occurred deleting the course' },
      { status: 500 }
    )
  }
}
