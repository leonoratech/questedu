'use client'

import { AdminLayout } from '@/components/AdminLayout'
import { AuthGuard } from '@/components/AuthGuard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { UserRole } from '@/lib/firebase-auth'
import {
    Edit,
    Mail,
    Plus,
    Search,
    Users
} from 'lucide-react'

// Mock user data
const users = [
  {
    id: 1,
    name: 'Alice Cooper',
    email: 'alice@example.com',
    role: 'student',
    joinDate: '2024-01-15',
    lastActive: '2024-04-10',
    coursesEnrolled: 5,
    coursesCompleted: 2,
    status: 'active'
  },
  {
    id: 2,
    name: 'Bob Martin',
    email: 'bob@example.com',
    role: 'instructor',
    joinDate: '2023-11-20',
    lastActive: '2024-04-12',
    coursesEnrolled: 0,
    coursesCompleted: 0,
    coursesTeaching: 3,
    status: 'active'
  },
  {
    id: 3,
    name: 'Carol Davis',
    email: 'carol@example.com',
    role: 'student',
    joinDate: '2024-02-28',
    lastActive: '2024-04-08',
    coursesEnrolled: 3,
    coursesCompleted: 1,
    status: 'active'
  },
  {
    id: 4,
    name: 'David Wilson',
    email: 'david@example.com',
    role: 'admin',
    joinDate: '2023-08-10',
    lastActive: '2024-04-12',
    coursesEnrolled: 0,
    coursesCompleted: 0,
    status: 'active'
  }
]

function UserCard({ user }: { user: typeof users[0] }) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive'
      case 'instructor': return 'default'
      case 'student': return 'secondary'
      default: return 'secondary'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
          <Badge variant={getRoleColor(user.role)}>
            {user.role}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* User Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{user.coursesEnrolled || 0}</div>
              <div className="text-xs text-muted-foreground">Enrolled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{user.coursesCompleted || 0}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            {user.role === 'instructor' && (
              <div className="text-center">
                <div className="text-2xl font-bold">{user.coursesTeaching || 0}</div>
                <div className="text-xs text-muted-foreground">Teaching</div>
              </div>
            )}
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Joined</div>
              <div className="text-sm font-medium">{new Date(user.joinDate).toLocaleDateString()}</div>
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Last active: {new Date(user.lastActive).toLocaleDateString()}
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
  return (
    <AuthGuard requiredRoles={[UserRole.ADMIN]}>
      <AdminLayout title="Users">
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

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="cursor-pointer">All</Badge>
            <Badge variant="outline" className="cursor-pointer">Students</Badge>
            <Badge variant="outline" className="cursor-pointer">Instructors</Badge>
            <Badge variant="outline" className="cursor-pointer">Admins</Badge>
          </div>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">
                Registered users
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === 'student').length}
              </div>
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
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === 'instructor').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Course creators
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === 'admin').length}
              </div>
              <p className="text-xs text-muted-foreground">
                System administrators
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <div className="space-y-4">
          {users.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>        </div>
      </AdminLayout>
    </AuthGuard>
  )
}
