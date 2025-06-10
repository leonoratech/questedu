import { requireAuth } from '@/lib/server-auth'
import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { serverDb, UserRole } from '../../../firebase-server'

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

    // Get the original course
    const courseRef = doc(serverDb, 'courses', courseId)
    const courseSnap = await getDoc(courseRef)
    
    if (!courseSnap.exists()) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    const originalCourse = courseSnap.data()

    // Remove id from original course data and prepare duplicated course data
    const { id: originalId, ...courseDataWithoutId } = originalCourse
    
    const duplicatedCourse = {
      ...courseDataWithoutId,
      title: `${originalCourse.title} (Copy)`,
      instructorId: user.uid, // Set current user as instructor
      isPublished: false, // Always start as draft
      status: 'draft',
      enrollmentCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    // Create the new course
    const docRef = await addDoc(collection(serverDb, 'courses'), duplicatedCourse)
    
    // Get the created course with server timestamp
    const createdCourse = await getDoc(docRef)

    return NextResponse.json({
      success: true,
      course: {
        id: docRef.id,
        ...createdCourse.data()
      },
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
