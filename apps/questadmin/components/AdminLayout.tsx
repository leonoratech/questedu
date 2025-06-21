'use client'

import { useNavigation } from '@/contexts/NavigationContext'
import React from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

interface AdminLayoutProps {
  children: React.ReactNode
  title?: string
  userRole?: 'superadmin' | 'admin' | 'instructor' | 'student'
}

export function AdminLayout({ children, title, userRole = 'admin' }: AdminLayoutProps) {
  const { isSidebarOpen } = useNavigation()

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <Sidebar userRole={userRole} />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} />
        
        <main className="flex-1 p-4 lg:p-6 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}
