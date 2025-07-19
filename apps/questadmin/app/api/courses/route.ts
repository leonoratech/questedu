import { Course } from '@/data/models/course'
import { UserRole } from '@/data/models/user-model'
import { CourseRepository } from '@/data/repository/course-service'
import { CreateCourseSchema, validateRequestBody } from '@/data/validation/validation-schemas'
import { requireAuth } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'

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
    
    console.log('Fetching courses with params:', {
      userRole: user.role,
      instructorId: instructorId,
      browsing: browsing,
      hasSearch: !!search
    })
    
    // Initialize course repository
    const courseRepo = new CourseRepository()
    
    // Build search filters based on user role and parameters
    const filters: any = {
      search,
      limit: limit ? parseInt(limit) : undefined
    }

    if (user.role === UserRole.INSTRUCTOR) {
      if (browsing) {
        // Allow instructors to browse all published courses
        filters.status = 'published'
        if (instructorId) {
          filters.instructorId = instructorId
        }
      } else {
        // Default behavior: show instructor's own courses
        const targetInstructorId = instructorId || user.uid
        if (instructorId && instructorId !== user.uid) {
          return NextResponse.json(
            { error: 'Access denied' },
            { status: 403 }
          )
        }
        filters.instructorId = targetInstructorId
      }
    } else if (user.role === UserRole.STUDENT) {
      // Students can see all published courses
      filters.status = 'published'
      if (instructorId) {
        filters.instructorId = instructorId
      }
    } else {
      // Other roles (if any) - restrict access
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Fetch courses using repository
    const courses = await courseRepo.searchCourses(filters)

    console.log(`Found ${courses.length} courses for user role: ${user.role}`)
    
    // For students, ensure we're only returning published courses (double-check)
    let finalCourses = courses
    if (user.role === UserRole.STUDENT) {
      finalCourses = courses.filter((course: Course) => course.status === 'published')
      console.log(`Filtered to ${finalCourses.length} published courses for student`)
    }

    return NextResponse.json({
      success: true,
      courses: finalCourses
    })

  } catch (error: any) {
    console.error('Get courses error:', error)
    
    // Provide more specific error information for debugging
    const errorMessage = error?.message || 'Unknown error'
    const errorCode = error?.code || 'unknown'
    
    console.error('Error details:', {
      message: errorMessage,
      code: errorCode,
      userRole: user?.role,
      hasSearch: !!request.url.includes('search='),
      stack: error?.stack
    })
    
    return NextResponse.json(
      { 
        error: 'An error occurred fetching courses',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
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

    const newCourse: Omit<Course, 'id'> = {
      title: courseData.title,
      description: courseData.description || '',
      instructorId: courseData.instructorId,
      // Use association values or defaults for required fields
      programId: courseData.association?.programId || '',
      subjectId: courseData.association?.subjectId || '',
      year: courseData.association?.yearOrSemester || 1,
      medium: 'English', // Default medium
      collegeId: courseData.association?.collegeId || '',
      // Publication status
      status: courseData.status || 'draft',
      isPublished: courseData.isPublished || false,
      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: courseData.instructorId,
      // Include image fields if provided
      ...(courseData.image && { image: courseData.image }),
      ...(courseData.imageFileName && { imageFileName: courseData.imageFileName }),
      ...(courseData.imageStoragePath && { imageStoragePath: courseData.imageStoragePath }),
      ...(courseData.thumbnailUrl && { thumbnailUrl: courseData.thumbnailUrl })
    }

    // Initialize course repository and create course
    const courseRepo = new CourseRepository()
    const createdCourse = await courseRepo.createCourse(newCourse)

    return NextResponse.json({
      success: true,
      course: createdCourse,
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
