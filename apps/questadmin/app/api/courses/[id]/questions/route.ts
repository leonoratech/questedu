import { QuestionRepository } from '@/data/repository/question-service'
import {
  CreateCourseQuestionSchema,
  validateRequestBody
} from '@/data/validation/validation-schemas'
import { requireAuth, requireCourseAccess } from '@/lib/server-auth'
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

    const questionRepository = new QuestionRepository()
    let questions

    if (topicId) {
      questions = await questionRepository.getQuestionsByTopicAndCourse(courseId, topicId)
    } else {
      questions = await questionRepository.getQuestionsByCourse(courseId)
    }

    // Transform each question to match frontend expectations (see [id]/questions/[questionId]/route.ts)
    const transformedQuestions = questions.map((question: any) => ({
      id: question.id,
      courseId: question.courseId,
      topicId: question.topicId,
      question: question.questionText,
      questionRichText: question.questionRichText,
      type: question.questionType, // Map questionType to type
      marks: question.marks,
      difficulty: question.difficulty,
      options: question.options ? question.options.map((opt: any) => typeof opt === 'string' ? opt : opt.text) : undefined,
      correctAnswer: question.correctAnswer,
      correctAnswerRichText: question.correctAnswerRichText,
      explanation: question.explanation,
      // explanationRichText: question.explanationRichText,
      tags: question.tags,
      flags: question.flags,
      isPublished: question.isPublished,
      order: question.order,
      createdBy: question.createdBy,
      category: undefined, // This field doesn't exist in Question model
      createdAt: question.createdAt,
      updatedAt: question.updatedAt
    }))

    return NextResponse.json({
      success: true,
      questions: transformedQuestions
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
    
    // Map question types from validation schema to our model
    const mapQuestionType = (type: string) => {
      // Keep the types consistent with frontend
      return type as 'multiple_choice' | 'true_false' | 'fill_blank' | 'short_essay' | 'long_essay'
    }

    // Transform and ensure required fields for CreateCourseQuestionData
    const questionData = {
      courseId,
      questionText: validatedData.question || '',
      questionRichText: validatedData.questionRichText || '',
      questionType: mapQuestionType(validatedData.type),
      options: validatedData.options?.map((option: string) => ({
        text: option,
        isCorrect: false,
        // explanation: undefined
      })),
      correctAnswer: Array.isArray(validatedData.correctAnswer) 
        ? validatedData.correctAnswer.join(', ') 
        : validatedData.correctAnswer,
      correctAnswerRichText: validatedData.correctAnswerRichText || '',
      explanation: validatedData.explanation,
      // explanationRichText: validatedData.explanationRichText || '',
      topicId: validatedData.topicId,
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

    const questionRepository = new QuestionRepository()
    
    // Create the question
    const questionId = await questionRepository.createQuestion(questionData, user.uid)

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