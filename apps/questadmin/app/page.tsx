'use client'

import { AdminDashboard } from '@/components/AdminDashboard'
import { AdminLayout } from '@/components/AdminLayout'
import { AuthGuard } from '@/components/AuthGuard'
import { StudentDashboard } from '@/components/StudentDashboard'
import { SuperAdminDashboard } from '@/components/SuperAdminDashboard'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/data/config/firebase-auth'

export default function Home() {
  const { userProfile } = useAuth()

  return (
    <AuthGuard>
      <AdminLayout title="Dashboard">
        {userProfile?.role === UserRole.STUDENT ? (
          <StudentDashboard />
        ) : userProfile?.role === UserRole.SUPERADMIN ? (
          <SuperAdminDashboard />
        ) : (
          <AdminDashboard />
        )}
      </AdminLayout>
    </AuthGuard>
  )
}
