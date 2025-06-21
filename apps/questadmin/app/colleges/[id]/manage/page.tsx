'use client'

import { AdminLayout } from '@/components/AdminLayout'
import { AuthGuard } from '@/components/AuthGuard'
import { CollegeAdministratorsManager } from '@/components/CollegeAdministratorsManager'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserRole } from '@/data/config/firebase-auth'
import { College, getCollegeById } from '@/data/services/college-service'
import { ArrowLeft, Globe, Mail, MapPin, Phone, School, Settings, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface CollegeManagePageProps {
  params: Promise<{ id: string }>
}

export default function CollegeManagePage({ params }: CollegeManagePageProps) {
  const router = useRouter()
  const [college, setCollege] = useState<College | null>(null)
  const [loading, setLoading] = useState(true)
  const [collegeId, setCollegeId] = useState<string>('')

  useEffect(() => {
    const loadParams = async () => {
      const { id } = await params
      setCollegeId(id)
      await loadCollege(id)
    }
    loadParams()
  }, [params])

  const loadCollege = async (id: string) => {
    try {
      setLoading(true)
      const data = await getCollegeById(id)
      if (data) {
        setCollege(data)
      } else {
        toast.error('College not found')
        router.push('/colleges')
      }
    } catch (error) {
      console.error('Error loading college:', error)
      toast.error('Failed to load college data')
      router.push('/colleges')
    } finally {
      setLoading(false)
    }
  }

  const handleDataUpdate = () => {
    if (collegeId) {
      loadCollege(collegeId)
    }
  }

  if (loading) {
    return (
      <AuthGuard requiredRole={UserRole.SUPERADMIN}>
        <AdminLayout>
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/3" />
              <div className="h-32 bg-muted rounded" />
              <div className="h-64 bg-muted rounded" />
            </div>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  if (!college) {
    return (
      <AuthGuard requiredRole={UserRole.SUPERADMIN}>
        <AdminLayout>
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground mb-4">College Not Found</h1>
              <Button onClick={() => router.push('/colleges')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Colleges
              </Button>
            </div>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredRole={UserRole.SUPERADMIN}>
      <AdminLayout>
        <div className="container mx-auto px-4 py-8 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/colleges')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Colleges
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <School className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{college.name}</h1>
                <div className="flex items-center gap-2">
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

          {/* College Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                College Information
              </CardTitle>
              <CardDescription>Basic information about the college</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                </div>

                {/* Address */}
                {college.address && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Address
                    </h3>
                    <div className="text-sm">
                      {[
                        college.address.street,
                        college.address.city,
                        college.address.state,
                        college.address.country,
                        college.address.postalCode
                      ].filter(Boolean).join(', ')}
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Contact Information
                  </h3>
                  <div className="space-y-2">
                    {college.contact?.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>{college.contact.phone}</span>
                      </div>
                    )}
                    {college.contact?.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span>{college.contact.email}</span>
                      </div>
                    )}
                    {college.contact?.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-3 w-3 text-muted-foreground" />
                        <a 
                          href={college.contact.website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {college.description && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-3">
                    Description
                  </h3>
                  <p className="text-sm">{college.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Management Tabs */}
          <Tabs defaultValue="administrators" className="space-y-6">
            <TabsList>
              <TabsTrigger value="administrators" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Administrators
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="administrators" className="space-y-6">
              <CollegeAdministratorsManager
                collegeId={collegeId}
                collegeName={college.name}
                onUpdate={handleDataUpdate}
              />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>College Settings</CardTitle>
                  <CardDescription>
                    Manage college settings and configurations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>College settings will be available here in future updates</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}
