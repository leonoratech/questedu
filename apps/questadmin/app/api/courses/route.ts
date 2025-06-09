import { CreateCourseSchema, validateRequestBody } from '@/data/validation/validation-schemas'
import { requireAuth } from '@/lib/server-auth'
import {
    addDoc,
    collection,
    getDoc,
    getDocs,
    orderBy,
    query,
    QueryConstraint,
    serverTimestamp,
    where
} from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { serverDb, UserRole } from '../firebase-server'

export async function GET(request: NextRequest) {
  // Require authentication for course access
  const authResult = await requireAuth()(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  const { user } = authResult
  try {
    const url = new URL(request.url)
    const instructorId = url.searchParams.get('instructorId')
    const search = url.searchParams.get('search')
    const limit = url.searchParams.get('limit')
    
    // Non-admin users can only see their own courses
    let effectiveInstructorId = instructorId
    if (user.role !== UserRole.ADMIN) {
      effectiveInstructorId = user.uid
    }
    
    console.log('Fetching courses with instructorId:', effectiveInstructorId)
    
    let constraints: QueryConstraint[] = []
    
    // Add filters first
    if (effectiveInstructorId) {
      constraints.push(where('instructorId', '==', effectiveInstructorId))
    }
    
    if (search) {
      // Note: Firestore doesn't support full-text search well
      // You might want to implement this with a search service like Algolia
      constraints.push(where('title', '>=', search))
      constraints.push(where('title', '<=', search + '\uf8ff'))
    }
    
    // Add ordering last (only if not filtering by instructorId to avoid index requirement)
    if (!effectiveInstructorId) {
      constraints.push(orderBy('createdAt', 'desc'))
    }
    
    const coursesQuery = query(collection(serverDb, 'courses'), ...constraints)
    const snapshot = await getDocs(coursesQuery)
    
    let courses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    // Sort in memory when filtering by instructor to avoid index requirement
    if (instructorId) {
      courses = courses.sort((a: any, b: any) => {
        const aTime = a.createdAt?.toMillis?.() || 0
        const bTime = b.createdAt?.toMillis?.() || 0
        return bTime - aTime
      })
    }

    console.log(`Found ${courses.length} courses for instructorId: ${instructorId}`)

    return NextResponse.json({
      success: true,
      courses
    })

  } catch (error: any) {
    console.error('Get courses error:', error)
    return NextResponse.json(
      { error: 'An error occurred fetching courses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Require instructor or admin role for course creation
  const authResult = await requireAuth()(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  const { user } = authResult
  
  // Only instructors and admins can create courses
  if (user.role === UserRole.STUDENT) {
    return NextResponse.json(
      { error: 'Students cannot create courses' },
      { status: 403 }
    )
  }

  try {
    // Validate request body
    const requestBody = await request.json()
    const validation = validateRequestBody(CreateCourseSchema, requestBody)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }
    
    const courseData = validation.data
    
    // Ensure instructorId matches authenticated user (unless admin)
    if (user.role !== UserRole.ADMIN) {
      courseData.instructorId = user.uid
    }
    
    // Validate required fields (additional check)
    if (!courseData.title || !courseData.instructorId) {
      return NextResponse.json(
        { error: 'Title and instructor ID are required' },
        { status: 400 }
      )
    }

    const newCourse = {
      ...courseData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: courseData.status || (courseData.isPublished ? 'published' : 'draft'),
      isPublished: courseData.status === 'published' || courseData.isPublished || false,
      enrollmentCount: 0
    }

    const docRef = await addDoc(collection(serverDb, 'courses'), newCourse)
    
    // Get the created course with server timestamp
    const createdCourse = await getDoc(docRef)

    return NextResponse.json({
      success: true,
      course: {
        id: docRef.id,
        ...createdCourse.data()
      },
      message: 'Course created successfully'
    })

  } catch (error: any) {
    console.error('Create course error:', error)
    return NextResponse.json(
      { error: 'An error occurred creating the course' },
      { status: 500 }
    )
  }
}
