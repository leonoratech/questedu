import { AdminLayout } from '@/components/AdminLayout'
import { AuthGuard } from '@/components/AuthGuard'

export default function SettingsPage() {
  return (
    <AuthGuard>
      <AdminLayout title="Settings">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Manage platform settings and preferences</p>
          </div>
          
          <div className="text-center py-12">
            <p className="text-muted-foreground">Settings panel coming soon...</p>
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}
