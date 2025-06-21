import { getAuthHeaders } from '@/data/config/firebase-auth'
import { CreateProgramRequest, Program } from '@/data/models/program'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  programs?: Program[]
  program?: Program
  error?: string
  message?: string
}

/**
 * Get all programs for a college
 */
export async function getCollegePrograms(collegeId: string): Promise<Program[]> {
  try {
    const response = await fetch(`/api/colleges/${collegeId}/programs`, {
      headers: getAuthHeaders(),
    })
    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to fetch college programs:', data.error)
      return []
    }

    return data.programs || []
  } catch (error) {
    console.error('Error fetching college programs:', error)
    return []
  }
}

/**
 * Create a new program
 */
export async function createProgram(
  collegeId: string,
  programData: CreateProgramRequest
): Promise<Program | null> {
  try {
    const response = await fetch(`/api/colleges/${collegeId}/programs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(programData),
    })
    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to create program:', data.error)
      return null
    }

    return data.program || null
  } catch (error) {
    console.error('Error creating program:', error)
    return null
  }
}

/**
 * Update an existing program
 */
export async function updateProgram(
  collegeId: string,
  programId: string,
  updates: Partial<CreateProgramRequest>
): Promise<boolean> {
  try {
    const response = await fetch(`/api/colleges/${collegeId}/programs/${programId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    })
    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to update program:', data.error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating program:', error)
    return false
  }
}

/**
 * Delete a program
 */
export async function deleteProgram(
  collegeId: string,
  programId: string
): Promise<boolean> {
  try {
    const response = await fetch(`/api/colleges/${collegeId}/programs/${programId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to delete program:', data.error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting program:', error)
    return false
  }
}
