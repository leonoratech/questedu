'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    BarChart3,
    BookOpen,
    Clock,
    DollarSign,
    GraduationCap,
    Star,
    TrendingUp,
    Users
} from 'lucide-react'
import React from 'react'

// Mock data - in a real app, this would come from your API
const dashboardStats = {
  totalUsers: 1234,
  totalCourses: 45,
  activeCourses: 32,
  revenue: 25680,
  userGrowth: 12.5,
  courseCompletion: 78.3,
  averageRating: 4.6,
  totalHours: 15420
}

const recentCourses = [
  {
    id: 1,
    title: 'Advanced React Development',
    instructor: 'John Doe',
    students: 234,
    rating: 4.8,
    status: 'active'
  },
  {
    id: 2,
    title: 'Python for Data Science',
    instructor: 'Jane Smith',
    students: 189,
    rating: 4.7,
    status: 'active'
  },
  {
    id: 3,
    title: 'UI/UX Design Fundamentals',
    instructor: 'Mike Johnson',
    students: 156,
    rating: 4.5,
    status: 'draft'
  },
  {
    id: 4,
    title: 'Node.js Backend Development',
    instructor: 'Sarah Wilson',
    students: 98,
    rating: 4.6,
    status: 'active'
  }
]

const recentActivities = [
  {
    id: 1,
    action: 'New user registered',
    user: 'Alice Cooper',
    time: '2 minutes ago',
    type: 'user'
  },
  {
    id: 2,
    action: 'Course completed',
    user: 'Bob Martin',
    course: 'React Basics',
    time: '15 minutes ago',
    type: 'completion'
  },
  {
    id: 3,
    action: 'New course published',
    course: 'GraphQL Advanced',
    instructor: 'Emma Davis',
    time: '1 hour ago',
    type: 'course'
  },
  {
    id: 4,
    action: 'Payment received',
    amount: '$299',
    user: 'Tom Brown',
    time: '2 hours ago',
    type: 'payment'
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
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={dashboardStats.totalUsers.toLocaleString()}
          description="Active learners"
          icon={Users}
          trend={dashboardStats.userGrowth}
        />
        <StatCard
          title="Total Courses"
          value={dashboardStats.totalCourses}
          description={`${dashboardStats.activeCourses} active`}
          icon={BookOpen}
        />
        <StatCard
          title="Revenue"
          value={`$${dashboardStats.revenue.toLocaleString()}`}
          description="This month"
          icon={DollarSign}
          trend={8.2}
        />
        <StatCard
          title="Completion Rate"
          value={`${dashboardStats.courseCompletion}%`}
          description="Average completion"
          icon={TrendingUp}
          trend={2.1}
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
              {recentCourses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{course.title}</h4>
                    <p className="text-xs text-muted-foreground">by {course.instructor}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {course.students}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {course.rating}
                      </span>
                    </div>
                  </div>
                  <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                    {course.status}
                  </Badge>
                </div>
              ))}
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
                      {activity.user && <span className="font-medium">{activity.user}</span>}
                      {activity.course && <span className="font-medium">{activity.course}</span>}
                      {activity.instructor && <span> by {activity.instructor}</span>}
                      {activity.amount && <span className="font-medium">{activity.amount}</span>}
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
            <button className="p-4 text-left rounded-lg border hover:bg-accent transition-colors">
              <BookOpen className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">Create Course</h3>
              <p className="text-sm text-muted-foreground">Add a new course to the platform</p>
            </button>
            <button className="p-4 text-left rounded-lg border hover:bg-accent transition-colors">
              <Users className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">Manage Users</h3>
              <p className="text-sm text-muted-foreground">View and manage user accounts</p>
            </button>
            <button className="p-4 text-left rounded-lg border hover:bg-accent transition-colors">
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
