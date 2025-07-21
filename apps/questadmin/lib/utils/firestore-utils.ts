/**
 * Utility functions for Firestore operations
 */

/**
 * Removes undefined values from an object to prevent Firestore errors
 * @param obj - The object to clean
 * @returns A new object without undefined values
 */
export function removeUndefinedValues<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: Partial<T> = {}
  
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      // Also remove empty strings if they represent optional fields
      if (typeof value === 'string' && value.trim() === '') {
        continue
      }
      cleaned[key as keyof T] = value
    }
  }
  
  return cleaned
}

/**
 * Recursively removes undefined values from nested objects
 * @param obj - The object to clean
 * @returns A new object without undefined values
 */
export function deepRemoveUndefinedValues<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj
  }
  
  if (Array.isArray(obj)) {
    return obj.map(deepRemoveUndefinedValues) as T
  }
  
  if (typeof obj === 'object') {
    const cleaned = {} as T
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        // Also remove empty strings if they represent optional fields
        if (typeof value === 'string' && value.trim() === '') {
          continue
        }
        (cleaned as any)[key] = deepRemoveUndefinedValues(value)
      }
    }
    return cleaned
  }
  
  return obj
}
