import { ActivityRecorder } from '@/data/services/activity-service'
import { CreateCourseSchema, validateRequestBody } from '@/data/validation/validation-schemas'
import { requireAuth } from '@/lib/server-auth'
import {
  addDoc,
  collection,
  getDoc,
  getDocs,
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
    // browsing=true allows instructors to see all published courses (for browse-courses page)
    const browsing = url.searchParams.get('browsing') === 'true'
    
    // Role-based access control
    let effectiveInstructorId = instructorId
    let constraints: QueryConstraint[] = []
    
    if (user.role === UserRole.INSTRUCTOR) {
      // Check if instructor is browsing all courses or their own courses
      const browsing = url.searchParams.get('browsing') === 'true'
      
      if (browsing) {
        // Allow instructors to browse all published courses
        constraints.push(where('status', '==', 'published'))
        if (instructorId) {
          // If specific instructor requested, filter by that
          constraints.push(where('instructorId', '==', instructorId))
        }
      } else {
        // Default behavior: show instructor's own courses (for my-courses page)
        if (instructorId) {
          // Only allow instructors to see their own courses when not browsing
          if (instructorId !== user.uid) {
            return NextResponse.json(
              { error: 'Access denied' },
              { status: 403 }
            )
          }
          effectiveInstructorId = instructorId
        } else {
          // Default to showing instructor's own courses
          effectiveInstructorId = user.uid
        }
        constraints.push(where('instructorId', '==', effectiveInstructorId))
      }
    } else if (user.role === UserRole.STUDENT) {
      // Students can see all published courses
      if (instructorId) {
        // If specific instructor requested, filter by that
        constraints.push(where('instructorId', '==', instructorId))
      }
      // Add published status filter for students
      constraints.push(where('status', '==', 'published'))
    } else {
      // Other roles (if any) - restrict access
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }
    
    console.log('Fetching courses with constraints:', {
      userRole: user.role,
      instructorId: effectiveInstructorId,
      constraintsCount: constraints.length
    })
    
    if (search) {
      // Note: Firestore doesn't support full-text search well
      // You might want to implement this with a search service like Algolia
      constraints.push(where('title', '>=', search))
      constraints.push(where('title', '<=', search + '\uf8ff'))
    }
    
    // Add ordering last (Firestore requires composite index for multiple where clauses with orderBy)
    const coursesQuery = query(collection(serverDb, 'courses'), ...constraints)
    const snapshot = await getDocs(coursesQuery)
    
    let courses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Array<{id: string, status?: string, createdAt?: any, [key: string]: any}>

    // Sort in memory to avoid complex index requirements
    courses = courses.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0
      const bTime = b.createdAt?.toMillis?.() || 0
      return bTime - aTime
    })

    console.log(`Found ${courses.length} courses for user role: ${user.role}`)
    
    // For students, ensure we're only returning published courses (double-check)
    if (user.role === UserRole.STUDENT) {
      courses = courses.filter(course => course.status === 'published')
      console.log(`Filtered to ${courses.length} published courses for student`)
    }

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
    if (user.role !== UserRole.INSTRUCTOR) {
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
    
    // Record activity for course creation
    await ActivityRecorder.courseCreated(
      courseData.instructorId,
      docRef.id,
      courseData.title
    )
    
    // If course is being published on creation, record that too
    if (newCourse.isPublished) {
      await ActivityRecorder.coursePublished(
        courseData.instructorId,
        docRef.id,
        courseData.title
      )
    }

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
