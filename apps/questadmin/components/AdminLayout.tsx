'use client'

import { useNavigation } from '@/contexts/NavigationContext'
import { cn } from '@/lib/utils'
import React from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

interface AdminLayoutProps {
  children: React.ReactNode
  title?: string
  userRole?: 'admin' | 'instructor' | 'student'
}

export function AdminLayout({ children, title, userRole = 'admin' }: AdminLayoutProps) {
  const { isSidebarOpen } = useNavigation()

  return (
    <div className="min-h-screen bg-background">
      <Sidebar userRole={userRole} />
      
      {/* Main content */}
      <div className={cn(
        "transition-all duration-300 ease-in-out lg:ml-64",
        // On mobile, don't offset when sidebar is closed
        "ml-0"
      )}>
        <Header title={title} />
        
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
