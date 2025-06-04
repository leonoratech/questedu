import { AdminLayout } from '@/components/AdminLayout'

export default function AnalyticsPage() {
  return (
    <AdminLayout title="Analytics">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Platform performance and insights</p>
        </div>
        
        <div className="text-center py-12">
          <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
        </div>
      </div>
    </AdminLayout>
  )
}
