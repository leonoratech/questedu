/**
 * Course Questions Service
 * Updated to use HTTP requests with JWT authentication
 */

import { getAuthHeaders } from '../config/firebase-auth'
import { CourseQuestion, CreateCourseQuestionData, UpdateCourseQuestionData } from '../models/data-model'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  questions?: CourseQuestion[]
  question?: CourseQuestion
  questionId?: string
  error?: string
  message?: string
}

// Create a new course question
export async function createCourseQuestion(
  questionData: CreateCourseQuestionData,
  userId: string
): Promise<string | null> {
  try {
    const response = await fetch(`/api/courses/${questionData.courseId}/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(questionData)
    })

    const data: ApiResponse = await response.json()

    if (!response.ok) {
      console.error('Failed to create course question:', data.error)
      return null
    }

    return data.questionId || null
  } catch (error) {
    console.error('Error creating course question:', error)
    return null
  }
}

// Get all questions for a specific course
export async function getCourseQuestions(courseId: string): Promise<CourseQuestion[]> {
  try {
    const response = await fetch(`/api/courses/${courseId}/questions`, {
      headers: getAuthHeaders()
    })

    const data: ApiResponse = await response.json()

    if (!response.ok) {
      console.error('Failed to fetch course questions:', data.error)
      return []
    }

    return data.questions || []
  } catch (error) {
    console.error('Error fetching course questions:', error)
    return []
  }
}

// Get questions by topic
export async function getCourseQuestionsByTopic(courseId: string, topicId: string): Promise<CourseQuestion[]> {
  try {
    const response = await fetch(`/api/courses/${courseId}/questions?topicId=${topicId}`, {
      headers: getAuthHeaders()
    })

    const data: ApiResponse = await response.json()

    if (!response.ok) {
      console.error('Failed to fetch questions by topic:', data.error)
      return []
    }

    return data.questions || []
  } catch (error) {
    console.error('Error fetching questions by topic:', error)
    return []
  }
}

// Get a single question by ID
export async function getCourseQuestionById(courseId: string, questionId: string): Promise<CourseQuestion | null> {
  try {
    const response = await fetch(`/api/courses/${courseId}/questions/${questionId}`, {
      headers: getAuthHeaders()
    })

    const data: ApiResponse = await response.json()

    if (!response.ok) {
      console.error('Failed to fetch course question:', data.error)
      return null
    }

    return data.question || null
  } catch (error) {
    console.error('Error fetching course question:', error)
    return null
  }
}

// Update a course question
export async function updateCourseQuestion(
  courseId: string,
  questionId: string,
  updates: UpdateCourseQuestionData,
  userId: string
): Promise<boolean> {
  try {
    const response = await fetch(`/api/courses/${courseId}/questions/${questionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(updates)
    })

    const data: ApiResponse = await response.json()

    if (!response.ok) {
      console.error('Failed to update course question:', data.error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating course question:', error)
    return false
  }
}

// Delete a course question
export async function deleteCourseQuestion(courseId: string, questionId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/courses/${courseId}/questions/${questionId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })

    const data: ApiResponse = await response.json()

    if (!response.ok) {
      console.error('Failed to delete course question:', data.error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting course question:', error)
    return false
  }
}

// Bulk update question orders
export async function updateQuestionOrders(
  courseId: string,
  questionUpdates: { id: string; order: number }[]
): Promise<boolean> {
  try {
    const response = await fetch(`/api/courses/${courseId}/questions/bulk-update-orders`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ questionUpdates })
    })

    const data: ApiResponse = await response.json()

    if (!response.ok) {
      console.error('Failed to update question orders:', data.error)
      return false
    }

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
    const response = await fetch(`/api/courses/${courseId}/questions?difficulty=${difficulty}`, {
      headers: getAuthHeaders()
    })

    const data: ApiResponse = await response.json()

    if (!response.ok) {
      console.error('Failed to fetch questions by difficulty:', data.error)
      return []
    }

    return data.questions || []
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
    const response = await fetch(`/api/courses/${courseId}/questions?type=${type}`, {
      headers: getAuthHeaders()
    })

    const data: ApiResponse = await response.json()

    if (!response.ok) {
      console.error('Failed to fetch questions by type:', data.error)
      return []
    }

    return data.questions || []
  } catch (error) {
    console.error('Error fetching questions by type:', error)
    return []
  }
}

// Get questions with specific flags
export async function getCourseQuestionsByFlag(
  courseId: string,
  flagName: string,
  flagValue: boolean = true
): Promise<CourseQuestion[]> {
  try {
    const response = await fetch(`/api/courses/${courseId}/questions?flag=${flagName}&flagValue=${flagValue}`, {
      headers: getAuthHeaders()
    })

    const data: ApiResponse = await response.json()

    if (!response.ok) {
      console.error('Failed to fetch questions by flag:', data.error)
      return []
    }

    return data.questions || []
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
    const response = await fetch(`/api/courses/${courseId}/questions?minMarks=${minMarks}&maxMarks=${maxMarks}`, {
      headers: getAuthHeaders()
    })

    const data: ApiResponse = await response.json()

    if (!response.ok) {
      console.error('Failed to fetch questions by marks range:', data.error)
      return []
    }

    return data.questions || []
  } catch (error) {
    console.error('Error fetching questions by marks range:', error)
    return []
  }
}

// Export types for use in components
export type {
  CourseQuestion,
  CreateCourseQuestionData,
  UpdateCourseQuestionData
}

