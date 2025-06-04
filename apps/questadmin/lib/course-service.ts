import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    Timestamp,
    updateDoc
} from 'firebase/firestore'
import { db } from './firebase'
import { Course } from './types'

const COLLECTION_NAME = 'courses'

// Get all courses
export const getCourses = async (): Promise<Course[]> => {
  try {
    const coursesRef = collection(db, COLLECTION_NAME)
    const q = query(coursesRef, orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Course))
  } catch (error) {
    console.error('Error fetching courses:', error)
    return []
  }
}

// Add a new course
export const addCourse = async (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
  try {
    const coursesRef = collection(db, COLLECTION_NAME)
    const newCourse = {
      ...course,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }
    
    const docRef = await addDoc(coursesRef, newCourse)
    return docRef.id
  } catch (error) {
    console.error('Error adding course:', error)
    throw error
  }
}

// Update a course
export const updateCourse = async (courseId: string, updates: Partial<Course>): Promise<boolean> => {
  try {
    const courseRef = doc(db, COLLECTION_NAME, courseId)
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
    const courseRef = doc(db, COLLECTION_NAME, courseId)
    await deleteDoc(courseRef)
    return true
  } catch (error) {
    console.error('Error deleting course:', error)
    return false
  }
}

// Search courses
export const searchCourses = async (searchTerm: string): Promise<Course[]> => {
  try {
    const coursesRef = collection(db, COLLECTION_NAME)
    const querySnapshot = await getDocs(coursesRef)
    
    const courses = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Course))
    
    return courses.filter(course => 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    )
  } catch (error) {
    console.error('Error searching courses:', error)
    return []
  }
}
