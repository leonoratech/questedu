import { CreateTopicSchema, validateRequestBody } from '@/data/validation/validation-schemas'
import { requireAuth, requireCourseAccess } from '@/lib/server-auth'
import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { serverDb } from '../../../firebase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require authentication for viewing course topics
  const authResult = await requireAuth()(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }
  try {
    const { id: courseId } = await params
    
    const topicsRef = collection(serverDb, 'courseTopics')
    const q = query(
      topicsRef,
      where('courseId', '==', courseId)
    )
    
    const snapshot = await getDocs(q)
    const topics = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    // Sort topics by order in memory to avoid Firestore index requirement
    topics.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))

    return NextResponse.json({
      success: true,
      topics
    })

  } catch (error: any) {
    console.error('Get course topics error:', error)
    return NextResponse.json(
      { error: 'An error occurred fetching course topics' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: courseId } = await params
  
  // Require course access for creating topics
  const authResult = await requireCourseAccess(courseId)(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  try {
    // Validate request body
    const requestBody = await request.json()
    const validation = validateRequestBody(CreateTopicSchema, requestBody)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }
    
    const topicData = validation.data
    
    // Validate required fields (additional check)
    if (!topicData.title) {
      return NextResponse.json(
        { error: 'Topic title is required' },
        { status: 400 }
      )
    }

    const newTopic = {
      ...topicData,
      courseId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isPublished: topicData.isPublished || false,
      order: topicData.order || 1
    }

    const docRef = await addDoc(collection(serverDb, 'courseTopics'), newTopic)

    return NextResponse.json({
      success: true,
      topic: {
        id: docRef.id,
        ...newTopic
      },
      message: 'Course topic created successfully'
    })

  } catch (error: any) {
    console.error('Create course topic error:', error)
    return NextResponse.json(
      { error: 'An error occurred creating the course topic' },
      { status: 500 }
    )
  }
}
