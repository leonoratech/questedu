'use client'

import { AdminLayout } from '@/components/AdminLayout'
import { AuthGuard } from '@/components/AuthGuard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import { updateUserProfile, UserRole } from '@/data/config/firebase-auth'
import { GraduationCap, Save, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function ProfileCompletePage() {
  const { user, userProfile, refreshProfile } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    college: '',
    description: '',
    // Instructor fields
    coreTeachingSkills: '',
    additionalTeachingSkills: '',
    // Student fields
    mainSubjects: '',
    class: ''
  })

  // Redirect if profile is already completed
  useEffect(() => {
    if (userProfile?.profileCompleted) {
      router.push('/my-courses')
    }
  }, [userProfile, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !userProfile) return

    setLoading(true)

    try {
      const updates: any = {
        college: formData.college.trim(),
        description: formData.description.trim(),
        profileCompleted: true
      }

      // Add role-specific fields
      if (userProfile.role === UserRole.INSTRUCTOR) {
        updates.coreTeachingSkills = formData.coreTeachingSkills
          .split(',')
          .map(skill => skill.trim())
          .filter(skill => skill.length > 0)
        
        updates.additionalTeachingSkills = formData.additionalTeachingSkills
          .split(',')
          .map(skill => skill.trim())
          .filter(skill => skill.length > 0)
      } else if (userProfile.role === UserRole.STUDENT) {
        updates.mainSubjects = formData.mainSubjects
          .split(',')
          .map(subject => subject.trim())
          .filter(subject => subject.length > 0)
        
        updates.class = formData.class.trim()
      }

      const result = await updateUserProfile(updates)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Profile completed successfully!')
        await refreshProfile()
        router.push('/my-courses')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete profile')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!userProfile) {
    return (
      <AuthGuard>
        <AdminLayout title="Complete Profile">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <AdminLayout title="Complete Your Profile">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              {userProfile.role === UserRole.INSTRUCTOR ? (
                <User className="h-8 w-8 text-primary" />
              ) : (
                <GraduationCap className="h-8 w-8 text-primary" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Complete Your Profile
            </h1>
            <p className="text-muted-foreground">
              Help us personalize your experience by completing your profile information
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {userProfile.role === UserRole.INSTRUCTOR ? (
                  <>
                    <User className="h-5 w-5" />
                    Instructor Information
                  </>
                ) : (
                  <>
                    <GraduationCap className="h-5 w-5" />
                    Student Information
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {userProfile.role === UserRole.INSTRUCTOR
                  ? "Tell us about your teaching background and expertise"
                  : "Tell us about your academic background and interests"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Common Fields */}
                <div className="space-y-2">
                  <Label htmlFor="college">College/Institution</Label>
                  <Input
                    id="college"
                    value={formData.college}
                    onChange={(e) => handleInputChange('college', e.target.value)}
                    placeholder="Enter your college or institution name"
                    required
                  />
                </div>

                {/* Role-specific Fields */}
                {userProfile.role === UserRole.INSTRUCTOR && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="coreTeachingSkills">Core Teaching Skills</Label>
                      <Input
                        id="coreTeachingSkills"
                        value={formData.coreTeachingSkills}
                        onChange={(e) => handleInputChange('coreTeachingSkills', e.target.value)}
                        placeholder="e.g., Mathematics, Physics, Chemistry (comma separated)"
                        required
                      />
                      <p className="text-sm text-muted-foreground">
                        List your primary subjects or skills you teach (separate with commas)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="additionalTeachingSkills">Additional Teaching Skills</Label>
                      <Input
                        id="additionalTeachingSkills"
                        value={formData.additionalTeachingSkills}
                        onChange={(e) => handleInputChange('additionalTeachingSkills', e.target.value)}
                        placeholder="e.g., Research, Mentoring, Curriculum Development (comma separated)"
                      />
                      <p className="text-sm text-muted-foreground">
                        Additional skills or areas of expertise (separate with commas)
                      </p>
                    </div>
                  </>
                )}

                {userProfile.role === UserRole.STUDENT && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="mainSubjects">Main Subjects</Label>
                      <Input
                        id="mainSubjects"
                        value={formData.mainSubjects}
                        onChange={(e) => handleInputChange('mainSubjects', e.target.value)}
                        placeholder="e.g., Computer Science, Engineering, Mathematics (comma separated)"
                        required
                      />
                      <p className="text-sm text-muted-foreground">
                        List your main subjects of study (separate with commas)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="class">Class/Year</Label>
                      <Input
                        id="class"
                        value={formData.class}
                        onChange={(e) => handleInputChange('class', e.target.value)}
                        placeholder="e.g., Sophomore, Final Year, Class 12"
                        required
                      />
                      <p className="text-sm text-muted-foreground">
                        Your current class, year, or academic level
                      </p>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="description">
                    {userProfile.role === UserRole.INSTRUCTOR 
                      ? "Brief Description About Yourself" 
                      : "Brief Description About Yourself"
                    }
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder={
                      userProfile.role === UserRole.INSTRUCTOR
                        ? "Tell students about your teaching philosophy, experience, and what makes your courses special..."
                        : "Tell us about your academic interests, goals, and what you hope to learn..."
                    }
                    rows={4}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Completing Profile...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Complete Profile
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => router.push('/my-courses')}
                    disabled={loading}
                  >
                    Skip for Now
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}
