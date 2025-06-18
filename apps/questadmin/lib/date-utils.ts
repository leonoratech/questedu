/**
 * Utility functions for safe date formatting
 * Handles various date formats from Firestore and API responses
 */

/**
 * Safely format a date value to a localized date string
 * Handles Firestore Timestamps, Date objects, ISO strings, and numbers
 */
export function formatDate(dateValue: any): string {
  if (!dateValue) return 'N/A'
  
  try {
    // Handle Firestore Timestamp objects
    if (dateValue && typeof dateValue === 'object' && dateValue.seconds) {
      return new Date(dateValue.seconds * 1000).toLocaleDateString()
    }
    
    // Handle Date objects
    if (dateValue instanceof Date) {
      return dateValue.toLocaleDateString()
    }
    
    // Handle ISO string dates (most common case from API)
    if (typeof dateValue === 'string') {
      const date = new Date(dateValue)
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString()
      }
    }
    
    // Handle number timestamps (milliseconds)
    if (typeof dateValue === 'number') {
      const date = new Date(dateValue)
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString()
      }
    }
    
    return 'N/A'
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'N/A'
  }
}

/**
 * Safely format a date value to a localized date and time string
 */
export function formatDateTime(dateValue: any): string {
  if (!dateValue) return 'N/A'
  
  try {
    // Handle Firestore Timestamp objects
    if (dateValue && typeof dateValue === 'object' && dateValue.seconds) {
      return new Date(dateValue.seconds * 1000).toLocaleString()
    }
    
    // Handle Date objects
    if (dateValue instanceof Date) {
      return dateValue.toLocaleString()
    }
    
    // Handle ISO string dates
    if (typeof dateValue === 'string') {
      const date = new Date(dateValue)
      if (!isNaN(date.getTime())) {
        return date.toLocaleString()
      }
    }
    
    // Handle number timestamps (milliseconds)
    if (typeof dateValue === 'number') {
      const date = new Date(dateValue)
      if (!isNaN(date.getTime())) {
        return date.toLocaleString()
      }
    }
    
    return 'N/A'
  } catch (error) {
    console.error('Error formatting date time:', error)
    return 'N/A'
  }
}

/**
 * Safely convert various date formats to a Date object
 */
export function toDate(dateValue: any): Date | null {
  if (!dateValue) return null
  
  try {
    // Handle Firestore Timestamp objects
    if (dateValue && typeof dateValue === 'object' && dateValue.seconds) {
      return new Date(dateValue.seconds * 1000)
    }
    
    // Handle Date objects
    if (dateValue instanceof Date) {
      return dateValue
    }
    
    // Handle ISO string dates
    if (typeof dateValue === 'string') {
      const date = new Date(dateValue)
      if (!isNaN(date.getTime())) {
        return date
      }
    }
    
    // Handle number timestamps (milliseconds)
    if (typeof dateValue === 'number') {
      const date = new Date(dateValue)
      if (!isNaN(date.getTime())) {
        return date
      }
    }
    
    return null
  } catch (error) {
    console.error('Error converting to date:', error)
    return null
  }
}

/**
 * Format a date with relative time (e.g., "2 days ago", "just now")
 */
export function formatRelativeTime(dateValue: any): string {
  const date = toDate(dateValue)
  if (!date) return 'N/A'
  
  try {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffSecs < 60) return 'just now'
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    
    // For older dates, show the formatted date
    return formatDate(date)
  } catch (error) {
    console.error('Error formatting relative time:', error)
    return formatDate(date)
  }
}
