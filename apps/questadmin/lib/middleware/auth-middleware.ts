import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    uid: string
    email: string
    role: string
    id: string
  }
}

export function withAuth<T extends any[]>(
  handler: (req: AuthenticatedRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T) => {
    try {
      const token = request.cookies.get('auth-token')?.value

      if (!token) {
        return NextResponse.json(
          { message: 'Authentication required' },
          { status: 401 }
        )
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
      
      // Add user to request
      const authenticatedRequest = request as AuthenticatedRequest
      authenticatedRequest.user = {
        uid: decoded.uid,
        email: decoded.email,
        role: decoded.role,
        id: decoded.id,
      }

      return await handler(authenticatedRequest, ...args)

    } catch (error: any) {
      console.error('Authentication error:', error)
      return NextResponse.json(
        { message: 'Invalid authentication token' },
        { status: 401 }
      )
    }
  }
}

export function withRole(allowedRoles: string[]) {
  return function<T extends any[]>(
    handler: (req: AuthenticatedRequest, ...args: T) => Promise<NextResponse>
  ) {
    return async (request: NextRequest, ...args: T) => {
      try {
        const token = request.cookies.get('auth-token')?.value

        if (!token) {
          return NextResponse.json(
            { message: 'Authentication required' },
            { status: 401 }
          )
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
        
        // Add user to request
        const authenticatedRequest = request as AuthenticatedRequest
        authenticatedRequest.user = {
          uid: decoded.uid,
          email: decoded.email,
          role: decoded.role,
          id: decoded.id,
        }

        if (!authenticatedRequest.user || !allowedRoles.includes(authenticatedRequest.user.role)) {
          return NextResponse.json(
            { message: 'Insufficient permissions' },
            { status: 403 }
          )
        }

        return await handler(authenticatedRequest, ...args)

      } catch (error: any) {
        console.error('Authentication error:', error)
        return NextResponse.json(
          { message: 'Invalid authentication token' },
          { status: 401 }
        )
      }
    }
  }
}
