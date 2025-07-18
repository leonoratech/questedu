/**
 * Subject Service
 * Client-side service for managing subjects using HTTP requests with JWT authentication
 * Updated to use API routes instead of direct Firebase operations
 */

import { InstructorOption, Subject } from '@/data/models/subject'
import { getAuthHeaders } from '../config/firebase-auth'

/**
 * Get all subjects for a specific program
 */
export async function getSubjectsByProgram(programId: string, collegeId: string): Promise<Subject[]> {
  try {
    const response = await fetch(`/api/colleges/${collegeId}/programs/${programId}/subjects`, {
      method: 'GET',
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch subjects: ${response.status}`)
    }

    const data = await response.json()
    return data.subjects || []
  } catch (error) {
    console.error('Error fetching subjects by program:', error)
    throw new Error('Failed to fetch subjects')
  }
}

/**
 * Get all subjects for a specific college
 */
export async function getSubjectsByCollege(collegeId: string): Promise<Subject[]> {
  try {
    // Note: This would require a new API endpoint if needed
    // For now, we can implement this by fetching all programs and their subjects
    throw new Error('getSubjectsByCollege not yet implemented with HTTP API - need to create specific endpoint')
  } catch (error) {
    console.error('Error fetching subjects by college:', error)
    throw new Error('Failed to fetch subjects')
  }
}

/**
 * Get a specific subject by ID
 */
export async function getSubjectById(subjectId: string, collegeId: string, programId: string): Promise<Subject | null> {
  try {
    const response = await fetch(`/api/colleges/${collegeId}/programs/${programId}/subjects/${subjectId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Failed to fetch subject: ${response.status}`)
    }

    const data = await response.json()
    return data.subject || null
  } catch (error) {
    console.error('Error fetching subject by ID:', error)
    throw new Error('Failed to fetch subject')
  }
}

/**
 * Delete a subject (soft delete by setting isActive to false)
 */
export async function deleteSubject(collegeId: string, id: string): Promise<void> {
  const response = await fetch(`/api/colleges/${collegeId}/subjects/${id}`, {
    method: 'DELETE'
  })
  if (!response.ok) throw new Error('Failed to delete subject')
}

/**
 * Get available instructors for a college (for subject assignment)
 */
export async function getAvailableInstructors(collegeId: string): Promise<InstructorOption[]> {
  try {
    const response = await fetch(`/api/colleges/${collegeId}/instructors`, {
      method: 'GET',
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch instructors: ${response.status}`)
    }

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching available instructors:', error)
    throw new Error('Failed to fetch instructors')
  }
}

/**
 * Get instructor name by ID (for caching)
 * Note: This function might not be needed client-side as instructor names 
 * should come from the API responses
 */
export async function getInstructorName(instructorId: string): Promise<string> {
  try {
    // This would require a new API endpoint for individual instructor lookup
    // For now, return a placeholder
    console.warn('getInstructorName called - consider using cached data from getAvailableInstructors')
    return 'Unknown Instructor'
  } catch (error) {
    console.error('Error fetching instructor name:', error)
    return 'Unknown Instructor'
  }
}

/**
 * Bulk update subjects for a program (useful for reordering or mass updates)
 * Note: This would require a new API endpoint for batch operations
 */
export async function bulkUpdateSubjects(subjects: Subject[], collegeId: string, programId: string): Promise<void> {
  try {
    // For now, implement as sequential updates
    // Could be optimized with a dedicated batch API endpoint
    for (const subject of subjects) {
      if (subject.id) {
        await updateSubject(collegeId, subject.id, subject)
      } else {
        console.warn('Subject missing id in bulkUpdateSubjects:', subject)
      }
    }
  } catch (error) {
    console.error('Error bulk updating subjects:', error)
    throw new Error('Failed to update subjects')
  }
}

/**
 * Get subjects count by program
 */
export async function getSubjectsCountByProgram(programId: string, collegeId: string): Promise<number> {
  try {
    const subjects = await getSubjectsByProgram(programId, collegeId)
    return subjects.length
  } catch (error) {
    console.error('Error getting subjects count:', error)
    return 0
  }
}

/**
 * Check if an instructor is assigned to any subject in a program
 */
export async function isInstructorAssignedToProgram(instructorId: string, programId: string, collegeId: string): Promise<boolean> {
  try {
    const subjects = await getSubjectsByProgram(programId, collegeId)
    return subjects.some(subject => subject.instructorId === instructorId)
  } catch (error) {
    console.error('Error checking instructor assignment:', error)
    return false
  }
}

// Fetch-based subject service for new API
export async function getSubjects(collegeId: string, programId?: string): Promise<Subject[]> {
  const url = programId
    ? `/api/colleges/${collegeId}/subjects?programId=${programId}`
    : `/api/colleges/${collegeId}/subjects`
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to fetch subjects')
  return await response.json()
}

export async function createSubject(collegeId: string, data: Omit<Subject, 'id'>): Promise<Subject> {
  const response = await fetch(`/api/colleges/${collegeId}/subjects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) throw new Error('Failed to create subject')
  return await response.json()
}

export async function updateSubject(collegeId: string, id: string, updates: Partial<Subject>): Promise<void> {
  const response = await fetch(`/api/colleges/${collegeId}/subjects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  })
  if (!response.ok) throw new Error('Failed to update subject')
}
