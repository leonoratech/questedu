'use client'

import { AdminLayout } from '@/components/AdminLayout'
import { AuthGuard } from '@/components/AuthGuard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/data/config/firebase-auth'
import { AdminUser, getUsers, getUserStats, toggleUserStatus, updateUserRole } from '@/data/services/admin-user-service'
import { formatDate } from '@/lib/date-utils'
import {
    BookOpen,
    Edit,
    GraduationCap,
    Mail,
    Plus,
    Search,
    UserCheck,
    Users,
    UserX
} from 'lucide-react'
import { useEffect, useState } from 'react'

function UserCard({ user, onRoleChange, onStatusToggle, canEdit }: { 
  user: AdminUser
  onRoleChange: (userId: string, newRole: 'instructor' | 'student') => void
  onStatusToggle: (userId: string, currentStatus: boolean) => void
  canEdit: boolean
}) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'instructor': return 'default' as const
      case 'student': return 'secondary' as const
      default: return 'secondary' as const
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
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
              <CardTitle className="text-lg">{user.firstName} {user.lastName}</CardTitle>
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

          {/* User Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              {canEdit && (
                <>
                  <Select
                    value={user.role}
                    onValueChange={(value: string) => onRoleChange(user.id, value as 'instructor' | 'student')}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="instructor">Instructor</SelectItem>
                    </SelectContent>
                  </Select>
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
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Message
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function UsersPage() {
  const { userProfile } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    instructorCount: 0,
    studentCount: 0
  })

  const canEdit = userProfile?.role === 'instructor'

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

  const handleRoleChange = async (userId: string, newRole: 'instructor' | 'student') => {
    try {
      await updateUserRole(userId, newRole)
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ))
      // Update stats
      const updatedStats = await getUserStats()
      setStats(updatedStats)
    } catch (error) {
      console.error('Error updating user role:', error)
      setError('Failed to update user role')
    }
  }

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
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    return matchesSearch && matchesRole
  })

  if (loading) {
    return (
      <AuthGuard requiredRole={UserRole.INSTRUCTOR}>
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
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredRole={UserRole.INSTRUCTOR}>
      <AdminLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Users</h1>
              <p className="text-muted-foreground">Manage platform users and their roles</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
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
                variant={selectedRole === 'student' ? 'default' : 'outline'} 
                className="cursor-pointer"
                onClick={() => setSelectedRole('student')}
              >
                Students ({stats.studentCount})
              </Badge>
              <Badge 
                variant={selectedRole === 'instructor' ? 'default' : 'outline'} 
                className="cursor-pointer"
                onClick={() => setSelectedRole('instructor')}
              >
                Instructors ({stats.instructorCount})
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
                <CardTitle className="text-sm font-medium">Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.studentCount}</div>
                <p className="text-xs text-muted-foreground">
                  Active learners
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
                  onRoleChange={handleRoleChange}
                  onStatusToggle={handleStatusToggle}
                  canEdit={canEdit}
                />
              ))
            )}
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}
