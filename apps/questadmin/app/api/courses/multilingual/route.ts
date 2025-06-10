import { CreateCourseSchema, validateRequestBody } from '@/data/validation/validation-schemas'
import { requireAuth } from '@/lib/server-auth'
import {
    addDoc,
    collection,
    getDoc,
    serverTimestamp
} from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { serverDb, UserRole } from '../../firebase-server'

/**
 * Enhanced course creation API that supports multilingual content and language configuration
 */
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
    // Validate request body with enhanced schema that supports language configuration
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
    
    // Validate required fields
    if (!courseData.title || !courseData.instructorId) {
      return NextResponse.json(
        { error: 'Title and instructor ID are required' },
        { status: 400 }
      )
    }

    // Set default language configuration if not provided
    const languageConfig = {
      primaryLanguage: courseData.primaryLanguage || 'en',
      supportedLanguages: courseData.supportedLanguages || ['en'],
      enableTranslation: courseData.enableTranslation || false
    }

    // Prepare the course document with enhanced multilingual support
    const newCourse = {
      // Basic course fields
      ...courseData,
      
      // Language configuration
      ...languageConfig,
      
      // System fields
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: courseData.status || 'draft',
      isPublished: courseData.status === 'published' || false,
      enrollmentCount: 0,
      
      // Default values for missing fields
      rating: 0,
      ratingCount: 0,
      completionCount: 0,
      tags: courseData.multilingualTags?.[languageConfig.primaryLanguage] || [],
      skills: courseData.multilingualSkills?.[languageConfig.primaryLanguage] || [],
      prerequisites: courseData.multilingualPrerequisites?.[languageConfig.primaryLanguage] || [],
      whatYouWillLearn: courseData.multilingualWhatYouWillLearn?.[languageConfig.primaryLanguage] || [],
      targetAudience: courseData.multilingualTargetAudience?.[languageConfig.primaryLanguage] || [],
      
      // Legacy language field for backward compatibility
      language: languageConfig.primaryLanguage,
      subtitles: languageConfig.supportedLanguages,
      
      // Default course features
      certificates: true,
      lifetimeAccess: true,
      mobileAccess: true,
      downloadableResources: true,
      assignmentsCount: 0,
      articlesCount: 0,
      videosCount: 0,
      totalVideoLength: 0,
      currency: 'USD',
      featured: false
    }

    console.log('Creating multilingual course with data:', {
      title: newCourse.title,
      primaryLanguage: newCourse.primaryLanguage,
      supportedLanguages: newCourse.supportedLanguages,
      enableTranslation: newCourse.enableTranslation
    })

    const docRef = await addDoc(collection(serverDb, 'courses'), newCourse)
    
    // Get the created course with server timestamp
    const createdCourse = await getDoc(docRef)

    return NextResponse.json({
      success: true,
      course: {
        id: docRef.id,
        ...createdCourse.data()
      },
      message: 'Multilingual course created successfully'
    })

  } catch (error: any) {
    console.error('Create multilingual course error:', error)
    return NextResponse.json(
      { error: 'An error occurred creating the multilingual course' },
      { status: 500 }
    )
  }
}
