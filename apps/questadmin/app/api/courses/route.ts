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
    
    let constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')]
    
    if (instructorId) {
      constraints.unshift(where('instructorId', '==', instructorId))
    }
    
    if (search) {
      // Note: Firestore doesn't support full-text search well
      // You might want to implement this with a search service like Algolia
      constraints.unshift(where('title', '>=', search))
      constraints.unshift(where('title', '<=', search + '\uf8ff'))
    }
    
    const coursesQuery = query(collection(serverDb, 'courses'), ...constraints)
    const snapshot = await getDocs(coursesQuery)
    
    const courses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

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
      isPublished: courseData.isPublished || false,
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
