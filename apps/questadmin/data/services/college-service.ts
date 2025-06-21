// College/University data model and service
import { getAuthHeaders } from '../config/firebase-auth'

// College/University interface
export interface College {
  id?: string
  name: string
  accreditation?: string
  affiliation?: string
  address?: {
    street?: string
    city?: string
    state?: string
    country?: string
    postalCode?: string
  }
  contact?: {
    phone?: string
    email?: string
    website?: string
  }
  website?: string
  principalName?: string
  description?: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
  createdBy?: string
}

// API response interface
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  college?: College
  colleges?: College[]
  error?: string
  message?: string
}

/**
 * Get all colleges
 */
export async function getColleges(): Promise<College[]> {
  try {
    const response = await fetch('/api/colleges', {
      headers: getAuthHeaders(),
    })
    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to fetch colleges:', data.error)
      return []
    }

    return data.colleges || []
  } catch (error) {
    console.error('Error fetching colleges:', error)
    return []
  }
}

/**
 * Get college by ID
 */
export async function getCollegeById(collegeId: string): Promise<College | null> {
  try {
    const response = await fetch(`/api/colleges/${collegeId}`, {
      headers: getAuthHeaders(),
    })
    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to fetch college:', data.error)
      return null
    }

    return data.college || null
  } catch (error) {
    console.error('Error fetching college:', error)
    return null
  }
}

/**
 * Create new college
 */
export async function createCollege(collegeData: Omit<College, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
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

    return data.college?.id || null
  } catch (error) {
    console.error('Error creating college:', error)
    return null
  }
}

/**
 * Update college
 */
export async function updateCollege(collegeId: string, collegeData: Partial<College>): Promise<boolean> {
  try {
    const response = await fetch(`/api/colleges/${collegeId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(collegeData),
    })
    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to update college:', data.error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating college:', error)
    return false
  }
}

/**
 * Delete college
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

    return true
  } catch (error) {
    console.error('Error deleting college:', error)
    return false
  }
}

/**
 * Search colleges by name
 */
export async function searchColleges(searchTerm: string): Promise<College[]> {
  try {
    const response = await fetch(`/api/colleges?search=${encodeURIComponent(searchTerm)}`, {
      headers: getAuthHeaders(),
    })
    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to search colleges:', data.error)
      return []
    }

    return data.colleges || []
  } catch (error) {
    console.error('Error searching colleges:', error)
    return []
  }
}
