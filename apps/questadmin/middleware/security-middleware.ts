// Security middleware for Next.js API routes
import { NextRequest, NextResponse } from 'next/server'

/**
 * CORS middleware for API endpoints
 */
export function corsHeaders() {
  const headers = {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || 'http://localhost:3001',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400', // 24 hours
  }
  return headers
}

/**
 * Security headers middleware
 */
export function securityHeaders() {
  return {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  }
}

/**
 * Rate limiting store (in-memory, replace with Redis in production)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Rate limiting middleware
 */
export function rateLimit(maxRequests = 100, windowMs = 15 * 60 * 1000) {
  return (request: NextRequest) => {
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const now = Date.now()
    const key = `${clientIp}:${request.nextUrl.pathname}`
    
    const limit = rateLimitStore.get(key)
    
    if (!limit || now > limit.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
      return { allowed: true, remaining: maxRequests - 1 }
    }
    
    if (limit.count >= maxRequests) {
      return { 
        allowed: false, 
        remaining: 0,
        resetTime: limit.resetTime 
      }
    }
    
    limit.count++
    return { allowed: true, remaining: maxRequests - limit.count }
  }
}

/**
 * Input sanitization utility
 */
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input.trim().slice(0, 1000) // Limit string length
  }
  
  if (Array.isArray(input)) {
    return input.slice(0, 100).map(sanitizeInput) // Limit array size
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(input)) {
      if (typeof key === 'string' && key.length <= 100) {
        sanitized[key] = sanitizeInput(value)
      }
    }
    return sanitized
  }
  
  return input
}

/**
 * Comprehensive security middleware wrapper
 */
export function withSecurity(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean
    rateLimit?: { maxRequests: number; windowMs: number }
    validateInput?: boolean
  } = {}
) {
  return async (request: NextRequest, context?: any) => {
    try {
      // Add security headers
      const headers = {
        ...corsHeaders(),
        ...securityHeaders()
      }

      // Handle preflight requests
      if (request.method === 'OPTIONS') {
        return new NextResponse(null, { status: 200, headers })
      }

      // Rate limiting
      if (options.rateLimit) {
        const rateCheck = rateLimit(
          options.rateLimit.maxRequests,
          options.rateLimit.windowMs
        )(request)
        
        if (!rateCheck.allowed) {
          return NextResponse.json(
            { error: 'Too many requests' },
            { 
              status: 429,
              headers: {
                ...headers,
                'Retry-After': Math.ceil((rateCheck.resetTime! - Date.now()) / 1000).toString()
              }
            }
          )
        }
      }

      // Input validation and sanitization
      if (options.validateInput && (request.method === 'POST' || request.method === 'PUT')) {
        try {
          const body = await request.json()
          const sanitizedBody = sanitizeInput(body)
          
          // Replace request body with sanitized version
          const newRequest = new NextRequest(request.url, {
            method: request.method,
            headers: request.headers,
            body: JSON.stringify(sanitizedBody)
          })
          
          const response = await handler(newRequest, context)
          
          // Add security headers to response
          Object.entries(headers).forEach(([key, value]) => {
            response.headers.set(key, value)
          })
          
          return response
        } catch (error) {
          return NextResponse.json(
            { error: 'Invalid request body' },
            { status: 400, headers }
          )
        }
      }

      // Call the original handler
      const response = await handler(request, context)
      
      // Add security headers to response
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      
      return response

    } catch (error) {
      console.error('Security middleware error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}
