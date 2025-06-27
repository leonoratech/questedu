import { CourseTopicRepository } from '@/data/repository/course-topic-service'
import { CreateTopicSchema, validateRequestBody } from '@/data/validation/validation-schemas'
import { requireAuth, requireCourseAccess } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'

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
    
    const courseTopicRepository = new CourseTopicRepository()
    const topics = await courseTopicRepository.getTopicsByCourse(courseId)

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

    const courseTopicRepository = new CourseTopicRepository()
    const topicId = await courseTopicRepository.createCourseTopic(topicData, courseId)
    
    // Get the created topic
    const createdTopic = await courseTopicRepository.getById(topicId)

    return NextResponse.json({
      success: true,
      topic: createdTopic,
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
