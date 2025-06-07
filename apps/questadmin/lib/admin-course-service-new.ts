// filepath: /home/solmon/github/questedu/apps/questadmin/lib/admin-course-service.ts
// HTTP-based course service using Next.js API routes

import { UserRole } from './firebase-auth'

// Course interface for admin app
export interface AdminCourse {
  id?: string
  title: string
  description: string
  instructor: string
  category: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  price: number
  duration: string
  status: 'draft' | 'published' | 'archived'
  rating?: number
  enrollmentCount?: number
  createdAt?: Date
  updatedAt?: Date
  instructorId: string
}

// Course creation data (without system fields)
export interface CreateCourseData {
  title: string
  description: string
  instructor: string
  category: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  price: number
  duration: string
  instructorId: string
}

// Course creation data with status
export interface CreateCourseFormData {
  title: string
  description: string
  instructor: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  price: number
  status: 'draft' | 'published'
  instructorId: string
  duration: string
}

// API response interface
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  course?: AdminCourse
  courses?: AdminCourse[]
  error?: string
  message?: string
}

// Get all courses
export const getAllCourses = async (): Promise<AdminCourse[]> => {
  try {
    const response = await fetch('/api/courses')
    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to fetch courses:', data.error)
      return []
    }

    return data.courses || []
  } catch (error) {
    console.error('Error fetching courses:', error)
    return []
  }
}

// Get courses by instructor
export const getCoursesByInstructor = async (instructorId: string): Promise<AdminCourse[]> => {
  try {
    const response = await fetch(`/api/courses?instructorId=${instructorId}`)
    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to fetch instructor courses:', data.error)
      return []
    }

    return data.courses || []
  } catch (error) {
    console.error('Error fetching instructor courses:', error)
    return []
  }
}

// Add a new course
export const addCourse = async (courseData: CreateCourseData): Promise<string | null> => {
  try {
    const response = await fetch('/api/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(courseData),
    })

    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to create course:', data.error)
      return null
    }

    return data.course?.id || null
  } catch (error) {
    console.error('Error creating course:', error)
    return null
  }
}

// Update an existing course
export const updateCourse = async (courseId: string, updates: Partial<AdminCourse>): Promise<boolean> => {
  try {
    const response = await fetch(`/api/courses/${courseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })

    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to update course:', data.error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating course:', error)
    return false
  }
}

// Delete a course
export const deleteCourse = async (courseId: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/courses/${courseId}`, {
      method: 'DELETE',
    })

    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to delete course:', data.error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting course:', error)
    return false
  }
}

// Get single course by ID
export const getCourseById = async (courseId: string): Promise<AdminCourse | null> => {
  try {
    const response = await fetch(`/api/courses/${courseId}`)
    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to fetch course:', data.error)
      return null
    }

    return data.course || null
  } catch (error) {
    console.error('Error fetching course:', error)
    return null
  }
}

// Search courses
export const searchCourses = async (searchTerm: string): Promise<AdminCourse[]> => {
  try {
    const response = await fetch(`/api/courses?search=${encodeURIComponent(searchTerm)}`)
    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to search courses:', data.error)
      return []
    }

    return data.courses || []
  } catch (error) {
    console.error('Error searching courses:', error)
    return []
  }
}

// Role-based access control helpers
export const canUserManageCourse = (userRole: UserRole, courseInstructorId: string, userId: string): boolean => {
  if (userRole === UserRole.ADMIN) return true
  if (userRole === UserRole.INSTRUCTOR && courseInstructorId === userId) return true
  return false
}

export const canUserViewAllCourses = (userRole: UserRole): boolean => {
  return userRole === UserRole.ADMIN
}

export const canUserCreateCourse = (userRole: UserRole): boolean => {
  return userRole === UserRole.ADMIN || userRole === UserRole.INSTRUCTOR
}
