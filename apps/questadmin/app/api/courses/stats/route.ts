import { UserRole } from '@/data/config/firebase-auth'
import { requireRole } from '@/lib/server-auth'
import { CourseStats } from '@/types/course'
import { collection, getDocs } from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { serverDb } from '../../firebase-server'

interface CourseData {
  id: string
  status?: string
  enrollmentCount?: number
  rating?: number
  price?: number
  category?: string
  level?: string
  [key: string]: any
}

export async function GET(request: NextRequest) {
  try {
    // Require admin or instructor role to view course statistics
    const authResult = await requireRole(UserRole.INSTRUCTOR)(request)
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    // Get all courses from Firestore
    const coursesSnapshot = await getDocs(collection(serverDb, 'courses'))
    const courses: CourseData[] = coursesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    // Calculate statistics
    const totalCourses = courses.length
    const publishedCourses = courses.filter(course => course.status === 'published').length
    const draftCourses = courses.filter(course => course.status === 'draft').length
    const archivedCourses = courses.filter(course => course.status === 'archived').length

    // Calculate total enrollments (sum of enrollmentCount for all courses)
    const totalEnrollments = courses.reduce((sum, course) => sum + (course.enrollmentCount || 0), 0)

    // Calculate average rating (average of all course ratings)
    const coursesWithRating = courses.filter(course => course.rating && course.rating > 0)
    const averageRating = coursesWithRating.length > 0 
      ? coursesWithRating.reduce((sum, course) => sum + (course.rating || 0), 0) / coursesWithRating.length 
      : 0

    // Calculate total revenue (sum of price * enrollmentCount for all courses)
    const totalRevenue = courses.reduce((sum, course) => {
      return sum + (course.price || 0) * (course.enrollmentCount || 0)
    }, 0)

    // Calculate category counts
    const categoryCounts: Record<string, number> = {}
    courses.forEach(course => {
      if (course.category) {
        categoryCounts[course.category] = (categoryCounts[course.category] || 0) + 1
      }
    })

    // Calculate level counts
    const levelCounts: Record<string, number> = {}
    courses.forEach(course => {
      if (course.level) {
        levelCounts[course.level] = (levelCounts[course.level] || 0) + 1
      }
    })

    const stats: CourseStats = {
      totalCourses,
      publishedCourses,
      draftCourses,
      archivedCourses,
      totalStudents: totalEnrollments, // Map enrollments to students for compatibility
      totalEnrollments,
      averageRating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
      totalRevenue,
      categoryCounts,
      levelCounts
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Error fetching course stats:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch course statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
