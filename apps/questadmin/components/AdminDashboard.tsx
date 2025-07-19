'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { getUserStats } from '@/data/services/admin-user-service'
import {
  BarChart3,
  Users
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  newUsersThisMonth: number
}

// ActivitySummary interface defined locally since it is not found in models or types
export interface ActivitySummary {
  id: string;
  action: string;
  user: string;
  time: string;
  type: 'activity';
  courseId?: string;
}

// Static fallback activities for when database activities aren't available
const fallbackActivities: ActivitySummary[] = [
  {
    id: '1',
    action: 'Welcome to QuestEdu! Start by creating your first course.',
    user: 'System',
    time: 'Welcome',
    type: 'activity'
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
  const { user, userProfile, hasRole } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0
  })
  const [recentActivities, setRecentActivities] = useState<ActivitySummary[]>(fallbackActivities)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setError(null)
        
        // Load user statistics
        const userStats = await getUserStats()
        
        setStats({
          totalUsers: userStats.totalUsers,
          activeUsers: userStats.activeUsers,
          newUsersThisMonth: userStats.newUsersThisMonth
        })

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
        {/* Analytics quick action removed for single-college model */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              {recentActivities.length > 0 ? recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 text-sm">
                  <span className="font-medium">{activity.user}</span>
                  <span className="text-muted-foreground">{activity.action}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{activity.time}</span>
                </div>
              )) : (
                <div className="text-muted-foreground text-sm">No recent activities.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {/* (Removed for single-college model) */}
    </div>
  )
}
