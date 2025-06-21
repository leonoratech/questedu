'use client'

import { AdminLayout } from '@/components/AdminLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { AdminUser, getUsers, getUserStats, toggleUserStatus } from '@/data/services/admin-user-service'
import { formatDate } from '@/lib/date-utils'
import {
    BookOpen,
    GraduationCap,
    Search,
    UserCheck,
    Users,
    UserX
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface UserCardProps {
  user: AdminUser
  onStatusToggle: (userId: string, currentStatus: boolean) => void
  isSuperAdmin: boolean
}

function UserCard({ user, onStatusToggle, isSuperAdmin }: UserCardProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin': return 'destructive' as const
      case 'instructor': return 'default' as const
      case 'student': return 'secondary' as const
      default: return 'secondary' as const
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin': return <Users className="h-4 w-4 text-red-600" />
      case 'instructor': return <GraduationCap className="h-4 w-4" />
      case 'student': return <BookOpen className="h-4 w-4" />
      default: return <Users className="h-4 w-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              {getRoleIcon(user.role)}
            </div>
            <div>
              <CardTitle className="text-lg">
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user.email.split('@')[0]}
              </CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getRoleColor(user.role)}>
              {user.role}
            </Badge>
            <Badge variant={user.isActive ? 'default' : 'secondary'}>
              {user.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* User Info */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-muted-foreground">Joined</div>
              <div className="text-sm font-medium">{formatDate(user.createdAt)}</div>
            </div>
            {user.lastLoginAt && (
              <div>
                <div className="text-xs text-muted-foreground">Last Login</div>
                <div className="text-sm font-medium">{formatDate(user.lastLoginAt)}</div>
              </div>
            )}
            {user.department && (
              <div>
                <div className="text-xs text-muted-foreground">Department</div>
                <div className="text-sm font-medium">{user.department}</div>
              </div>
            )}
          </div>

          {/* User Actions - Only activate/deactivate for superadmins */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              {isSuperAdmin && user.role !== 'superadmin' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStatusToggle(user.id, user.isActive)}
                >
                  {user.isActive ? (
                    <>
                      <UserX className="h-4 w-4 mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Activate
                    </>
                  )}
                </Button>
              )}
              {user.role === 'superadmin' && (
                <Badge variant="destructive" className="text-xs">
                  Super Admin - Protected Account
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              User ID: {user.id.slice(0, 8)}...
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function SuperAdminUsersPage() {
  const { userProfile } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    superAdminCount: 0,
    instructorCount: 0,
    studentCount: 0,
    newUsersThisMonth: 0
  })

  const isSuperAdmin = userProfile?.role === 'superadmin'

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setError(null)
        const [usersData, statsData] = await Promise.all([
          getUsers(),
          getUserStats()
        ])
        setUsers(usersData)
        setStats(statsData)
      } catch (error) {
        console.error('Error loading users:', error)
        setError('Failed to load users')
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await toggleUserStatus(userId, !currentStatus)
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, isActive: !currentStatus } : user
      ))
      // Update stats
      const updatedStats = await getUserStats()
      setStats(updatedStats)
    } catch (error) {
      console.error('Error updating user status:', error)
      setError('Failed to update user status')
    }
  }

  // Filter users based on search term and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    return matchesSearch && matchesRole
  })

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="h-8 bg-muted rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded animate-pulse" />
            ))}
          </div>
          <div className="h-96 bg-muted rounded animate-pulse" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">User Management</h1>
              <p className="text-muted-foreground">Manage platform users - activate/deactivate accounts</p>
            </div>
            <div className="text-sm text-muted-foreground">
              Super Admin Access
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Badge 
                variant={selectedRole === 'all' ? 'default' : 'outline'} 
                className="cursor-pointer"
                onClick={() => setSelectedRole('all')}
              >
                All ({stats.totalUsers})
              </Badge>
              <Badge 
                variant={selectedRole === 'superadmin' ? 'default' : 'outline'} 
                className="cursor-pointer"
                onClick={() => setSelectedRole('superadmin')}
              >
                Super Admins ({stats.superAdminCount})
              </Badge>
              <Badge 
                variant={selectedRole === 'instructor' ? 'default' : 'outline'} 
                className="cursor-pointer"
                onClick={() => setSelectedRole('instructor')}
              >
                Instructors ({stats.instructorCount})
              </Badge>
              <Badge 
                variant={selectedRole === 'student' ? 'default' : 'outline'} 
                className="cursor-pointer"
                onClick={() => setSelectedRole('student')}
              >
                Students ({stats.studentCount})
              </Badge>
            </div>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeUsers} active
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.superAdminCount}</div>
                <p className="text-xs text-muted-foreground">
                  Protected accounts
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Instructors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.instructorCount}</div>
                <p className="text-xs text-muted-foreground">
                  Course creators
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.studentCount}</div>
                <p className="text-xs text-muted-foreground">
                  Active learners
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Users List */}
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-16">
                <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No users found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search terms' : 'No users have been created yet'}
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <UserCard 
                  key={user.id} 
                  user={user} 
                  onStatusToggle={handleStatusToggle}
                  isSuperAdmin={isSuperAdmin}
                />
              ))
            )}
          </div>
        </div>
      </AdminLayout>
  )
}
