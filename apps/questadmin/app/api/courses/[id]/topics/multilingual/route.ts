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

// Get multilingual topics for a course
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
    
    // Get topics
    const topicsQuery = query(
      collection(serverDb, 'courseTopics'),
      where('courseId', '==', courseId),
      orderBy('order', 'asc')
    )
     const topicsSnap = await getDocs(topicsQuery)
    const topics = topicsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Array<{ id: string } & Record<string, any>>

    // Analyze multilingual content for each topic
    const topicsWithAnalysis = topics.map(topic => ({
      ...topic,
      multilingualAnalysis: {
        title: {
          isMultilingual: isMultilingualContent(topic.title),
          availableLanguages: isMultilingualContent(topic.title) 
            ? Object.keys(topic.title) 
            : ['en']
        },
        description: {
          isMultilingual: isMultilingualContent(topic.description),
          availableLanguages: isMultilingualContent(topic.description) 
            ? Object.keys(topic.description) 
            : ['en']
        },
        learningObjectives: {
          isMultilingual: isMultilingualContent(topic.learningObjectives),
          availableLanguages: isMultilingualContent(topic.learningObjectives) 
            ? Object.keys(topic.learningObjectives) 
            : ['en']
        }
      }
    }))
    
    return NextResponse.json({
      success: true,
      topics: topicsWithAnalysis
    })
    
  } catch (error) {
    console.error('Error fetching multilingual topics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    )
  }
}

// Create a new multilingual topic
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
    
    // Prepare topic data
    const topicData = {
      courseId,
      title: body.title,
      description: body.description || '',
      order: body.order || 1,
      duration: body.duration || 0,
      videoUrl: body.videoUrl || '',
      materials: body.materials || [],
      isPublished: body.isPublished || false,
      prerequisites: body.prerequisites || [],
      learningObjectives: body.learningObjectives || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    // Create topic
    const topicRef = await addDoc(collection(serverDb, 'courseTopics'), topicData)
    
    // Get created topic
    const createdTopicSnap = await getDoc(topicRef)
    const createdTopic = {
      id: createdTopicSnap.id,
      ...createdTopicSnap.data()
    }
    
    return NextResponse.json({
      success: true,
      topic: createdTopic
    })
    
  } catch (error) {
    console.error('Error creating multilingual topic:', error)
    return NextResponse.json(
      { error: 'Failed to create topic' },
      { status: 500 }
    )
  }
}
