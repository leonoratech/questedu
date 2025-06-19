import { requireAuth } from '@/lib/server-auth'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { serverDb, UserRole } from '../../firebase-server'

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

    // Check if student is enrolled in the course
    const enrollmentsRef = collection(serverDb, 'enrollments')
    const enrollmentQuery = query(
      enrollmentsRef,
      where('userId', '==', user.uid),
      where('courseId', '==', courseId)
    )
    const enrollmentsSnapshot = await getDocs(enrollmentQuery)

    const isEnrolled = !enrollmentsSnapshot.empty
    let enrollment = null
    
    if (isEnrolled) {
      const enrollmentDoc = enrollmentsSnapshot.docs[0]
      enrollment = {
        id: enrollmentDoc.id,
        ...enrollmentDoc.data()
      }
    }

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
