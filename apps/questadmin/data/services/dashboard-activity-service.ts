/**
 * Dashboard Activity Service
 * Client-side service for fetching instructor activities
 */

import { InstructorActivity } from '@/data/models/instructor-activity'
import { getAuthHeaders, getJWTToken } from '../config/firebase-auth'

export interface ActivityResponse {
  success: boolean
  activities: InstructorActivity[]
  error?: string
}

/**
 * Fetch recent activities for the authenticated instructor
 */
export async function fetchInstructorActivities(limit: number = 10): Promise<InstructorActivity[]> {
  try {
    // Debug: Check if we have a token
    const token = getJWTToken()
    console.log('Fetching activities with token:', token ? 'present' : 'missing')
    
    const response = await fetch(`/api/activities?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
    })

    console.log('Activities API response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to fetch activities:', response.status, response.statusText, errorText)
      return []
    }

    const data: ActivityResponse = await response.json()
    
    if (!data.success) {
      console.error('Activity fetch failed:', data.error)
      return []
    }

    return data.activities
  } catch (error) {
    console.error('Error fetching instructor activities:', error)
    return []
  }
}
