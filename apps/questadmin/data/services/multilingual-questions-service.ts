/**
 * Multilingual Course Questions Service
 * 
 * Provides enhanced question management with multilingual support
 */

import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where
} from 'firebase/firestore'
import { SupportedLanguage } from '../../lib/multilingual-types'
import { getFirestoreDb } from '../config/questdata-config'
import {
    CreateHybridCourseQuestionData,
    HybridAdminCourseQuestion,
    UpdateHybridCourseQuestionData,
    getQuestionLanguages,
    isMultilingualAdminCourseQuestion
} from '../models/data-model'

const COLLECTION_NAME = 'course_questions'

// ================================
// MULTILINGUAL QUESTION CRUD
// ================================

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
 * Create a new course question with multilingual support
 */
export async function createMultilingualCourseQuestion(
  questionData: CreateHybridCourseQuestionData,
  userId: string
): Promise<string | null> {
  try {
    const questionWithDefaults = {
      ...questionData,
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isPublished: questionData.isPublished ?? false,
      order: questionData.order ?? 0,
      flags: questionData.flags || {
        important: false,
        frequently_asked: false,
        practical: false,
        conceptual: false
      }
    }

    // Remove undefined values to prevent Firestore errors
    const cleanedData = removeUndefinedValues(questionWithDefaults)

    const docRef = await addDoc(collection(getFirestoreDb(), COLLECTION_NAME), cleanedData)
    return docRef.id
  } catch (error) {
    console.error('Error creating multilingual course question:', error)
    return null
  }
}

/**
 * Get all questions for a course with multilingual analysis
 */
export async function getMultilingualCourseQuestions(courseId: string): Promise<HybridAdminCourseQuestion[]> {
  try {
    const q = query(
      collection(getFirestoreDb(), COLLECTION_NAME),
      where('courseId', '==', courseId),
      orderBy('order', 'asc')
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as HybridAdminCourseQuestion[]
  } catch (error) {
    console.error('Error fetching multilingual course questions:', error)
    return []
  }
}

/**
 * Update a multilingual course question
 */
export async function updateMultilingualCourseQuestion(
  questionId: string,
  updates: UpdateHybridCourseQuestionData,
  userId: string
): Promise<boolean> {
  try {
    const docRef = doc(getFirestoreDb(), COLLECTION_NAME, questionId)
    const updateData = {
      ...updates,
      lastModifiedBy: userId,
      updatedAt: serverTimestamp()
    }
    
    await updateDoc(docRef, updateData)
    return true
  } catch (error) {
    console.error('Error updating multilingual course question:', error)
    return false
  }
}

/**
 * Delete a course question
 */
export async function deleteMultilingualCourseQuestion(questionId: string): Promise<boolean> {
  try {
    const docRef = doc(getFirestoreDb(), COLLECTION_NAME, questionId)
    await deleteDoc(docRef)
    return true
  } catch (error) {
    console.error('Error deleting multilingual course question:', error)
    return false
  }
}

// ================================
// MULTILINGUAL ANALYSIS
// ================================

/**
 * Analyze multilingual content in course questions
 */
export interface QuestionMultilingualAnalysis {
  totalQuestions: number
  multilingualQuestions: number
  availableLanguages: SupportedLanguage[]
  completeness: {
    [language in SupportedLanguage]?: {
      percentage: number
      questionsWithContent: number
    }
  }
}

/**
 * Get multilingual analysis for course questions
 */
export async function analyzeCourseQuestionsMultilingual(
  courseId: string
): Promise<QuestionMultilingualAnalysis> {
  try {
    const questions = await getMultilingualCourseQuestions(courseId)
    
    const allLanguages = new Set<SupportedLanguage>(['en' as SupportedLanguage])
    let multilingualCount = 0
    
    questions.forEach(question => {
      if (isMultilingualAdminCourseQuestion(question)) {
        multilingualCount++
        const questionLanguages = getQuestionLanguages(question)
        questionLanguages.forEach((lang: SupportedLanguage) => allLanguages.add(lang))
      }
    })
    
    const availableLanguages = Array.from(allLanguages)
    const completeness: QuestionMultilingualAnalysis['completeness'] = {}
    
    // Calculate completeness for each language
    availableLanguages.forEach(language => {
      const questionsWithContent = questions.filter(question => {
        const questionLanguages = getQuestionLanguages(question)
        return questionLanguages.includes(language)
      }).length
      
      completeness[language] = {
        percentage: questions.length > 0 ? Math.round((questionsWithContent / questions.length) * 100) : 0,
        questionsWithContent
      }
    })
    
    return {
      totalQuestions: questions.length,
      multilingualQuestions: multilingualCount,
      availableLanguages,
      completeness
    }
  } catch (error) {
    console.error('Error analyzing multilingual questions:', error)
    return {
      totalQuestions: 0,
      multilingualQuestions: 0,
      availableLanguages: ['en' as SupportedLanguage],
      completeness: {
        en: { percentage: 0, questionsWithContent: 0 }
      }
    }
  }
}

/**
 * Get questions filtered by topic with multilingual support
 */
export async function getMultilingualCourseQuestionsByTopic(
  courseId: string, 
  topicId: string
): Promise<HybridAdminCourseQuestion[]> {
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
      ...doc.data()
    })) as HybridAdminCourseQuestion[]
  } catch (error) {
    console.error('Error fetching multilingual topic questions:', error)
    return []
  }
}

// ================================
// MIGRATION UTILITIES
// ================================

/**
 * Convert legacy questions to multilingual format
 */
export async function migrateLegacyQuestionToMultilingual(
  questionId: string,
  userId: string
): Promise<boolean> {
  try {
    // This would be implemented when we have full backend support
    // For now, return true as questions are already compatible
    console.log(`Migration requested for question ${questionId} by user ${userId}`)
    return true
  } catch (error) {
    console.error('Error migrating legacy question:', error)
    return false
  }
}
