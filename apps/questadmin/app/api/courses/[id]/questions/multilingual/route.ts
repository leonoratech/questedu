import { serverDb, UserRole } from '@/app/api/firebase-server'
import {
    isMultilingualContent
} from '@/lib/multilingual-utils'
import { requireAuth } from '@/lib/server-auth'
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    where
} from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'

// Get multilingual questions for a course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: courseId } = await params
  const authResult = await requireAuth()(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  const { user } = authResult
  
  try {
    // Validate course exists and user has permission
    const courseRef = doc(serverDb, 'courses', courseId)
    const courseSnap = await getDoc(courseRef)
    
    if (!courseSnap.exists()) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }
    
    const courseData = courseSnap.data()
    
    // Check permissions
    if (user.role !== UserRole.INSTRUCTOR && courseData.instructorId !== user.uid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
     // Get questions
    const questionsQuery = query(
      collection(serverDb, 'course_questions'),
      where('courseId', '==', courseId),
      orderBy('order', 'asc')
    )

    const questionsSnap = await getDocs(questionsQuery)
    const questions = questionsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Array<{ id: string } & Record<string, any>>

    // Analyze multilingual content for each question
    const questionsWithAnalysis = questions.map(question => ({
      ...question,
      multilingualAnalysis: {
        question: {
          isMultilingual: isMultilingualContent(question.question),
          availableLanguages: isMultilingualContent(question.question)
            ? Object.keys(question.question)
            : ['en']
        },
        explanation: {
          isMultilingual: isMultilingualContent(question.explanation),
          availableLanguages: isMultilingualContent(question.explanation)
            ? Object.keys(question.explanation)
            : ['en']
        },
        options: {
          isMultilingual: isMultilingualContent(question.options),
          availableLanguages: isMultilingualContent(question.options)
            ? Object.keys(question.options)
            : ['en']
        },
        correctAnswer: {
          isMultilingual: isMultilingualContent(question.correctAnswer),
          availableLanguages: isMultilingualContent(question.correctAnswer)
            ? Object.keys(question.correctAnswer)
            : ['en']
        },
        tags: {
          isMultilingual: isMultilingualContent(question.tags),
          availableLanguages: isMultilingualContent(question.tags)
            ? Object.keys(question.tags)
            : ['en']
        }
      }
    }))
    
    return NextResponse.json({
      success: true,
      questions: questionsWithAnalysis
    })
    
  } catch (error) {
    console.error('Error fetching multilingual questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

// Create a new multilingual question
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: courseId } = await params
  const authResult = await requireAuth()(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  const { user } = authResult
  
  try {
    const body = await request.json()
    
    // Validate course exists and user has permission
    const courseRef = doc(serverDb, 'courses', courseId)
    const courseSnap = await getDoc(courseRef)
    
    if (!courseSnap.exists()) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }
    
    const courseData = courseSnap.data()
    
    // Check permissions
    if (user.role !== UserRole.INSTRUCTOR && courseData.instructorId !== user.uid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    // Prepare question data with multilingual support
    const questionData = {
      courseId,
      topicId: body.topicId || null,
      question: body.question,
      questionRichText: body.questionRichText || '',
      type: body.type,
      marks: body.marks || 1,
      difficulty: body.difficulty || 'easy',
      options: body.options || [],
      correctAnswer: body.correctAnswer || '',
      explanation: body.explanation || '',
      explanationRichText: body.explanationRichText || '',
      tags: body.tags || [],
      flags: body.flags || {
        important: false,
        frequently_asked: false,
        practical: false,
        conceptual: false
      },
      category: body.category || '',
      isPublished: body.isPublished !== undefined ? body.isPublished : true,
      order: body.order || 1,
      createdBy: user.uid,
      lastModifiedBy: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    // Create question
    const questionRef = await addDoc(collection(serverDb, 'course_questions'), questionData)
    
    // Get created question
    const createdQuestionSnap = await getDoc(questionRef)
    const createdQuestion = {
      id: createdQuestionSnap.id,
      ...createdQuestionSnap.data()
    }
    
    return NextResponse.json({
      success: true,
      question: createdQuestion
    })
    
  } catch (error) {
    console.error('Error creating multilingual question:', error)
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    )
  }
}
