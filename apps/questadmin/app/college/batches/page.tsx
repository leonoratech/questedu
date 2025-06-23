'use client'

import { AdminLayout } from '@/components/AdminLayout'
import { AuthGuard } from '@/components/AuthGuard'
import { BatchManager } from '@/components/BatchManager'
import { useAuth } from '@/contexts/AuthContext'
import { getAuthHeaders, UserRole } from '@/data/config/firebase-auth'
import { College, getCollegeById } from '@/data/services/college-service'
import { ArrowLeft, GraduationCap } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function CollegeBatchesPage() {
  const router = useRouter()
  const { userProfile } = useAuth()
  const [college, setCollege] = useState<College | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdministrator, setIsAdministrator] = useState(false)

  useEffect(() => {
    loadCollegeData()
  }, [userProfile])

  const checkAdministratorStatus = async () => {
    if (!userProfile?.collegeId) return false
    
    try {
      const response = await fetch(`/api/colleges/${userProfile.collegeId}/check-admin`, {
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const data = await response.json()
        return data.isAdministrator || false
      }
    } catch (error) {
      console.error('Error checking administrator status:', error)
    }
    
    return false
  }

  const loadCollegeData = async () => {
    if (!userProfile) {
      setLoading(false)
      return
    }

    // Check if user has college association
    if (!userProfile.collegeId) {
      setError('No college association found. Please update your profile to associate with a college.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Load college information
      const collegeData = await getCollegeById(userProfile.collegeId)
      
      if (!collegeData) {
        setError('College information not found. Please contact support.')
        return
      }

      setCollege(collegeData)
      
      // Check admin status only for instructors
      if (userProfile.role === UserRole.INSTRUCTOR) {
        const adminStatus = await checkAdministratorStatus()
        setIsAdministrator(adminStatus || false)
      }
    } catch (error) {
      console.error('Error loading college data:', error)
      setError('Failed to load college information. Please try again.')
      toast.error('Failed to load college information')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AuthGuard requiredRoles={[UserRole.INSTRUCTOR, UserRole.STUDENT]}>
        <AdminLayout>
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading batch information...</span>
            </div>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  if (error) {
    return (
      <AuthGuard requiredRoles={[UserRole.INSTRUCTOR, UserRole.STUDENT]}>
        <AdminLayout>
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Batches Unavailable</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => router.push('/profile')}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Update Profile
                </button>
                <button
                  onClick={loadCollegeData}
                  className="px-4 py-2 border border-border rounded-md hover:bg-accent"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  if (!college) {
    return null
  }

  return (
    <AuthGuard requiredRoles={[UserRole.INSTRUCTOR, UserRole.STUDENT]}>
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Link href="/college">
                <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                  Back to College
                </button>
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Batch Management</h1>
                <p className="text-muted-foreground">
                  Manage batch instances for {college.name}
                </p>
              </div>
            </div>
          </div>

          {/* Batch Management Component */}
          <BatchManager 
            collegeId={college.id!}
            collegeName={college.name}
            isAdministrator={isAdministrator}
          />
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}
