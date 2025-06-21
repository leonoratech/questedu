'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { getUserStats } from '@/data/services/admin-user-service'
import {
    Activity,
    Shield,
    UserCheck,
    Users
} from 'lucide-react'
import React, { useEffect, useState } from 'react'

interface SuperAdminStats {
  totalUsers: number
  activeUsers: number
  superAdminCount: number
  instructorCount: number
  studentCount: number
  newUsersThisMonth: number
}

function StatCard({ title, value, description, icon: Icon, trend }: {
  title: string
  value: string | number
  description: string
  icon: React.ElementType
  trend?: number
}) {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{description}</span>
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

export function SuperAdminDashboard() {
  const { user, userProfile } = useAuth()
  const [stats, setStats] = useState<SuperAdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    superAdminCount: 0,
    instructorCount: 0,
    studentCount: 0,
    newUsersThisMonth: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setError(null)
        
        // Load only user statistics - no course data
        const userStats = await getUserStats()
        
        setStats({
          totalUsers: userStats.totalUsers,
          activeUsers: userStats.activeUsers,
          superAdminCount: userStats.superAdminCount,
          instructorCount: userStats.instructorCount,
          studentCount: userStats.studentCount,
          newUsersThisMonth: userStats.newUsersThisMonth
        })
        
      } catch (error) {
        console.error('Error loading super admin dashboard data:', error)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
            <p className="text-purple-100">
              Welcome back, {userProfile?.firstName || user?.email}! Manage platform users and system administration.
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          description={`${stats.activeUsers} active`}
          icon={Users}
          trend={stats.newUsersThisMonth > 0 ? Math.round((stats.newUsersThisMonth / stats.totalUsers) * 100) : undefined}
        />
        <StatCard
          title="Super Admins"
          value={stats.superAdminCount}
          description="Protected accounts"
          icon={Shield}
        />
        <StatCard
          title="Instructors"
          value={stats.instructorCount}
          description="Course creators"
          icon={UserCheck}
        />
        <StatCard
          title="Students"
          value={stats.studentCount}
          description="Active learners"
          icon={Activity}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <a href="/users" className="block">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Manage Users
              </CardTitle>
              <CardDescription>
                View, activate, and deactivate user accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Access the simplified user management interface designed for super admins.
              </p>
            </CardContent>
          </a>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <a href="/settings" className="block">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                System Settings
              </CardTitle>
              <CardDescription>
                Configure platform-wide settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage system configuration and administrative settings.
              </p>
            </CardContent>
          </a>
        </Card>
      </div>

      {/* Recent Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
          <CardDescription>Platform health and user activity summary</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Platform Health</span>
              <Badge variant="default">Operational</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">User Growth</span>
              <span className="text-sm text-muted-foreground">
                {stats.newUsersThisMonth} new users this month
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Rate</span>
              <span className="text-sm text-muted-foreground">
                {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% users active
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
