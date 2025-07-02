import { QuestionRepository } from '@/data/repository/question-service'
import {
  UpdateCourseQuestionSchema,
  validateRequestBody
} from '@/data/validation/validation-schemas'
import { requireAuth, requireCourseAccess } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'
import { UserRole } from '../../../../firebase-server'

/**
 * GET /api/courses/[id]/questions/[questionId]
 * Get a specific question
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
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
  const { id: courseId, questionId } = await params

  // Check course access
  const courseAccessResult = await requireCourseAccess(courseId)(request)
  
  if ('error' in courseAccessResult) {
    return NextResponse.json(
      { error: courseAccessResult.error },
      { status: courseAccessResult.status }
    )
  }

  try {
    const questionRepository = new QuestionRepository()
    const question = await questionRepository.getById(questionId)

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    // Verify the question belongs to the course
    if (question.courseId !== courseId) {
      return NextResponse.json(
        { error: 'Question does not belong to this course' },
        { status: 403 }
      )
    }

    // Transform Question to CourseQuestion format for frontend compatibility
    const transformedQuestion = {
      id: question.id,
      courseId: question.courseId,
      topicId: question.topicId,
      question: question.questionText,
      questionRichText: question.questionRichText,
      type: question.questionType, // Map questionType to type
      marks: question.marks,
      difficulty: question.difficulty,
      options: question.options ? question.options.map(opt => typeof opt === 'string' ? opt : opt.text) : undefined,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      explanationRichText: question.explanationRichText,
      tags: question.tags,
      flags: question.flags,
      isPublished: question.isPublished,
      order: question.order,
      createdBy: question.createdBy,
      category: undefined, // This field doesn't exist in Question model
      createdAt: question.createdAt,
      updatedAt: question.updatedAt
    }

    return NextResponse.json({
      success: true,
      question: transformedQuestion
    })
  } catch (error) {
    console.error('Error fetching course question:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course question' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/courses/[id]/questions/[questionId]
 * Update a specific question
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
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
  const { id: courseId, questionId } = await params

  // Only instructors and superadmins can update questions
  if (user.role !== UserRole.INSTRUCTOR && user.role !== UserRole.SUPERADMIN) {
    return NextResponse.json(
      { error: 'Access denied. Only instructors can update questions.' },
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
    const validation = validateRequestBody(UpdateCourseQuestionSchema, body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error },
        { status: 400 }
      )
    }

    const questionData = validation.data

    // Transform frontend data to repository format
    const updateData = {
      questionText: questionData.question,
      questionRichText: questionData.questionRichText,
      questionType: questionData.type, // Map type to questionType
      marks: questionData.marks,
      difficulty: questionData.difficulty,
      options: questionData.options?.map((option: string) => ({
        text: option,
        isCorrect: false,
      })),
      correctAnswer: Array.isArray(questionData.correctAnswer) 
        ? questionData.correctAnswer.join(', ') 
        : questionData.correctAnswer,
      explanation: questionData.explanation,
      explanationRichText: questionData.explanationRichText,
      tags: questionData.tags,
      flags: questionData.flags,
      isPublished: questionData.isPublished,
      order: questionData.order,
      topicId: questionData.topicId
    }

    // Update the question
    const questionRepository = new QuestionRepository()
    await questionRepository.updateQuestion(questionId, updateData)

    return NextResponse.json({
      success: true,
      message: 'Question updated successfully'
    })
  } catch (error) {
    console.error('Error updating course question:', error)
    return NextResponse.json(
      { error: 'Failed to update course question' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/courses/[id]/questions/[questionId]
 * Delete a specific question
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
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
  const { id: courseId, questionId } = await params

  // Only instructors and superadmins can delete questions
  if (user.role !== UserRole.INSTRUCTOR && user.role !== UserRole.SUPERADMIN) {
    return NextResponse.json(
      { error: 'Access denied. Only instructors can delete questions.' },
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
    // Verify the question exists and belongs to the course
    const questionRepository = new QuestionRepository()
    const question = await questionRepository.getById(questionId)
    
    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    if (question.courseId !== courseId) {
      return NextResponse.json(
        { error: 'Question does not belong to this course' },
        { status: 403 }
      )
    }

    // Delete the question
    await questionRepository.deleteQuestion(questionId)

    return NextResponse.json({
      success: true,
      message: 'Question deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting course question:', error)
    return NextResponse.json(
      { error: 'Failed to delete course question' },
      { status: 500 }
    )
  }
}