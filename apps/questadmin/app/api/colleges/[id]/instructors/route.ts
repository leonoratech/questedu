import { getAvailableInstructors } from '@/data/services/subject-service'
import { isCollegeAdministrator } from '@/lib/college-admin-auth'
import { getCurrentUser } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/colleges/[id]/instructors
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: collegeId } = await params

    // Check if user is a college administrator for this college
    const isAdmin = await isCollegeAdministrator(user.uid, collegeId)
    if (!isAdmin && user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const instructors = await getAvailableInstructors(collegeId)
    return NextResponse.json({ instructors })

  } catch (error) {
    console.error('Error fetching instructors:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
