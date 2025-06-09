// JWT utilities for authentication
import jwt from 'jsonwebtoken'
import { UserRole } from './firebase-auth'

export interface JWTPayload {
  uid: string
  email: string
  firstName: string
  lastName: string
  displayName: string | null
  role: UserRole
  isActive: boolean
  iat?: number
  exp?: number
}

// Get JWT secret from environment variable with secure validation
const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET
  
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required but not set')
  }
  
  if (secret === 'your-super-secret-jwt-key-change-in-production') {
    throw new Error('JWT_SECRET is using the default value. Please set a secure secret in production.')
  }
  
  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long for security')
  }
  
  return secret
})()

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'

/**
 * Generate JWT token with user information as claims
 */
export function generateJWTToken(userPayload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  try {
    // Use any type to bypass TypeScript issues with jsonwebtoken
    const token = (jwt as any).sign(userPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
    return token as string
  } catch (error) {
    console.error('JWT token generation failed:', error)
    throw new Error('Failed to generate JWT token')
  }
}

/**
 * Verify and decode JWT token
 */
export function verifyJWTToken(token: string): JWTPayload | null {
  try {
    // Use any type to bypass TypeScript issues with jsonwebtoken
    const decoded = (jwt as any).verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

/**
 * Extract JWT token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) {
    return null
  }

  // Expected format: "Bearer <token>"
  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null
  }

  return parts[1]
}

/**
 * Refresh token (generate new token with updated expiration)
 */
export function refreshJWTToken(currentPayload: JWTPayload): string {
  // Remove iat and exp from current payload and generate new token
  const { iat, exp, ...userPayload } = currentPayload
  return generateJWTToken(userPayload)
}
