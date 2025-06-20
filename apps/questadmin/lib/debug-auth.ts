/**
 * Client-side authentication debugging utilities
 * These functions can be called from browser console to debug auth issues
 */

import { getAuthHeaders, getJWTToken } from '@/data/config/firebase-auth'

// Make these functions available globally for debugging
declare global {
  interface Window {
    debugAuth: {
      checkToken: () => void
      testAuthEndpoint: () => Promise<void>
      testActivitiesEndpoint: () => Promise<void>
      clearAuth: () => void
    }
  }
}

const debugAuth = {
  /**
   * Check if JWT token exists and log its presence
   */
  checkToken: () => {
    const token = getJWTToken()
    console.log('JWT Token Status:', {
      present: !!token,
      length: token?.length || 0,
      firstChars: token ? token.substring(0, 20) + '...' : 'N/A'
    })
    
    const headers = getAuthHeaders()
    console.log('Auth Headers:', headers)
  },

  /**
   * Test the authentication endpoint
   */
  testAuthEndpoint: async () => {
    console.log('Testing auth endpoint...')
    try {
      const response = await fetch('/api/auth/test', {
        method: 'GET',
        headers: getAuthHeaders()
      })

      const data = await response.json()
      console.log('Auth Test Result:', {
        status: response.status,
        ok: response.ok,
        data
      })
    } catch (error) {
      console.error('Auth test failed:', error)
    }
  },

  /**
   * Test the activities endpoint
   */
  testActivitiesEndpoint: async () => {
    console.log('Testing activities endpoint...')
    try {
      const response = await fetch('/api/activities?limit=5', {
        method: 'GET',
        headers: getAuthHeaders()
      })

      const data = await response.json()
      console.log('Activities Test Result:', {
        status: response.status,
        ok: response.ok,
        data
      })
    } catch (error) {
      console.error('Activities test failed:', error)
    }
  },

  /**
   * Clear authentication state
   */
  clearAuth: () => {
    localStorage.removeItem('jwt_token')
    console.log('Authentication cleared. Please reload the page and login again.')
  }
}

// Make debugAuth available globally
if (typeof window !== 'undefined') {
  window.debugAuth = debugAuth
}

export default debugAuth
