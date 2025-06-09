import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore'
import { getFirestoreDb } from '../config/questdata-config'
import { CourseQuestion, CreateCourseQuestionData, QuestionFlags, UpdateCourseQuestionData } from '../models/data-models'

const COLLECTION_NAME = 'course_questions'

// Create a new course question
export async function createCourseQuestion(
  questionData: CreateCourseQuestionData,
  userId: string
): Promise<string | null> {
  try {
    // Provide default flags if not specified
    const defaultFlags: QuestionFlags = {
      important: false,
      frequently_asked: false,
      practical: false,
      conceptual: false
    }

    const questionWithDefaults = {
      ...questionData,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublished: questionData.isPublished ?? false,
      order: questionData.order ?? 0,
      flags: questionData.flags ? { ...defaultFlags, ...questionData.flags } : defaultFlags
    }

    const docRef = await addDoc(collection(getFirestoreDb(), COLLECTION_NAME), questionWithDefaults)
    return docRef.id
  } catch (error) {
    console.error('Error creating course question:', error)
    return null
  }
}

// Get all questions for a specific course
export async function getCourseQuestions(courseId: string): Promise<CourseQuestion[]> {
  try {
    const q = query(
      collection(getFirestoreDb(), COLLECTION_NAME),
      where('courseId', '==', courseId),
      orderBy('order', 'asc'),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as CourseQuestion[]
  } catch (error) {
    console.error('Error fetching course questions:', error)
    return []
  }
}

// Get questions by topic
export async function getCourseQuestionsByTopic(courseId: string, topicId: string): Promise<CourseQuestion[]> {
  try {
    const q = query(
      collection(getFirestoreDb(), COLLECTION_NAME),
      where('courseId', '==', courseId),
      where('topicId', '==', topicId),
      orderBy('order', 'asc')
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as CourseQuestion[]
  } catch (error) {
    console.error('Error fetching questions by topic:', error)
    return []
  }
}

// Get a single question by ID
export async function getCourseQuestionById(questionId: string): Promise<CourseQuestion | null> {
  try {
    const docRef = doc(getFirestoreDb(), COLLECTION_NAME, questionId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as CourseQuestion
    }
    
    return null
  } catch (error) {
    console.error('Error fetching course question:', error)
    return null
  }
}

// Update a course question
export async function updateCourseQuestion(
  questionId: string,
  updates: UpdateCourseQuestionData,
  userId: string
): Promise<boolean> {
  try {
    const docRef = doc(getFirestoreDb(), COLLECTION_NAME, questionId)
    const updateData = {
      ...updates,
      lastModifiedBy: userId,
      updatedAt: new Date()
    }
    
    await updateDoc(docRef, updateData)
    return true
  } catch (error) {
    console.error('Error updating course question:', error)
    return false
  }
}

// Delete a course question
export async function deleteCourseQuestion(questionId: string): Promise<boolean> {
  try {
    const docRef = doc(getFirestoreDb(), COLLECTION_NAME, questionId)
    await deleteDoc(docRef)
    return true
  } catch (error) {
    console.error('Error deleting course question:', error)
    return false
  }
}

// Bulk update question orders
export async function updateQuestionOrders(
  questionUpdates: { id: string; order: number }[]
): Promise<boolean> {
  try {
    const batch = writeBatch(getFirestoreDb())
    
    questionUpdates.forEach(update => {
      const docRef = doc(getFirestoreDb(), COLLECTION_NAME, update.id)
      batch.update(docRef, {
        order: update.order,
        updatedAt: new Date()
      })
    })
    
    await batch.commit()
    return true
  } catch (error) {
    console.error('Error updating question orders:', error)
    return false
  }
}

// Get questions by difficulty
export async function getCourseQuestionsByDifficulty(
  courseId: string,
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<CourseQuestion[]> {
  try {
    const q = query(
      collection(getFirestoreDb(), COLLECTION_NAME),
      where('courseId', '==', courseId),
      where('difficulty', '==', difficulty),
      orderBy('order', 'asc')
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as CourseQuestion[]
  } catch (error) {
    console.error('Error fetching questions by difficulty:', error)
    return []
  }
}

// Get questions by type
export async function getCourseQuestionsByType(
  courseId: string,
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'short_essay' | 'long_essay'
): Promise<CourseQuestion[]> {
  try {
    const q = query(
      collection(getFirestoreDb(), COLLECTION_NAME),
      where('courseId', '==', courseId),
      where('type', '==', type),
      orderBy('order', 'asc')
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as CourseQuestion[]
  } catch (error) {
    console.error('Error fetching questions by type:', error)
    return []
  }
}

// Get questions with specific flags
export async function getCourseQuestionsByFlag(
  courseId: string,
  flagName: keyof QuestionFlags,
  flagValue: boolean = true
): Promise<CourseQuestion[]> {
  try {
    const q = query(
      collection(getFirestoreDb(), COLLECTION_NAME),
      where('courseId', '==', courseId),
      where(`flags.${flagName}`, '==', flagValue),
      orderBy('order', 'asc')
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as CourseQuestion[]
  } catch (error) {
    console.error('Error fetching questions by flag:', error)
    return []
  }
}

// Get questions by marks range
export async function getCourseQuestionsByMarksRange(
  courseId: string,
  minMarks: number,
  maxMarks: number
): Promise<CourseQuestion[]> {
  try {
    const q = query(
      collection(getFirestoreDb(), COLLECTION_NAME),
      where('courseId', '==', courseId),
      where('marks', '>=', minMarks),
      where('marks', '<=', maxMarks),
      orderBy('marks', 'asc'),
      orderBy('order', 'asc')
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as CourseQuestion[]
  } catch (error) {
    console.error('Error fetching questions by marks range:', error)
    return []
  }
}

// Export types for use in components
export type {
  CourseQuestion,
  CreateCourseQuestionData, QuestionFlags, UpdateCourseQuestionData
}

