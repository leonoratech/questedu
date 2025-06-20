import { requireAuth } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'
import { UserRole } from '../../firebase-server'

/**
 * GET /api/auth/test
 * Test endpoint to debug authentication issues
 */
export async function GET(request: NextRequest) {
  try {
    // Check for Authorization header
    const authHeader = request.headers.get('Authorization')
    console.log('Auth header present:', !!authHeader)
    
    if (!authHeader) {
      return NextResponse.json({
        success: false,
        error: 'No Authorization header found',
        debug: {
          headers: Object.fromEntries(request.headers.entries())
        }
      }, { status: 401 })
    }

    // Try to authenticate
    const authResult = await requireAuth()(request)
    
    if ('error' in authResult) {
      return NextResponse.json({
        success: false,
        error: authResult.error,
        status: authResult.status,
        debug: {
          authHeader: authHeader ? 'present' : 'missing',
          headerFormat: authHeader?.startsWith('Bearer ') ? 'correct' : 'incorrect'
        }
      }, { status: authResult.status })
    }

    const { user } = authResult

    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      },
      debug: {
        isInstructor: user.role === UserRole.INSTRUCTOR,
        canAccessActivities: user.role === UserRole.INSTRUCTOR && user.isActive
      }
    })
  } catch (error) {
    console.error('Auth test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      debug: {
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 })
  }
}
