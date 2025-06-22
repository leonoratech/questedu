'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigation } from '@/contexts/NavigationContext'
import { cn } from '@/lib/utils'
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  Search,
  Settings,
  Users,
  X
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface SidebarProps {
  userRole?: 'superadmin' | 'admin' | 'instructor' | 'student'
}

interface NavigationItem {
  title: string
  href?: string
  icon: any
  roles: string[]
  subItems?: NavigationSubItem[]
}

interface NavigationSubItem {
  title: string
  href: string
  icon: any
  roles: string[]
}

const navigationItems: NavigationItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    roles: ['superadmin', 'admin', 'instructor']
  },
  {
    title: 'Browse Courses',
    href: '/browse-courses',
    icon: Search,
    roles: ['superadmin', 'student', 'instructor']
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
    title: 'College',
    href: '/college',
    icon: GraduationCap,
    roles: ['instructor', 'student'],
    subItems: [
      {
        title: 'Programs',
        href: '/college/programs',
        icon: GraduationCap,
        roles: ['instructor', 'student']
      }
    ]
  },
  {
    title: 'Colleges',
    href: '/colleges',
    icon: GraduationCap,
    roles: ['superadmin']
  },
  {
    title: 'Users',
    href: '/users',
    icon: Users,
    roles: ['superadmin', 'admin']
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    roles: ['superadmin', 'admin', 'instructor']
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['superadmin', 'admin', 'instructor', 'student']
  }
]

export function Sidebar({ userRole = 'admin' }: SidebarProps) {
  const { isSidebarOpen, closeSidebar } = useNavigation()
  const { userProfile } = useAuth()
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['College']))

  // Use the actual user role from userProfile if available, otherwise fallback to prop
  const actualUserRole = userProfile?.role || userRole

  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(actualUserRole)
  )

  const toggleExpanded = (itemTitle: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemTitle)) {
      newExpanded.delete(itemTitle)
    } else {
      newExpanded.add(itemTitle)
    }
    setExpandedItems(newExpanded)
  }

  // Check if any sub-item is active
  const isParentActive = (item: NavigationItem) => {
    if (item.href && pathname === item.href) return true
    return item.subItems?.some(subItem => pathname === subItem.href) || false
  }

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
                const isActive = isParentActive(item)
                const hasSubItems = item.subItems && item.subItems.length > 0
                const isExpanded = expandedItems.has(item.title)
                const filteredSubItems = item.subItems?.filter(subItem => 
                  subItem.roles.includes(actualUserRole)
                ) || []
                
                return (
                  <li key={item.title}>
                    {/* Main navigation item */}
                    {item.href ? (
                      <Link
                        href={item.href}
                        onClick={closeSidebar}
                        className={cn(
                          "flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        )}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5" />
                          <span>{item.title}</span>
                        </div>
                        {hasSubItems && filteredSubItems.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              toggleExpanded(item.title)
                            }}
                            className="p-1 hover:bg-white/10 rounded"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </Link>
                    ) : (
                      <button
                        onClick={() => hasSubItems && toggleExpanded(item.title)}
                        className={cn(
                          "flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        )}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5" />
                          <span>{item.title}</span>
                        </div>
                        {hasSubItems && filteredSubItems.length > 0 && (
                          <div className="p-1">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </div>
                        )}
                      </button>
                    )}
                    
                    {/* Sub-navigation items */}
                    {hasSubItems && isExpanded && filteredSubItems.length > 0 && (
                      <ul className="ml-4 mt-2 space-y-1">
                        {filteredSubItems.map((subItem) => {
                          const SubIcon = subItem.icon
                          const isSubActive = pathname === subItem.href
                          
                          return (
                            <li key={subItem.href}>
                              <Link
                                href={subItem.href}
                                onClick={closeSidebar}
                                className={cn(
                                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors",
                                  isSubActive
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                )}
                              >
                                <SubIcon className="w-4 h-4" />
                                <span>{subItem.title}</span>
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    )}
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
