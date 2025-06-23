'use client'

import { AdminLayout } from '@/components/AdminLayout'
import { AuthGuard } from '@/components/AuthGuard'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/data/config/firebase-auth'
import { College, getCollegeById } from '@/data/services/college-service'
import { CollegeStats, getCollegeStats } from '@/data/services/college-stats-service'
import {
  BookOpen,
  Building2,
  Globe,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  School,
  Users
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function CollegePage() {
  const router = useRouter()
  const { userProfile } = useAuth()
  const [college, setCollege] = useState<College | null>(null)
  const [stats, setStats] = useState<CollegeStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCollegeData()
  }, [userProfile])

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

      // Load college information and statistics
      const [collegeData, collegeStats] = await Promise.all([
        getCollegeById(userProfile.collegeId),
        getCollegeStats(userProfile.collegeId)
      ])
      
      if (!collegeData) {
        setError('College information not found. Please contact support.')
        return
      }

      setCollege(collegeData)
      setStats(collegeStats)
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
              <span className="ml-2">Loading college information...</span>
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
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <School className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">College Information Unavailable</h3>
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
              </CardContent>
            </Card>
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
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <School className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{college.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  {college.principalName && (
                    <span className="text-muted-foreground">Principal: {college.principalName}</span>
                  )}
                  <Badge variant={college.isActive ? 'default' : 'secondary'}>
                    {college.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* College Statistics */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    College Statistics
                  </CardTitle>
                  <CardDescription>Student and staff information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats ? (
                      <>
                        <div className="flex items-center justify-between p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Students</span>
                          </div>
                          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.studentCount}</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium text-green-700 dark:text-green-300">Instructors</span>
                          </div>
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">{stats.instructorCount}</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Total Staff</span>
                          </div>
                          <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{stats.staffCount}</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Users</span>
                          </div>
                          <span className="text-lg font-bold text-gray-600 dark:text-gray-400">{stats.totalUsers}</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">Statistics not available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* College Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <School className="h-5 w-5" />
                    College Information
                  </CardTitle>
                  <CardDescription>Basic details about the institution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Details */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                        Basic Details
                      </h3>
                      {college.accreditation && (
                        <div>
                          <div className="text-xs text-muted-foreground">Accreditation</div>
                          <div className="text-sm font-medium">{college.accreditation}</div>
                        </div>
                      )}
                      {college.affiliation && (
                        <div>
                          <div className="text-xs text-muted-foreground">Affiliation</div>
                          <div className="text-sm font-medium">{college.affiliation}</div>
                        </div>
                      )}
                      {college.description && (
                        <div>
                          <div className="text-xs text-muted-foreground">Description</div>
                          <div className="text-sm">{college.description}</div>
                        </div>
                      )}
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                        Contact Information
                      </h3>
                      {college.contact?.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{college.contact.phone}</span>
                        </div>
                      )}
                      {college.contact?.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a 
                            href={`mailto:${college.contact.email}`}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {college.contact.email}
                          </a>
                        </div>
                      )}
                      {college.contact?.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <a 
                            href={college.contact.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address Information */}
              {college.address && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Address
                    </CardTitle>
                    <CardDescription>Physical location of the institution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-1">
                      {college.address.street && <div>{college.address.street}</div>}
                      <div>
                        {[
                          college.address.city,
                          college.address.state,
                          college.address.postalCode
                        ].filter(Boolean).join(', ')}
                      </div>
                      {college.address.country && <div>{college.address.country}</div>}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* College Services Navigation */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  College Services
                </CardTitle>
                <CardDescription>Access college information and services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Programs Link */}
                  <button 
                    onClick={() => router.push('/college/programs')}
                    className="p-4 text-left rounded-lg border hover:bg-accent transition-colors"
                  >
                    <BookOpen className="h-8 w-8 text-primary mb-2" />
                    <h3 className="font-medium">Academic Programs</h3>
                    <p className="text-sm text-muted-foreground">Browse available academic programs</p>
                  </button>
                  
                  {/* Batches Management - For instructors only */}
                  {userProfile?.role === UserRole.INSTRUCTOR && (
                    <button 
                      onClick={() => router.push('/college/batches')}
                      className="p-4 text-left rounded-lg border hover:bg-accent transition-colors"
                    >
                      <GraduationCap className="h-8 w-8 text-primary mb-2" />
                      <h3 className="font-medium">Batches</h3>
                      <p className="text-sm text-muted-foreground">Manage program batch instances</p>
                    </button>
                  )}
                  
                  {/* Students Directory - For instructors */}
                  {userProfile?.role === UserRole.INSTRUCTOR && (
                    <button 
                      onClick={() => router.push('/users?role=student')}
                      className="p-4 text-left rounded-lg border hover:bg-accent transition-colors"
                    >
                      <Users className="h-8 w-8 text-primary mb-2" />
                      <h3 className="font-medium">Students</h3>
                      <p className="text-sm text-muted-foreground">View student directory</p>
                    </button>
                  )}
                  
                  {/* College Information */}
                  <button 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="p-4 text-left rounded-lg border hover:bg-accent transition-colors"
                  >
                    <Building2 className="h-8 w-8 text-primary mb-2" />
                    <h3 className="font-medium">College Info</h3>
                    <p className="text-sm text-muted-foreground">View college details and contact</p>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}
