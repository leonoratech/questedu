import { Course } from '@/data/models/course'
import { CourseRepository } from '@/data/repository/course-service'
import { requireAuth } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'
import { UserRole } from '../../../firebase-server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params
    
    // Require authentication
    const authResult = await requireAuth()(request)
    
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const { user } = authResult
    
    // Only instructors and admins can duplicate courses
    if (user.role === UserRole.STUDENT) {
      return NextResponse.json(
        { error: 'Students cannot duplicate courses' },
        { status: 403 }
      )
    }

    const courseRepository = new CourseRepository()
    
    // Get the original course
    const originalCourse = await courseRepository.getById(courseId)
    
    if (!originalCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Remove id and timestamp fields from original course data and prepare duplicated course data
    const { id: originalId, createdAt, updatedAt, ...courseDataWithoutId } = originalCourse
    
    const duplicatedCourseData: Omit<Course, 'id'> = {
      ...courseDataWithoutId,
      title: `${originalCourse.title} (Copy)`,
      instructorId: user.uid, // Set current user as instructor
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: user.uid
    }

    // Create the new course
    const newCourse = await courseRepository.createCourse(duplicatedCourseData)

    return NextResponse.json({
      success: true,
      course: newCourse,
      message: 'Course duplicated successfully'
    })

  } catch (error: any) {
    console.error('Duplicate course error:', error)
    return NextResponse.json(
      { error: 'An error occurred duplicating the course' },
      { status: 500 }
    )
  }
}
