import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, where } from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { serverDb } from '../../../firebase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params
    
    const topicsRef = collection(serverDb, 'course_topics')
    const q = query(
      topicsRef,
      where('courseId', '==', courseId),
      orderBy('order', 'asc')
    )
    
    const snapshot = await getDocs(q)
    const topics = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

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
  try {
    const { id: courseId } = await params
    const topicData = await request.json()
    
    // Validate required fields
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

    const docRef = await addDoc(collection(serverDb, 'course_topics'), newTopic)

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
