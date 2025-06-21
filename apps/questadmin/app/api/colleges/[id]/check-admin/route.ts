import { isCollegeAdministrator } from '@/lib/college-admin-auth'
import { requireAuth } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'
import { UserRole } from '../../../firebase-server'

// GET /api/colleges/[id]/check-admin - Check if user is college administrator
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth()(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  try {
    const { id: collegeId } = await params
    const { user } = authResult

    // Superadmins are considered administrators for all colleges
    if (user.role === UserRole.SUPERADMIN) {
      return NextResponse.json({ 
        success: true,
        isAdministrator: true,
        role: 'superadmin'
      })
    }

    // Check if user is a college administrator
    const isAdmin = await isCollegeAdministrator(user.uid, collegeId)

    return NextResponse.json({ 
      success: true,
      isAdministrator: isAdmin,
      role: isAdmin ? 'administrator' : 'instructor'
    })
  } catch (error) {
    console.error('Error checking administrator status:', error)
    return NextResponse.json(
      { error: 'Failed to check administrator status' },
      { status: 500 }
    )
  }
}
