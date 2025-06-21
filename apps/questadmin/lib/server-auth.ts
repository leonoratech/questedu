// Server-side authentication utilities for API routes
import { doc, getDoc } from 'firebase/firestore'
import { NextRequest } from 'next/server'
import { serverDb, UserRole } from '../app/api/firebase-server'
import { extractTokenFromHeader, verifyJWTToken } from './jwt-utils'

export interface AuthenticatedUser {
  uid: string
  email: string
  firstName: string
  lastName: string
  displayName: string | null
  role: UserRole
  isActive: boolean
}

/**
 * Extract user information from JWT token in Authorization header
 */
export async function getCurrentUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // Extract JWT token from Authorization header
    const authHeader = request.headers.get('Authorization')
    const token = extractTokenFromHeader(authHeader)
    
    if (!token) {
      return null
    }

    // Verify and decode JWT token
    const payload = verifyJWTToken(token)
    
    if (!payload) {
      return null
    }

    // Validate user is still active in database (optional security check)
    const userRef = doc(serverDb, 'users', payload.uid)
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) {
      return null
    }

    const userData = userSnap.data()
    
    // Check if user is still active
    if (!userData.isActive) {
      return null
    }

    // Return user information from JWT payload
    return {
      uid: payload.uid,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      displayName: payload.displayName,
      role: payload.role as UserRole,
      isActive: payload.isActive
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Check if user has permission to edit a course
 */
export async function canEditCourse(user: AuthenticatedUser, courseId: string): Promise<boolean> {
  try {
    // Superadmins can edit any course
    if (user.role === UserRole.SUPERADMIN) {
      return true
    }

    // Only instructors can edit courses
    if (user.role !== UserRole.INSTRUCTOR) {
      return false
    }

    // Get course data to check ownership
    const courseRef = doc(serverDb, 'courses', courseId)
    const courseSnap = await getDoc(courseRef)
    
    if (!courseSnap.exists()) {
      return false
    }

    const courseData = courseSnap.data()
    
    // Course creator can edit their course
    if (courseData.instructorId === user.uid) {
      return true
    }

    // Instructors can only edit their own courses
    return false
  } catch (error) {
    console.error('Error checking course edit permission:', error)
    return false
  }
}

/**
 * Require authentication middleware
 */
export function requireAuth() {
  return async (request: NextRequest) => {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return {
        error: 'Authentication required',
        status: 401
      }
    }

    if (!user.isActive) {
      return {
        error: 'Account is inactive',
        status: 403
      }
    }

    return { user }
  }
}

/**
 * Require specific role middleware
 */
export function requireRole(requiredRole: UserRole) {
  return async (request: NextRequest) => {
    const authResult = await requireAuth()(request)
    
    if ('error' in authResult) {
      return authResult
    }

    const { user } = authResult
    
    if (user.role !== requiredRole) {
      return {
        error: 'Insufficient permissions',
        status: 403
      }
    }

    return { user }
  }
}

/**
 * Require course ownership or admin role
 */
export function requireCourseAccess(courseId: string) {
  return async (request: NextRequest) => {
    const authResult = await requireAuth()(request)
    
    if ('error' in authResult) {
      return authResult
    }

    const { user } = authResult

    const canEdit = await canEditCourse(user, courseId)
    
    if (!canEdit) {
      return {
        error: 'You do not have permission to edit this course',
        status: 403
      }
    }

    return { user }
  }
}
