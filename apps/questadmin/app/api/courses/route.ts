import {
    addDoc,
    collection,
    getDoc,
    getDocs,
    orderBy,
    query,
    QueryConstraint,
    serverTimestamp,
    where
} from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { serverDb } from '../firebase-server'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const instructorId = url.searchParams.get('instructorId')
    const search = url.searchParams.get('search')
    const limit = url.searchParams.get('limit')
    
    console.log('Fetching courses with instructorId:', instructorId)
    
    let constraints: QueryConstraint[] = []
    
    // Add filters first
    if (instructorId) {
      constraints.push(where('instructorId', '==', instructorId))
    }
    
    if (search) {
      // Note: Firestore doesn't support full-text search well
      // You might want to implement this with a search service like Algolia
      constraints.push(where('title', '>=', search))
      constraints.push(where('title', '<=', search + '\uf8ff'))
    }
    
    // Add ordering last (only if not filtering by instructorId to avoid index requirement)
    if (!instructorId) {
      constraints.push(orderBy('createdAt', 'desc'))
    }
    
    const coursesQuery = query(collection(serverDb, 'courses'), ...constraints)
    const snapshot = await getDocs(coursesQuery)
    
    let courses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    // Sort in memory when filtering by instructor to avoid index requirement
    if (instructorId) {
      courses = courses.sort((a: any, b: any) => {
        const aTime = a.createdAt?.toMillis?.() || 0
        const bTime = b.createdAt?.toMillis?.() || 0
        return bTime - aTime
      })
    }

    console.log(`Found ${courses.length} courses for instructorId: ${instructorId}`)

    return NextResponse.json({
      success: true,
      courses
    })

  } catch (error: any) {
    console.error('Get courses error:', error)
    return NextResponse.json(
      { error: 'An error occurred fetching courses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const courseData = await request.json()
    
    // Validate required fields
    if (!courseData.title || !courseData.instructorId) {
      return NextResponse.json(
        { error: 'Title and instructor ID are required' },
        { status: 400 }
      )
    }

    const newCourse = {
      ...courseData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: courseData.status || (courseData.isPublished ? 'published' : 'draft'),
      isPublished: courseData.status === 'published' || courseData.isPublished || false,
      enrollmentCount: 0
    }

    const docRef = await addDoc(collection(serverDb, 'courses'), newCourse)
    
    // Get the created course with server timestamp
    const createdCourse = await getDoc(docRef)

    return NextResponse.json({
      success: true,
      course: {
        id: docRef.id,
        ...createdCourse.data()
      },
      message: 'Course created successfully'
    })

  } catch (error: any) {
    console.error('Create course error:', error)
    return NextResponse.json(
      { error: 'An error occurred creating the course' },
      { status: 500 }
    )
  }
}
