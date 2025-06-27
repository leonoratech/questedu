import { UserRole } from '@/data/models/user-model'
import { EnrollmentRepository } from '@/data/repository/enrollment-service'
import { requireAuth } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    // Require authentication
    const authResult = await requireAuth()(request)
    
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const { user } = authResult
    const { courseId } = await params

    // Only students can check enrollment status
    if (user.role !== UserRole.STUDENT) {
      return NextResponse.json(
        { error: 'Only students can check enrollment status' },
        { status: 403 }
      )
    }

    const enrollmentRepository = new EnrollmentRepository()
    
    // Check if student is enrolled in the course
    const enrollment = await enrollmentRepository.getEnrollmentByStudentAndCourse(user.uid, courseId)
    const isEnrolled = enrollment !== null

    return NextResponse.json({
      success: true,
      isEnrolled,
      enrollment
    })

  } catch (error: any) {
    console.error('Check enrollment error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check enrollment status' },
      { status: 500 }
    )
  }
}
