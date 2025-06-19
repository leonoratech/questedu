'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigation } from '@/contexts/NavigationContext'
import { cn } from '@/lib/utils'
import {
  BarChart3,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Search,
  Settings,
  Users,
  X
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  userRole?: 'admin' | 'instructor' | 'student'
}

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    roles: ['admin', 'instructor']
  },
  {
    title: 'Browse Courses',
    href: '/browse-courses',
    icon: Search,
    roles: ['student']
  },
  {
    title: 'My Courses',
    href: '/my-courses',
    icon: BookOpen,
    roles: ['admin', 'instructor']
  },
  {
    title: 'My Enrolled Courses',
    href: '/my-enrolled-courses',
    icon: BookOpen,
    roles: ['student']
  },
  {
    title: 'Active Courses',
    href: '/active-courses',
    icon: GraduationCap,
    roles: ['admin', 'instructor', 'student']
  },
  {
    title: 'Users',
    href: '/users',
    icon: Users,
    roles: ['admin']
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    roles: ['admin', 'instructor']
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['admin', 'instructor', 'student']
  }
]

export function Sidebar({ userRole = 'admin' }: SidebarProps) {
  const { isSidebarOpen, closeSidebar } = useNavigation()
  const { userProfile } = useAuth()
  const pathname = usePathname()

  // Use the actual user role from userProfile if available, otherwise fallback to prop
  const actualUserRole = userProfile?.role || userRole

  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(actualUserRole)
  )

  // Generate user display name
  const getUserDisplayName = () => {
    if (userProfile?.firstName && userProfile?.lastName) {
      return `${userProfile.firstName} ${userProfile.lastName}`
    }
    if (userProfile?.displayName) {
      return userProfile.displayName
    }
    if (userProfile?.email) {
      return userProfile.email.split('@')[0] // Use email username as fallback
    }
    return 'User'
  }

  const getUserInitials = () => {
    if (userProfile?.firstName && userProfile?.lastName) {
      return `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(0)}`.toUpperCase()
    }
    if (userProfile?.displayName) {
      const names = userProfile.displayName.split(' ')
      if (names.length >= 2) {
        return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase()
      }
      return userProfile.displayName.charAt(0).toUpperCase()
    }
    return 'U'
  }

  return (
    <>
      {/* Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:relative lg:z-auto lg:transform-none",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">QuestAdmin</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeSidebar}
              className="lg:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {getUserInitials()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{getUserDisplayName()}</p>
                <p className="text-xs text-muted-foreground capitalize">{actualUserRole}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {filteredItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={closeSidebar}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              QuestEdu Admin Panel v1.0
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
