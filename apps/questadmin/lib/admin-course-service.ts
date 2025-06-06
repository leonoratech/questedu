import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore'
import { db, UserRole } from './firebase-auth'

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
  duration: string
  status: 'draft' | 'published'
  instructorId: string
}

const COURSES_COLLECTION = 'admin_courses'

// Get all courses
export const getCourses = async (): Promise<AdminCourse[]> => {
  try {
    const coursesRef = collection(db, COURSES_COLLECTION)
    const q = query(coursesRef, orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    } as AdminCourse))
  } catch (error) {
    console.error('Error fetching courses:', error)
    return []
  }
}

// Get courses by instructor
export const getMyCourses = async (instructorId: string): Promise<AdminCourse[]> => {
  try {
    const coursesRef = collection(db, COURSES_COLLECTION)
    const q = query(
      coursesRef, 
      where('instructorId', '==', instructorId),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    } as AdminCourse))
  } catch (error) {
    console.error('Error fetching user courses:', error)
    return []
  }
}

// Add a new course
export const addCourse = async (courseData: CreateCourseData): Promise<string | null> => {
  try {
    const coursesRef = collection(db, COURSES_COLLECTION)
    const newCourse = {
      ...courseData,
      status: 'draft' as const,
      rating: 0,
      enrollmentCount: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }
    
    const docRef = await addDoc(coursesRef, newCourse)
    return docRef.id
  } catch (error) {
    console.error('Error adding course:', error)
    return null
  }
}

// Create a new course (alias for addCourse with extended data)
export const createCourse = async (courseData: CreateCourseFormData): Promise<string> => {
  try {
    const coursesRef = collection(db, COURSES_COLLECTION)
    
    // Convert level to match AdminCourse interface
    const levelMapping = {
      'beginner': 'Beginner' as const,
      'intermediate': 'Intermediate' as const,
      'advanced': 'Advanced' as const
    }
    
    const newCourse = {
      title: courseData.title,
      description: courseData.description,
      instructor: courseData.instructor,
      category: courseData.category,
      level: levelMapping[courseData.level],
      price: courseData.price,
      duration: courseData.duration,
      instructorId: courseData.instructorId,
      status: courseData.status,
      rating: 0,
      enrollmentCount: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }
    
    const docRef = await addDoc(coursesRef, newCourse)
    return docRef.id
  } catch (error) {
    console.error('Error creating course:', error)
    throw new Error('Failed to create course')
  }
}

// Update a course
export const updateCourse = async (courseId: string, updates: Partial<AdminCourse>): Promise<boolean> => {
  try {
    const courseRef = doc(db, COURSES_COLLECTION, courseId)
    await updateDoc(courseRef, {
      ...updates,
      updatedAt: Timestamp.now()
    })
    return true
  } catch (error) {
    console.error('Error updating course:', error)
    return false
  }
}

// Delete a course
export const deleteCourse = async (courseId: string): Promise<boolean> => {
  try {
    const courseRef = doc(db, COURSES_COLLECTION, courseId)
    await deleteDoc(courseRef)
    return true
  } catch (error) {
    console.error('Error deleting course:', error)
    return false
  }
}

// Search courses
export const searchCourses = async (searchTerm: string): Promise<AdminCourse[]> => {
  try {
    const courses = await getCourses()
    return courses.filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  } catch (error) {
    console.error('Error searching courses:', error)
    return []
  }
}

// Get courses by category
export const getCoursesByCategory = async (category: string): Promise<AdminCourse[]> => {
  try {
    const coursesRef = collection(db, COURSES_COLLECTION)
    const q = query(
      coursesRef,
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    } as AdminCourse))
  } catch (error) {
    console.error('Error fetching courses by category:', error)
    return []
  }
}

// Check if user can edit course
export const canUserEditCourse = async (courseId: string, userId: string, userRole: UserRole): Promise<boolean> => {
  try {
    // Admins can edit any course
    if (userRole === UserRole.ADMIN) {
      return true
    }
    
    // Instructors can edit their own courses
    if (userRole === UserRole.INSTRUCTOR) {
      const courseRef = doc(db, COURSES_COLLECTION, courseId)
      const courseDoc = await getDoc(courseRef)
      
      if (courseDoc.exists()) {
        const courseData = courseDoc.data()
        return courseData.instructorId === userId
      }
    }
    
    return false
  } catch (error) {
    console.error('Error checking course edit permissions:', error)
    return false
  }
}

// Get course statistics
export const getCourseStats = async () => {
  try {
    const courses = await getCourses()
    
    return {
      totalCourses: courses.length,
      publishedCourses: courses.filter(c => c.status === 'published').length,
      draftCourses: courses.filter(c => c.status === 'draft').length,
      archivedCourses: courses.filter(c => c.status === 'archived').length,
      totalEnrollments: courses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0),
      averageRating: courses.length > 0 
        ? courses.reduce((sum, c) => sum + (c.rating || 0), 0) / courses.length 
        : 0
    }
  } catch (error) {
    console.error('Error fetching course stats:', error)
    return {
      totalCourses: 0,
      publishedCourses: 0,
      draftCourses: 0,
      archivedCourses: 0,
      totalEnrollments: 0,
      averageRating: 0
    }
  }
}

// Get a course by ID
export const getCourseById = async (courseId: string): Promise<AdminCourse | null> => {
  try {
    const courseRef = doc(db, COURSES_COLLECTION, courseId)
    const courseDoc = await getDoc(courseRef)
    
    if (!courseDoc.exists()) {
      return null
    }
    
    const data = courseDoc.data()
    return {
      id: courseDoc.id,
      title: data.title || '',
      description: data.description || '',
      instructor: data.instructor || '',
      category: data.category || '',
      level: data.level || 'Beginner',
      price: data.price || 0,
      duration: data.duration || '',
      status: data.status || 'draft',
      rating: data.rating,
      enrollmentCount: data.enrollmentCount || 0,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      instructorId: data.instructorId || ''
    } as AdminCourse
  } catch (error) {
    console.error('Error fetching course by ID:', error)
    throw new Error('Failed to fetch course')
  }
}
