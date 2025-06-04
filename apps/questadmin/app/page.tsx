import { AdminDashboard } from '@/components/AdminDashboard'
import { AdminLayout } from '@/components/AdminLayout'

export default function Home() {
  return (
    <AdminLayout title="Dashboard">
      <AdminDashboard />
    </AdminLayout>
  )
}
