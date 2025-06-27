import { CourseRepository } from '@/data/repository/course-service'
import { EnrollmentRepository } from '@/data/repository/enrollment-service'
import { ActivityRecorder } from '@/data/services/activity-service'
import { requireAuth } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'
import { UserRole } from '../firebase-server'

export async function POST(request: NextRequest) {
  try {
    // Require authentication and student role for enrollment
    const authResult = await requireAuth()(request)
    
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const { user } = authResult
    
    // Only students can enroll in courses
    if (user.role !== UserRole.STUDENT) {
      return NextResponse.json(
        { error: 'Only students can enroll in courses' },
        { status: 403 }
      )
    }

    const { courseId } = await request.json()

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      )
    }

    const courseRepository = new CourseRepository()
    const enrollmentRepository = new EnrollmentRepository()

    // Check if course exists and is published
    const course = await courseRepository.getById(courseId)
    
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    if (course.status !== 'published') {
      return NextResponse.json(
        { error: 'Course is not available for enrollment' },
        { status: 400 }
      )
    }

    // Check if student is already enrolled
    const existingEnrollment = await enrollmentRepository.getEnrollmentByStudentAndCourse(user.uid, courseId)

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'You are already enrolled in this course' },
        { status: 400 }
      )
    }

    // Create enrollment record
    const enrollmentId = await enrollmentRepository.createEnrollment({
      studentId: user.uid,
      courseId: courseId,
      status: 'active'
    })

    // Record activity for the course instructor
    await ActivityRecorder.courseEnrolled(
      course.instructorId,
      courseId,
      course.title || 'Untitled Course',
      user.displayName || user.firstName || 'A student'
    )

    // Update course enrollment count
    // Note: This would typically be done in a transaction or cloud function
    // For now, we'll skip this to avoid complexity

    return NextResponse.json({
      success: true,
      enrollmentId: enrollmentId,
      message: 'Successfully enrolled in course'
    })

  } catch (error: any) {
    console.error('Enrollment error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to enroll in course' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Require authentication for viewing enrollments
    const authResult = await requireAuth()(request)
    
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const { user } = authResult
    
    // Only students can view their enrollments
    if (user.role !== UserRole.STUDENT) {
      return NextResponse.json(
        { error: 'Only students can view enrollments' },
        { status: 403 }
      )
    }

    const enrollmentRepository = new EnrollmentRepository()
    const courseRepository = new CourseRepository()

    // Get all enrollments for the user
    const enrollments = await enrollmentRepository.getEnrollmentsByStudent(user.uid)

    const enrollmentsWithCourses = []
    for (const enrollment of enrollments) {
      // Get course details
      const course = await courseRepository.getById(enrollment.courseId)
      
      if (course) {
        enrollmentsWithCourses.push({
          ...enrollment,
          course: course
        })
      }
    }

    return NextResponse.json({
      success: true,
      enrollments: enrollmentsWithCourses
    })

  } catch (error: any) {
    console.error('Get enrollments error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get enrollments' },
      { status: 500 }
    )
  }
}
