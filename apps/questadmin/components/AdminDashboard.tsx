'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { AdminCourse, getCourses, getCourseStats } from '@/lib/admin-course-service'
import { getUserStats } from '@/lib/admin-user-service'
import {
  BarChart3,
  BookOpen,
  Clock,
  GraduationCap,
  Star,
  Users
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

interface DashboardStats {
  totalUsers: number
  totalCourses: number
  publishedCourses: number
  draftCourses: number
  totalEnrollments: number
  averageRating: number
  activeUsers: number
  newUsersThisMonth: number
}

const recentActivities = [
  {
    id: 1,
    action: 'Authentication system activated',
    user: 'System',
    time: '5 minutes ago',
    type: 'system'
  },
  {
    id: 2,
    action: 'Course management enabled',
    user: 'Admin',
    time: '10 minutes ago',
    type: 'system'
  },
  {
    id: 3,
    action: 'User profiles configured',
    user: 'System',
    time: '15 minutes ago',
    type: 'system'
  },
  {
    id: 4,
    action: 'Dashboard initialized',
    user: 'Admin',
    time: '20 minutes ago',
    type: 'system'
  }
]

function StatCard({ title, value, description, icon: Icon, trend }: {
  title: string
  value: string | number
  description: string
  icon: React.ElementType
  trend?: number
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <span>{description}</span>
          {trend && (
            <Badge variant={trend > 0 ? "default" : "destructive"} className="text-xs">
              {trend > 0 ? '+' : ''}{trend}%
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCourses: 0,
    publishedCourses: 0,
    draftCourses: 0,
    totalEnrollments: 0,
    averageRating: 0,
    activeUsers: 0,
    newUsersThisMonth: 0
  })
  const [recentCourses, setRecentCourses] = useState<AdminCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setError(null)
        
        // Load course statistics and user statistics in parallel
        const [courseStats, userStats] = await Promise.all([
          getCourseStats(),
          getUserStats()
        ])
        
        // Load recent courses (limit to 5)
        const courses = await getCourses()
        console.log('Loaded courses for dashboard:', courses)
        console.log('Sample course instructor data:', courses.map(c => ({ id: c.id, title: c.title, instructor: c.instructor })))
        const sortedCourses = courses.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0)
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0)
          return dateB.getTime() - dateA.getTime()
        }).slice(0, 5)
        
        setStats({
          totalUsers: userStats.totalUsers,
          totalCourses: courseStats?.totalCourses || 0,
          publishedCourses: courseStats?.publishedCourses || 0,
          draftCourses: courseStats?.draftCourses || 0,
          totalEnrollments: courseStats?.totalEnrollments || 0,
          averageRating: courseStats?.averageRating || 0,
          activeUsers: userStats.activeUsers,
          newUsersThisMonth: userStats.newUsersThisMonth
        })
        
        setRecentCourses(sortedCourses)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        setError('Failed to load dashboard data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadDashboardData()
    }
  }, [user])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse mb-2" />
                <div className="h-4 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center text-muted-foreground">Loading dashboard data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          description={`${stats.activeUsers} active users`}
          icon={Users}
          trend={stats.newUsersThisMonth > 0 ? ((stats.newUsersThisMonth / stats.totalUsers) * 100) : undefined}
        />
        <StatCard
          title="Total Courses"
          value={stats.totalCourses}
          description={`${stats.publishedCourses} published, ${stats.draftCourses} drafts`}
          icon={BookOpen}
        />
        <StatCard
          title="Total Enrollments"
          value={stats.totalEnrollments.toLocaleString()}
          description="Across all courses"
          icon={GraduationCap}
        />
        <StatCard
          title="Average Rating"
          value={stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0.0'}
          description="Course rating"
          icon={Star}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Recent Courses
            </CardTitle>
            <CardDescription>
              Latest courses added to the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCourses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No courses created yet</p>
                </div>
              ) : (
                recentCourses.map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{course.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        by {course.instructor || 'Unknown Instructor'}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {course.enrollmentCount}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {course.rating ? course.rating.toFixed(1) : '0.0'}
                        </span>
                      </div>
                    </div>
                    <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                      {course.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest platform activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <div className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium">{activity.user}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Frequently used administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => router.push('/courses/create')}
              className="p-4 text-left rounded-lg border hover:bg-accent transition-colors"
            >
              <BookOpen className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">Create Course</h3>
              <p className="text-sm text-muted-foreground">Add a new course to the platform</p>
            </button>
            <button 
              onClick={() => router.push('/users')}
              className="p-4 text-left rounded-lg border hover:bg-accent transition-colors"
            >
              <Users className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">Manage Users</h3>
              <p className="text-sm text-muted-foreground">View and manage user accounts</p>
            </button>
            <button 
              onClick={() => router.push('/analytics')}
              className="p-4 text-left rounded-lg border hover:bg-accent transition-colors"
            >
              <BarChart3 className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">View Analytics</h3>
              <p className="text-sm text-muted-foreground">Check platform performance</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
