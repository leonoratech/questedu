// HTTP-based course service using Next.js API routes

import { getAuthHeaders, UserRole } from '../config/firebase-auth'
import { CourseAssociation } from '../models/course'

// Course interface for admin app
export interface AdminCourse {
  id?: string
  title: string
  description: string
  instructor: string
  categoryId: string
  difficultyId: string
  duration: number // Duration in hours as a number
  status: 'draft' | 'published' | 'archived'
  rating?: number
  enrollmentCount?: number
  createdAt?: Date
  updatedAt?: Date
  instructorId: string
  isPublished?: boolean // For backward compatibility with existing data
  
  // Image and media fields
  image?: string // Main course image URL
  imageFileName?: string // Original filename for storage reference
  imageStoragePath?: string // Firebase Storage path
  thumbnailUrl?: string // Thumbnail version of the image
  
  // Association fields
  association?: CourseAssociation
  
  // Language Configuration Fields
  primaryLanguage?: string // Primary language for the course (e.g., 'en', 'te')
  supportedLanguages?: string[] // All supported languages for this course
  enableTranslation?: boolean // Whether to enable auto-translation features
  
  // Extended fields for rich preview
  whatYouWillLearn?: string[]
  prerequisites?: string[]
  language?: string // Legacy field - use primaryLanguage instead
  subtitles?: string[] // Legacy field - use supportedLanguages instead
  certificates?: boolean
  lifetimeAccess?: boolean
  mobileAccess?: boolean
  downloadableResources?: boolean
  courseImage?: string
  targetAudience?: string[]
  tags?: string[]
  skills?: string[]
  ratingCount?: number
  videosCount?: number
  articlesCount?: number
  assignmentsCount?: number
  
  // Multilingual Content Fields (optional - for future multilingual content)
  multilingualTitle?: Record<string, string> // Language code -> title
  multilingualDescription?: Record<string, string> // Language code -> description
  multilingualTags?: Record<string, string[]> // Language code -> tags array
  multilingualSkills?: Record<string, string[]> // Language code -> skills array
  multilingualPrerequisites?: Record<string, string[]> // Language code -> prerequisites array
  multilingualWhatYouWillLearn?: Record<string, string[]> // Language code -> learning outcomes array
  multilingualTargetAudience?: Record<string, string[]> // Language code -> target audience array
}

// Course Topic interface for admin app
export interface AdminCourseTopic {
  id?: string
  courseId: string
  title: string
  description?: string
  order: number
  duration?: number // in minutes
  videoUrl?: string
  materials?: {
    type: 'pdf' | 'video' | 'audio' | 'document' | 'link'
    title: string
    url: string
    description?: string
  }[]
  isPublished: boolean
  prerequisites?: string[] // topic IDs
  learningObjectives?: string[]
  createdAt?: Date
  updatedAt?: Date
}

// Course creation data (without system fields)
export interface CreateCourseData {
  title: string
  description: string
  instructor: string
  categoryId: string
  subcategory?: string
  difficultyId: string
  duration: number // Duration in hours as a number
  instructorId: string
  status?: 'draft' | 'published'
  
  // Language Configuration Fields
  primaryLanguage?: string // Primary language for the course (e.g., 'en', 'te')
  supportedLanguages?: string[] // All supported languages for this course
  enableTranslation?: boolean // Whether to enable auto-translation features
  
  // Multilingual Content Fields (optional - for future multilingual content)
  multilingualTitle?: Record<string, string> // Language code -> title
  multilingualDescription?: Record<string, string> // Language code -> description
  multilingualTags?: Record<string, string[]> // Language code -> tags array
  multilingualSkills?: Record<string, string[]> // Language code -> skills array
  multilingualPrerequisites?: Record<string, string[]> // Language code -> prerequisites array
  multilingualWhatYouWillLearn?: Record<string, string[]> // Language code -> learning outcomes array
  multilingualTargetAudience?: Record<string, string[]> // Language code -> target audience array
}

// Course Topic creation data
export interface CreateCourseTopicData {
  title: string
  description?: string
  order: number
  duration?: number
  videoUrl?: string
  materials?: {
    type: 'pdf' | 'video' | 'audio' | 'document' | 'link'
    title: string
    url: string
    description?: string
  }[]
  isPublished?: boolean
  prerequisites?: string[]
  learningObjectives?: string[]
}

// Course creation data with status (used for form handling - duration as string for input)
export interface CreateCourseFormData {
  title: string
  description: string
  instructor: string
  categoryId: string
  difficultyId: string
  status: 'draft' | 'published'
  instructorId: string
  duration: string // String for form input, converted to number before API call
}

// API response interface
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  course?: AdminCourse
  courses?: AdminCourse[]
  topic?: AdminCourseTopic
  topics?: AdminCourseTopic[]
  relatedCounts?: any
  deletedItems?: any
  error?: string
  message?: string
}

// Course statistics interface
export interface CourseStats {
  totalCourses: number
  publishedCourses: number
  draftCourses: number
  archivedCourses: number
  totalEnrollments: number
  averageRating: number
  totalRevenue?: number
  categoryCounts?: Record<string, number>
  difficultyCounts?: Record<string, number>
  levelCounts?: Record<string, number>
}

// Transform function to convert Firebase Timestamp to Date
const transformCourseData = (courseData: any): AdminCourse => {
  return {
    ...courseData,
    createdAt: courseData.createdAt && courseData.createdAt.seconds 
      ? new Date(courseData.createdAt.seconds * 1000) 
      : courseData.createdAt 
        ? new Date(courseData.createdAt) 
        : undefined,
    updatedAt: courseData.updatedAt && courseData.updatedAt.seconds 
      ? new Date(courseData.updatedAt.seconds * 1000) 
      : courseData.updatedAt 
        ? new Date(courseData.updatedAt) 
        : undefined,
    // Ensure status field exists for backward compatibility
    status: courseData.status || (courseData.isPublished ? 'published' : 'draft')
  }
}

// Get all courses
export const getAllCourses = async (): Promise<AdminCourse[]> => {
  try {
    const response = await fetch('/api/courses', {
      headers: getAuthHeaders(),
    })
    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to fetch courses:', data.error)
      return []
    }

    const courses = data.courses || []
    return courses.map(transformCourseData)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return []
  }
}

// Get all courses for browsing (allows instructors to see all published courses)
export const getAllCoursesForBrowsing = async (): Promise<AdminCourse[]> => {
  try {
    const response = await fetch('/api/courses?browsing=true', {
      headers: getAuthHeaders(),
    })
    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to fetch courses for browsing:', data.error)
      return []
    }

    const courses = data.courses || []
    return courses.map(transformCourseData)
  } catch (error) {
    console.error('Error fetching courses for browsing:', error)
    return []
  }
}

// Get courses by instructor
export const getCoursesByInstructor = async (instructorId: string): Promise<AdminCourse[]> => {
  try {
    const response = await fetch(`/api/courses?instructorId=${instructorId}`, {
      headers: getAuthHeaders(),
    })
    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to fetch instructor courses:', data.error)
      return []
    }

    const courses = data.courses || []
    return courses.map(transformCourseData)
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
      headers: getAuthHeaders(),
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

// Add a new multilingual course with language configuration
export const addMultilingualCourse = async (courseData: CreateCourseData): Promise<string | null> => {
  try {
    // Use the enhanced course creation API that supports language configuration
    const response = await fetch('/api/courses/multilingual', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData),
    })

    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to create multilingual course:', data.error)
      return null
    }

    return data.course?.id || null
  } catch (error) {
    console.error('Error creating multilingual course:', error)
    // Fallback to regular course creation if multilingual API is not available
    console.log('Falling back to regular course creation...')
    return addCourse(courseData)
  }
}

// Update an existing course
export const updateCourse = async (
  courseId: string, 
  updates: Partial<AdminCourse>, 
  userId?: string
): Promise<boolean> => {
  try {
    const response = await fetch(`/api/courses/${courseId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
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

// Delete a course with cascade (removes all related data)
export const deleteCourse = async (courseId: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/courses/${courseId}/cascade-delete`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
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

// Get related items counts for a course (for confirmation dialog)
export const getCourseRelatedCounts = async (courseId: string): Promise<any> => {
  try {
    const response = await fetch(`/api/courses/${courseId}/cascade-delete`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to get related counts:', data.error)
      return null
    }

    return data.relatedCounts
  } catch (error) {
    console.error('Error getting related counts:', error)
    return null
  }
}

// Get single course by ID
export const getCourseById = async (courseId: string): Promise<AdminCourse | null> => {
  try {
    const response = await fetch(`/api/courses/${courseId}`, {
      headers: getAuthHeaders(),
    })
    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to fetch course:', data.error)
      return null
    }

    if (!data.course) {
      return null
    }

    // Apply transformation to ensure proper date conversion and status handling
    return transformCourseData(data.course)
  } catch (error) {
    console.error('Error fetching course:', error)
    return null
  }
}

// Search courses
export const searchCourses = async (searchTerm: string): Promise<AdminCourse[]> => {
  try {
    const response = await fetch(`/api/courses?search=${encodeURIComponent(searchTerm)}`, {
      headers: getAuthHeaders(),
    })
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
  // Superadmins can manage any course
  if (userRole === UserRole.SUPERADMIN) return true
  // Instructors can only manage their own courses
  if (userRole === UserRole.INSTRUCTOR && courseInstructorId === userId) return true
  return false
}

export const canUserViewAllCourses = (userRole: UserRole): boolean => {
  return userRole === UserRole.INSTRUCTOR || userRole === UserRole.SUPERADMIN
}

export const canUserCreateCourse = (userRole: UserRole): boolean => {
  return userRole === UserRole.INSTRUCTOR || userRole === UserRole.SUPERADMIN
}

// Alias for getAllCourses to match AdminDashboard import
export const getCourses = getAllCourses

// Get course statistics
export const getCourseStats = async (): Promise<CourseStats> => {
  try {
    const courses = await getAllCourses()
    
    const stats: CourseStats = {
      totalCourses: courses.length,
      publishedCourses: courses.filter(c => c.status === 'published').length,
      draftCourses: courses.filter(c => c.status === 'draft').length,
      archivedCourses: courses.filter(c => c.status === 'archived').length,
      totalEnrollments: courses.reduce((total, c) => total + (c.enrollmentCount || 0), 0),
      averageRating: courses.length > 0 
        ? courses.filter(c => c.rating).reduce((total, c) => total + (c.rating || 0), 0) / courses.filter(c => c.rating).length
        : 0,
      totalRevenue: 0, // Remove price-based revenue calculation as price field is removed
      categoryCounts: courses.reduce((acc, c) => {
        // This would need to be fetched from master data to show category names
        acc[c.categoryId] = (acc[c.categoryId] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      difficultyCounts: courses.reduce((acc, c) => {
        // This would need to be fetched from master data to show difficulty names
        acc[c.difficultyId] = (acc[c.difficultyId] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }
    
    return stats
  } catch (error) {
    console.error('Error getting course stats:', error)
    return {
      totalCourses: 0,
      publishedCourses: 0,
      draftCourses: 0,
      archivedCourses: 0,
      totalEnrollments: 0,
      averageRating: 0,
      totalRevenue: 0,
      categoryCounts: {},
      difficultyCounts: {}
    }
  }
}

// ========================================
// COURSE TOPICS MANAGEMENT
// ========================================

/**
 * Get all topics for a course
 */
export async function getCourseTopics(courseId: string): Promise<AdminCourseTopic[]> {
  try {
    const response = await fetch(`/api/courses/${courseId}/topics`, {
      headers: getAuthHeaders(),
    })
    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to fetch course topics:', data.error)
      return []
    }

    return data.topics || []
  } catch (error) {
    console.error('Error fetching course topics:', error)
    return []
  }
}

/**
 * Add a new topic to a course
 */
export async function addCourseTopic(courseId: string, topicData: CreateCourseTopicData): Promise<string | null> {
  try {
    const response = await fetch(`/api/courses/${courseId}/topics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(topicData),
    })

    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to create course topic:', data.error)
      return null
    }

    return data.topic?.id || null
  } catch (error) {
    console.error('Error creating course topic:', error)
    return null
  }
}

/**
 * Update an existing course topic
 */
export async function updateCourseTopic(courseId: string, topicId: string, updates: Partial<AdminCourseTopic>): Promise<boolean> {
  try {
    const response = await fetch(`/api/courses/${courseId}/topics/${topicId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(updates),
    })

    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to update course topic:', data.error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating course topic:', error)
    return false
  }
}

/**
 * Delete a course topic
 */
export async function deleteCourseTopic(courseId: string, topicId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/courses/${courseId}/topics/${topicId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })

    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to delete course topic:', data.error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting course topic:', error)
    return false
  }
}

// Duplicate a course
export const duplicateCourse = async (courseId: string): Promise<AdminCourse | null> => {
  try {
    const response = await fetch(`/api/courses/${courseId}/duplicate`, {
      method: 'POST',
      headers: getAuthHeaders(),
    })

    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to duplicate course:', data.error)
      return null
    }

    return data.course || null
  } catch (error) {
    console.error('Error duplicating course:', error)
    return null
  }
}

/**
 * Reorder course topics
 */
export async function reorderCourseTopics(courseId: string, topicOrders: { id: string; order: number }[]): Promise<boolean> {
  try {
    const updatePromises = topicOrders.map(({ id, order }) =>
      updateCourseTopic(courseId, id, { order })
    )
    
    const results = await Promise.all(updatePromises)
    return results.every(result => result === true)
  } catch (error) {
    console.error('Error reordering course topics:', error)
    return false
  }
}
