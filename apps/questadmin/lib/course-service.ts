import {
  Course,
  CourseOwnership,
  CreateCourseData,
  createFirebaseRepositories,
  EnvironmentConfig,
  FirebaseConfig,
  UpdateCourseData,
  User
} from '@questedu/questdata'
import { auth } from './firebase-auth'

const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyALWHvJopjpZ9amcpV74jrBlYqEZzeWaTI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "questedu-cb2a4.firebaseapp.com", 
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "questedu-cb2a4",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "questedu-cb2a4.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "247130380208",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:247130380212:web:dfe0053ff32ae3194a6875"
}

const environmentConfig: EnvironmentConfig = {
  disableSSL: process.env.NEXT_PUBLIC_DISABLE_SSL === 'true',
  useEmulator: process.env.NODE_ENV === 'development',
  enableDebugLogging: process.env.NODE_ENV === 'development'
}

// Lazy initialization using dynamic imports to avoid build-time resolution issues
const getRepositories = async () => {
  return createFirebaseRepositories(firebaseConfig, environmentConfig)
}

// Get all courses
export const getCourses = async (): Promise<Course[]> => {
  try {
    const repositories = await getRepositories()
    const result = await repositories.courseRepository.getAll()
    return result.data
  } catch (error) {
    console.error('Error fetching courses:', error)
    return []
  }
}

// Get courses owned by a specific user
export const getMyCourses = async (userId: string): Promise<Course[]> => {
  try {
    const repositories = await getRepositories()
    // Get courses owned by the user
    const ownershipResult = await repositories.courseOwnershipRepository.getAll()
    const userOwnerships = ownershipResult.data.filter(ownership => ownership.userId === userId)
    
    // Get the actual course details
    const coursePromises = userOwnerships.map(ownership => 
      repositories.courseRepository.getById(ownership.courseId)
    )
    const courseResults = await Promise.all(coursePromises)
    
    return courseResults
      .filter(result => result && result.success && result.data)
      .map(result => result!.data!)
  } catch (error) {
    console.error('Error fetching user courses:', error)
    return []
  }
}

export const addCourse = async (course: CreateCourseData, ownerId: string): Promise<string | null> => {
  try {
    const repositories = await getRepositories()
    const result = await repositories.courseRepository.create(course)
    
    if (result.success && result.data) {
      // Create ownership record
      const ownership: Omit<CourseOwnership, 'id' | 'createdAt'> = {
        userId: ownerId,
        courseId: result.data,
        isOwner: true,
        permissions: {
          canEdit: true,
          canDelete: true,
          canPublish: true,
          canViewAnalytics: true
        }
      }
      
      await repositories.courseOwnershipRepository.create(ownership)
      return result.data
    }
    return null
  } catch (error) {
    console.error('Error adding course:', error)
    throw error
  }
}

export const updateCourse = async (courseId: string, updates: UpdateCourseData): Promise<boolean> => {
  try {
    const repositories = await getRepositories()
    const result = await repositories.courseRepository.update(courseId, updates)
    return result?.success || false
  } catch (error) {
    console.error('Error updating course:', error)
    return false
  }
}

export const deleteCourse = async (courseId: string): Promise<boolean> => {
  try {
    const repositories = await getRepositories()
    const result = await repositories.courseRepository.delete(courseId)
    
    if (result?.success) {
      // Also delete ownership records
      const ownershipResult = await repositories.courseOwnershipRepository.getAll()
      const courseOwnerships = ownershipResult.data.filter(ownership => ownership.courseId === courseId)
      
      await Promise.all(courseOwnerships.map(ownership => 
        repositories.courseOwnershipRepository.delete(ownership.id!)
      ))
    }
    
    return result?.success || false
  } catch (error) {
    console.error('Error deleting course:', error)
    return false
  }
}

export const searchCourses = async (searchTerm: string): Promise<Course[]> => {
  try {
    const repositories = await getRepositories()
    const result = await repositories.courseRepository.getAll()
    
    return result.data.filter((course: Course) => 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  } catch (error) {
    console.error('Error searching courses:', error)
    return []
  }
}

// User management functions
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const currentUser = auth.currentUser
    if (!currentUser) return null
    
    // Convert Firebase user to questdata User format
    return {
      id: currentUser.uid,
      email: currentUser.email || '',
      displayName: currentUser.displayName || '',
      role: 'instructor' as any, // Will need to get from user profile
      isActive: true,
      profileComplete: !!currentUser.displayName
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export const checkCourseOwnership = async (courseId: string, userId: string): Promise<boolean> => {
  try {
    const repositories = await getRepositories()
    const ownershipResult = await repositories.courseOwnershipRepository.getAll()
    
    return ownershipResult.data.some(ownership => 
      ownership.courseId === courseId && ownership.userId === userId && ownership.isOwner
    )
  } catch (error) {
    console.error('Error checking course ownership:', error)
    return false
  }
}
