import { UserRole } from '@/data/models/user-model'
import { UserRepository } from '@/data/repository/user-service'
import { requireAuth } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Require instructor or superadmin role for user management
  const authResult = await requireAuth()(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  const { user } = authResult

  // Check if user has permission to manage users
  if (user.role !== UserRole.INSTRUCTOR && user.role !== UserRole.SUPERADMIN) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    )
  }
  try {
    const url = new URL(request.url)
    const role = url.searchParams.get('role') as UserRole | null
    const search = url.searchParams.get('search')
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100) // Cap at 100
    const stats = url.searchParams.get('stats') === 'true'
    
    // Validate role parameter
    if (role && !Object.values(UserRole).includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role parameter' },
        { status: 400 }
      )
    }
    
    if (stats) {
      // Return user statistics using repository
      const userRepo = new UserRepository();
      const userStats = await userRepo.getUserStats();
      
      return NextResponse.json({
        success: true,
        stats: {
          total: userStats.totalUsers,
          superadmins: userStats.usersByRole['superadmin'] || 0,
          instructors: userStats.usersByRole['instructor'] || 0,
          students: userStats.usersByRole['student'] || 0,
          active: userStats.activeUsers,
          newThisMonth: userStats.newUsersLast30Days
        }
      })
    }
    
    // Build query for regular user listing using repository
    const userRepo = new UserRepository();
    const users = await userRepo.searchUsers({
      role: role || undefined,
      search: search || undefined,
      limit
    });

    return NextResponse.json({
      success: true,
      users
    })

  } catch (error: any) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'An error occurred fetching users' },
      { status: 500 }
    )
  }
}
