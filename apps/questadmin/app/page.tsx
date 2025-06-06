import { AdminDashboard } from '@/components/AdminDashboard'
import { AdminLayout } from '@/components/AdminLayout'
import { AuthGuard } from '@/components/AuthGuard'

export default function Home() {
  return (
    <AuthGuard>
      <AdminLayout title="Dashboard">
        <AdminDashboard />
      </AdminLayout>
    </AuthGuard>
  )
}
