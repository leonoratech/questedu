// College statistics service
import { getAuthHeaders } from '../config/firebase-auth'

export interface CollegeStats {
  studentCount: number
  staffCount: number
  instructorCount: number
  totalUsers: number
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  stats?: CollegeStats
  error?: string
}

/**
 * Get statistics for a specific college
 */
export async function getCollegeStats(collegeId: string): Promise<CollegeStats | null> {
  try {
    const response = await fetch(`/api/colleges/${collegeId}/stats`, {
      headers: getAuthHeaders(),
    })
    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to fetch college stats:', data.error)
      return null
    }

    return data.stats || null
  } catch (error) {
    console.error('Error fetching college stats:', error)
    return null
  }
}
