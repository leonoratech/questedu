import { serverDb, UserRole } from '@/app/api/firebase-server'
import {
    isMultilingualContent
} from '@/lib/multilingual-utils'
import { requireAuth } from '@/lib/server-auth'
import {
    doc,
    getDoc,
    serverTimestamp,
    updateDoc
} from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'

// API endpoint for updating multilingual content
export async function PATCH(
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
    
    // Validate that course exists and user has permission
    const courseRef = doc(serverDb, 'courses', courseId)
    const courseSnap = await getDoc(courseRef)
    
    if (!courseSnap.exists()) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }
    
    const courseData = courseSnap.data()
    
    // Check permissions - admin or course instructor
    if (user.role !== UserRole.ADMIN && courseData.instructorId !== user.uid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    // Process multilingual updates
    const updates: Record<string, any> = {
      updatedAt: serverTimestamp()
    }
    
    // Handle multilingual title updates
    if (body.title) {
      if (typeof body.title === 'string') {
        // Legacy single language update
        updates.title = body.title
      } else if (isMultilingualContent(body.title)) {
        // Multilingual update
        updates.title = body.title
      }
    }
    
    // Handle multilingual description updates
    if (body.description) {
      if (typeof body.description === 'string') {
        updates.description = body.description
      } else if (isMultilingualContent(body.description)) {
        updates.description = body.description
      }
    }
    
    // Handle multilingual arrays
    if (body.whatYouWillLearn) {
      if (Array.isArray(body.whatYouWillLearn)) {
        updates.whatYouWillLearn = body.whatYouWillLearn
      } else {
        updates.whatYouWillLearn = body.whatYouWillLearn
      }
    }
    
    if (body.prerequisites) {
      if (Array.isArray(body.prerequisites)) {
        updates.prerequisites = body.prerequisites
      } else {
        updates.prerequisites = body.prerequisites
      }
    }
    
    if (body.tags) {
      if (Array.isArray(body.tags)) {
        updates.tags = body.tags
      } else {
        updates.tags = body.tags
      }
    }
    
    // Update the course
    await updateDoc(courseRef, updates)
    
    // Return updated course data
    const updatedCourseSnap = await getDoc(courseRef)
    const updatedCourse = {
      id: updatedCourseSnap.id,
      ...updatedCourseSnap.data()
    }
    
    return NextResponse.json({
      success: true,
      course: updatedCourse
    })
    
  } catch (error) {
    console.error('Error updating multilingual course content:', error)
    return NextResponse.json(
      { error: 'Failed to update course content' },
      { status: 500 }
    )
  }
}

// API endpoint for getting multilingual content analysis
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
    if (user.role !== UserRole.ADMIN && courseData.instructorId !== user.uid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    // Analyze multilingual content
    const analysis = {
      courseId,
      isMultilingual: false,
      availableLanguages: ['en'] as string[],
      contentAnalysis: {
        title: {
          isMultilingual: isMultilingualContent(courseData.title),
          availableLanguages: isMultilingualContent(courseData.title) 
            ? Object.keys(courseData.title) 
            : ['en']
        },
        description: {
          isMultilingual: isMultilingualContent(courseData.description),
          availableLanguages: isMultilingualContent(courseData.description) 
            ? Object.keys(courseData.description) 
            : ['en']
        },
        whatYouWillLearn: {
          isMultilingual: isMultilingualContent(courseData.whatYouWillLearn),
          availableLanguages: isMultilingualContent(courseData.whatYouWillLearn) 
            ? Object.keys(courseData.whatYouWillLearn) 
            : ['en']
        },
        prerequisites: {
          isMultilingual: isMultilingualContent(courseData.prerequisites),
          availableLanguages: isMultilingualContent(courseData.prerequisites) 
            ? Object.keys(courseData.prerequisites) 
            : ['en']
        },
        tags: {
          isMultilingual: isMultilingualContent(courseData.tags),
          availableLanguages: isMultilingualContent(courseData.tags) 
            ? Object.keys(courseData.tags) 
            : ['en']
        }
      }
    }
    
    // Determine overall available languages
    const allLanguages = new Set<string>(['en'])
    Object.values(analysis.contentAnalysis).forEach(content => {
      content.availableLanguages.forEach(lang => allLanguages.add(lang))
    })
    
    analysis.availableLanguages = Array.from(allLanguages)
    analysis.isMultilingual = analysis.availableLanguages.length > 1
    
    return NextResponse.json({
      success: true,
      analysis
    })
    
  } catch (error) {
    console.error('Error analyzing multilingual course content:', error)
    return NextResponse.json(
      { error: 'Failed to analyze course content' },
      { status: 500 }
    )
  }
}
