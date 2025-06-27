/**
 * Server-side Course Questions Service
 * Handles all Firebase operations for course questions on the server
 */

import { serverDb } from '@/app/api/firebase-server'
import { CourseQuestion, CreateCourseQuestionData, QuestionFlags, UpdateCourseQuestionData } from '@/data/models/data-model'
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
    writeBatch
} from 'firebase/firestore'

const COLLECTION_NAME = 'courseQuestions'

// Utility function to remove undefined values from an object
function removeUndefinedValues(obj: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value
    }
  }
  return cleaned
}

/**
 * Create a new course question (server-side)
 */
export async function createCourseQuestionServer(
  questionData: CreateCourseQuestionData,
  userId: string
): Promise<string> {
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
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isPublished: questionData.isPublished ?? false,
      order: questionData.order ?? 0,
      flags: questionData.flags ? { ...defaultFlags, ...questionData.flags } : defaultFlags
    }

    // Remove undefined values to prevent Firestore errors
    const cleanedData = removeUndefinedValues(questionWithDefaults)

    const docRef = await addDoc(collection(serverDb, COLLECTION_NAME), cleanedData)
    return docRef.id
  } catch (error) {
    console.error('Error creating course question:', error)
    throw new Error('Failed to create course question')
  }
}

/**
 * Get all questions for a specific course (server-side)
 */
export async function getCourseQuestionsServer(courseId: string): Promise<CourseQuestion[]> {
  try {
    const q = query(
      collection(serverDb, COLLECTION_NAME),
      where('courseId', '==', courseId),
      orderBy('order', 'asc'),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
    })) as CourseQuestion[]
  } catch (error) {
    console.error('Error fetching course questions:', error)
    throw new Error('Failed to fetch course questions')
  }
}

/**
 * Get questions by topic (server-side)
 */
export async function getCourseQuestionsByTopicServer(courseId: string, topicId: string): Promise<CourseQuestion[]> {
  try {
    const q = query(
      collection(serverDb, COLLECTION_NAME),
      where('courseId', '==', courseId),
      where('topicId', '==', topicId),
      orderBy('order', 'asc')
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
    })) as CourseQuestion[]
  } catch (error) {
    console.error('Error fetching questions by topic:', error)
    throw new Error('Failed to fetch questions by topic')
  }
}

/**
 * Get a single question by ID (server-side)
 */
export async function getCourseQuestionByIdServer(questionId: string): Promise<CourseQuestion | null> {
  try {
    const docRef = doc(serverDb, COLLECTION_NAME, questionId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
      } as CourseQuestion
    }
    
    return null
  } catch (error) {
    console.error('Error fetching question by ID:', error)
    throw new Error('Failed to fetch question')
  }
}

/**
 * Update a course question (server-side)
 */
export async function updateCourseQuestionServer(
  questionId: string,
  questionData: UpdateCourseQuestionData,
  userId: string
): Promise<void> {
  try {
    const docRef = doc(serverDb, COLLECTION_NAME, questionId)
    
    const updateData = {
      ...questionData,
      lastModifiedBy: userId,
      updatedAt: serverTimestamp()
    }

    // Remove undefined values to prevent Firestore errors
    const cleanedData = removeUndefinedValues(updateData)

    await updateDoc(docRef, cleanedData)
  } catch (error) {
    console.error('Error updating course question:', error)
    throw new Error('Failed to update course question')
  }
}

/**
 * Delete a course question (server-side)
 */
export async function deleteCourseQuestionServer(questionId: string): Promise<void> {
  try {
    const docRef = doc(serverDb, COLLECTION_NAME, questionId)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error deleting course question:', error)
    throw new Error('Failed to delete course question')
  }
}

/**
 * Bulk update question orders (server-side)
 */
export async function bulkUpdateQuestionOrdersServer(
  updates: { id: string; order: number }[]
): Promise<void> {
  try {
    const batch = writeBatch(serverDb)
    
    updates.forEach(({ id, order }) => {
      const docRef = doc(serverDb, COLLECTION_NAME, id)
      batch.update(docRef, { 
        order,
        updatedAt: serverTimestamp()
      })
    })

    await batch.commit()
  } catch (error) {
    console.error('Error bulk updating question orders:', error)
    throw new Error('Failed to update question orders')
  }
}

/**
 * Duplicate a course question (server-side)
 */
export async function duplicateCourseQuestionServer(
  questionId: string,
  userId: string
): Promise<string> {
  try {
    // Get the original question
    const originalQuestion = await getCourseQuestionByIdServer(questionId)
    
    if (!originalQuestion) {
      throw new Error('Original question not found')
    }

    // Create a duplicate with modified properties
    const { id, createdAt, updatedAt, createdBy, ...questionData } = originalQuestion
    
    const duplicateData: CreateCourseQuestionData = {
      ...questionData,
      question: `${questionData.question} (Copy)`,
      isPublished: false // Duplicates start as unpublished
    }

    return await createCourseQuestionServer(duplicateData, userId)
  } catch (error) {
    console.error('Error duplicating course question:', error)
    throw new Error('Failed to duplicate course question')
  }
}