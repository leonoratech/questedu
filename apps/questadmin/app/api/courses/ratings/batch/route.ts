import { serverDb } from '@/app/api/firebase-server'
import {
    requireAuth
} from '@/lib/server-auth'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/courses/ratings/batch
 * Get rating data for multiple courses
 */
export async function POST(request: NextRequest) {
  // Require authentication
  const authResult = await requireAuth()(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  const { user } = authResult

  try {
    // Parse request body
    const body = await request.json()
    const { courseIds } = body

    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      return NextResponse.json(
        { error: 'courseIds must be a non-empty array' },
        { status: 400 }
      )
    }

    if (courseIds.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 course IDs allowed per request' },
        { status: 400 }
      )
    }

    const ratings: Record<string, { rating: number; ratingCount: number }> = {}
    
    // Load ratings in batches of 10 (Firestore limit for 'in' queries)
    const batchSize = 10
    for (let i = 0; i < courseIds.length; i += batchSize) {
      const batch = courseIds.slice(i, i + batchSize)
      const coursesRef = collection(serverDb, 'courses')
      const q = query(coursesRef, where('__name__', 'in', batch))
      
      const querySnapshot = await getDocs(q)
      querySnapshot.docs.forEach(doc => {
        const data = doc.data()
        ratings[doc.id] = {
          rating: data.rating || 0,
          ratingCount: data.ratingCount || 0
        }
      })
    }
    
    // Fill in any missing courses with default values
    courseIds.forEach((id: string) => {
      if (!ratings[id]) {
        ratings[id] = { rating: 0, ratingCount: 0 }
      }
    })

    return NextResponse.json({
      success: true,
      ratings
    })
  } catch (error) {
    console.error('Error fetching course ratings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course ratings' },
      { status: 500 }
    )
  }
}
