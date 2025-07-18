import { getAuthHeaders } from '@/data/config/firebase-auth'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Get all colleges
 */
export async function getColleges(): Promise<any[]> {
  try {
    const response = await fetch('/api/colleges', {
      headers: getAuthHeaders(),
    })
    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to fetch colleges:', data.error)
      return []
    }

    return data.data || []
  } catch (error) {
    console.error('Error fetching colleges:', error)
    return []
  }
}

/**
 * Get college by ID
 */
export async function getCollegeById(collegeId: string): Promise<any | null> {
  try {
    const response = await fetch(`/api/colleges/${collegeId}`, {
      headers: getAuthHeaders(),
    })
    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to fetch college:', data.error)
      return null
    }

    return data.data || null
  } catch (error) {
    console.error('Error fetching college:', error)
    return null
  }
}

/**
 * Create a new college
 */
export async function createCollege(collegeData: any): Promise<any | null> {
  try {
    const response = await fetch('/api/colleges', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(collegeData),
    })
    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to create college:', data.error)
      return null
    }

    return data.data || null
  } catch (error) {
    console.error('Error creating college:', error)
    return null
  }
}

/**
 * Update an existing college
 */
export async function updateCollege(
  collegeId: string,
  updates: Partial<any>
): Promise<boolean> {
  try {
    const response = await fetch(`/api/colleges/${collegeId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    })
    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to update college:', data.error)
      return false
    }

    return data.success || false
  } catch (error) {
    console.error('Error updating college:', error)
    return false
  }
}

/**
 * Delete a college
 */
export async function deleteCollege(collegeId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/colleges/${collegeId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to delete college:', data.error)
      return false
    }

    return data.success || false
  } catch (error) {
    console.error('Error deleting college:', error)
    return false
  }
}
