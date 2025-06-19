import { requireAuth } from '@/lib/server-auth'
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, where } from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { serverDb, UserRole } from '../firebase-server'

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

    // Check if course exists and is published
    const courseRef = doc(serverDb, 'courses', courseId)
    const courseSnap = await getDoc(courseRef)
    
    if (!courseSnap.exists()) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    const courseData = courseSnap.data()
    if (courseData.status !== 'published') {
      return NextResponse.json(
        { error: 'Course is not available for enrollment' },
        { status: 400 }
      )
    }

    // Check if student is already enrolled
    const enrollmentsRef = collection(serverDb, 'enrollments')
    const existingEnrollmentQuery = query(
      enrollmentsRef,
      where('userId', '==', user.uid),
      where('courseId', '==', courseId)
    )
    const existingEnrollments = await getDocs(existingEnrollmentQuery)

    if (!existingEnrollments.empty) {
      return NextResponse.json(
        { error: 'You are already enrolled in this course' },
        { status: 400 }
      )
    }

    // Create enrollment record
    const enrollmentData = {
      userId: user.uid,
      courseId: courseId,
      status: 'enrolled',
      enrolledAt: serverTimestamp(),
      progress: {
        completedTopics: [],
        totalTopics: 0,
        completionPercentage: 0,
        timeSpent: 0,
        quizScores: {},
        assignmentSubmissions: {},
        bookmarks: [],
        notes: {}
      },
      finalPrice: courseData.price || 0,
      discountApplied: 0
    }

    const enrollmentRef = await addDoc(enrollmentsRef, enrollmentData)

    // Update course enrollment count
    // Note: This would typically be done in a transaction or cloud function
    // For now, we'll skip this to avoid complexity

    return NextResponse.json({
      success: true,
      enrollmentId: enrollmentRef.id,
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

    // Get all enrollments for the user
    const enrollmentsRef = collection(serverDb, 'enrollments')
    const userEnrollmentsQuery = query(
      enrollmentsRef,
      where('userId', '==', user.uid)
    )
    const enrollmentsSnapshot = await getDocs(userEnrollmentsQuery)

    const enrollments = []
    for (const enrollmentDoc of enrollmentsSnapshot.docs) {
      const enrollmentData = enrollmentDoc.data()
      
      // Get course details
      const courseRef = doc(serverDb, 'courses', enrollmentData.courseId)
      const courseSnap = await getDoc(courseRef)
      
      if (courseSnap.exists()) {
        const courseData = courseSnap.data()
        enrollments.push({
          id: enrollmentDoc.id,
          ...enrollmentData,
          course: {
            id: courseSnap.id,
            ...courseData
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      enrollments
    })

  } catch (error: any) {
    console.error('Get enrollments error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get enrollments' },
      { status: 500 }
    )
  }
}
