'use client'

import { useAuth } from '@/components/auth/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Building, GraduationCap, Users } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const getRoleBasedCards = () => {
    switch (user?.role) {
      case 'superadmin':
        return [
          {
            title: 'Colleges',
            description: 'Manage college information',
            icon: Building,
            href: '/dashboard/colleges',
            color: 'bg-blue-500',
          },
          {
            title: 'Departments',
            description: 'Manage department information',
            icon: Users,
            href: '/dashboard/departments',
            color: 'bg-green-500',
          },
          {
            title: 'Programs',
            description: 'Manage program information',
            icon: GraduationCap,
            href: '/dashboard/programs',
            color: 'bg-purple-500',
          },
          {
            title: 'Subjects',
            description: 'Manage subject information',
            icon: BookOpen,
            href: '/dashboard/subjects',
            color: 'bg-orange-500',
          },
        ]
      case 'instructor':
        return [
          {
            title: 'My Subjects',
            description: 'View and manage your assigned subjects',
            icon: BookOpen,
            href: '/dashboard/subjects',
            color: 'bg-blue-500',
          },
          {
            title: 'My Courses',
            description: 'Manage your course content',
            icon: GraduationCap,
            href: '/dashboard/my-courses',
            color: 'bg-green-500',
          },
        ]
      case 'student':
        return [
          {
            title: 'My Subjects',
            description: 'View your enrolled subjects',
            icon: BookOpen,
            href: '/dashboard/my-subjects',
            color: 'bg-blue-500',
          },
          {
            title: 'Course Content',
            description: 'Access learning materials',
            icon: GraduationCap,
            href: '/dashboard/courses',
            color: 'bg-green-500',
          },
        ]
      default:
        return []
    }
  }

  const cards = getRoleBasedCards()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {getGreeting()}, {user?.firstName}!
        </h1>
        <p className="text-muted-foreground">
          Welcome to your QuestAdmin dashboard
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className={`p-2 rounded-md ${card.color}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg">{card.title}</CardTitle>
                <CardDescription className="mt-2">
                  {card.description}
                </CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your recent actions and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Profile updated</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Account created</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>
              Overview of your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Role</span>
                <span className="text-sm font-medium capitalize">{user?.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Account Status</span>
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Profile</span>
                <span className="text-sm font-medium">
                  {user?.profileCompleted ? 'Complete' : 'Incomplete'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
