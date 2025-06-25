import {
    CreateCourseQuestionSchema,
    validateRequestBody
} from '@/data/validation/validation-schemas'
import { requireAuth, requireCourseAccess } from '@/lib/server-auth'
import {
    createCourseQuestionServer,
    getCourseQuestionsByTopicServer,
    getCourseQuestionsServer
} from '@/lib/server-course-questions-service'
import { NextRequest, NextResponse } from 'next/server'
import { UserRole } from '../../../firebase-server'

/**
 * GET /api/courses/[id]/questions
 * Get all questions for a course
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require authentication
  const authResult = await requireAuth()(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  const { user } = authResult
  const { id: courseId } = await params

  // Check course access
  const courseAccessResult = await requireCourseAccess(courseId)(request)
  
  if ('error' in courseAccessResult) {
    return NextResponse.json(
      { error: courseAccessResult.error },
      { status: courseAccessResult.status }
    )
  }

  try {
    const url = new URL(request.url)
    const topicId = url.searchParams.get('topicId')

    let questions
    if (topicId) {
      questions = await getCourseQuestionsByTopicServer(courseId, topicId)
    } else {
      questions = await getCourseQuestionsServer(courseId)
    }

    return NextResponse.json({
      success: true,
      questions: questions
    })
  } catch (error) {
    console.error('Error fetching course questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course questions' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/courses/[id]/questions
 * Create a new question for a course
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require authentication
  const authResult = await requireAuth()(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  const { user } = authResult
  const { id: courseId } = await params

  // Only instructors and superadmins can create questions
  if (user.role !== UserRole.INSTRUCTOR && user.role !== UserRole.SUPERADMIN) {
    return NextResponse.json(
      { error: 'Access denied. Only instructors can create questions.' },
      { status: 403 }
    )
  }

  // Check course access
  const courseAccessResult = await requireCourseAccess(courseId)(request)
  
  if ('error' in courseAccessResult) {
    return NextResponse.json(
      { error: courseAccessResult.error },
      { status: courseAccessResult.status }
    )
  }

  try {
    // Parse request body
    const body = await request.json()
    
    // Validate request body
    const validation = validateRequestBody(CreateCourseQuestionSchema, {
      ...body,
      courseId, // Ensure courseId matches route parameter
      createdBy: user.uid // Add createdBy field
    })
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error },
        { status: 400 }
      )
    }

    const validatedData = validation.data
    
    // Transform and ensure required fields for CreateCourseQuestionData
    const questionData = {
      ...validatedData,
      difficulty: validatedData.difficulty || 'medium' as const,
      marks: validatedData.marks || 1,
      tags: validatedData.tags || [],
      flags: validatedData.flags || {
        important: false,
        frequently_asked: false,
        practical: false,
        conceptual: false
      },
      isPublished: validatedData.isPublished || false,
      order: validatedData.order || 0
    }

    // Create the question
    const questionId = await createCourseQuestionServer(questionData, user.uid)

    return NextResponse.json({
      success: true,
      questionId,
      message: 'Question created successfully'
    })
  } catch (error) {
    console.error('Error creating course question:', error)
    return NextResponse.json(
      { error: 'Failed to create course question' },
      { status: 500 }
    )
  }
}