'use client'

import { AdminLayout } from '@/components/AdminLayout'
import { AuthGuard } from '@/components/AuthGuard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import { updateUserProfile, UserRole } from '@/data/config/firebase-auth'
import { formatDate } from '@/lib/date-utils'
import { Camera, GraduationCap, Save, User } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ProfilePage() {
  const { user, userProfile, hasRole, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: UserRole.INSTRUCTOR,
    department: '',
    bio: '',
    college: '',
    description: '',
    // Instructor fields
    coreTeachingSkills: '',
    additionalTeachingSkills: '',
    // Student fields
    mainSubjects: '',
    class: ''
  })

  // Initialize form data when userProfile loads
  useEffect(() => {
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        email: userProfile.email || '',
        role: userProfile.role || UserRole.INSTRUCTOR,
        department: userProfile.department || '',
        bio: userProfile.bio || '',
        college: userProfile.college || '',
        description: userProfile.description || '',
        coreTeachingSkills: userProfile.coreTeachingSkills?.join(', ') || '',
        additionalTeachingSkills: userProfile.additionalTeachingSkills?.join(', ') || '',
        mainSubjects: userProfile.mainSubjects?.join(', ') || '',
        class: userProfile.class || ''
      })
    }
  }, [userProfile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !userProfile) return

    setLoading(true)
    setMessage(null)

    try {
      const updates: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        department: formData.department,
        bio: formData.bio,
        college: formData.college,
        description: formData.description,
        displayName: `${formData.firstName} ${formData.lastName}`,
        profileCompleted: true
      }

      // Only admins can change roles
      if (hasRole(UserRole.ADMIN) && formData.role !== userProfile.role) {
        updates.role = formData.role
      }

      // Add role-specific fields
      if (userProfile.role === UserRole.INSTRUCTOR || (hasRole(UserRole.ADMIN) && formData.role === UserRole.INSTRUCTOR)) {
        updates.coreTeachingSkills = formData.coreTeachingSkills
          .split(',')
          .map(skill => skill.trim())
          .filter(skill => skill.length > 0)
        
        updates.additionalTeachingSkills = formData.additionalTeachingSkills
          .split(',')
          .map(skill => skill.trim())
          .filter(skill => skill.length > 0)
      }

      if (userProfile.role === UserRole.STUDENT || (hasRole(UserRole.ADMIN) && formData.role === UserRole.STUDENT)) {
        updates.mainSubjects = formData.mainSubjects
          .split(',')
          .map(subject => subject.trim())
          .filter(subject => subject.length > 0)
        
        updates.class = formData.class
      }

      const result = await updateUserProfile(updates)
      
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        await refreshProfile()
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-red-100 text-red-800 border-red-200'
      case UserRole.INSTRUCTOR:
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case UserRole.STUDENT:
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (!userProfile) {
    return (
      <AuthGuard>
        <AdminLayout title="Profile">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground ml-2">Loading profile...</p>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <AdminLayout title="Profile">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Profile</h1>
            <p className="text-muted-foreground">Manage your account information and preferences</p>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`p-4 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-3">
            {/* Profile Picture Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Picture
                </CardTitle>
                <CardDescription>
                  Update your profile photo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={userProfile.profilePicture} />
                      <AvatarFallback className="text-lg">
                        {getInitials(userProfile.firstName, userProfile.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <p className="font-medium">{userProfile.firstName} {userProfile.lastName}</p>
                  <Badge className={getRoleBadgeColor(userProfile.role)}>
                    {userProfile.role}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Profile Information Form */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal and professional information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-sm text-muted-foreground">
                        Email cannot be changed directly. Contact support for assistance.
                      </p>
                    </div>

                    {/* Role Selection (Admin only) */}
                    {hasRole(UserRole.ADMIN) && (
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                          value={formData.role}
                          onValueChange={(value) => handleInputChange('role', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={UserRole.ADMIN}>Administrator</SelectItem>
                            <SelectItem value={UserRole.INSTRUCTOR}>Instructor</SelectItem>
                            <SelectItem value={UserRole.STUDENT}>Student</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Common Fields */}
                    <div className="space-y-2">
                      <Label htmlFor="college">College/Institution</Label>
                      <Input
                        id="college"
                        value={formData.college}
                        onChange={(e) => handleInputChange('college', e.target.value)}
                        placeholder="Enter your college or institution name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        placeholder="e.g., Computer Science, Mathematics"
                      />
                    </div>

                    {/* Role-specific sections */}
                    {(userProfile.role === UserRole.INSTRUCTOR || (hasRole(UserRole.ADMIN) && formData.role === UserRole.INSTRUCTOR)) && (
                      <div className="space-y-4 p-4 border rounded-lg bg-blue-50/50">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-5 w-5 text-blue-600" />
                          <h3 className="font-semibold text-blue-900">Instructor Information</h3>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="coreTeachingSkills">Core Teaching Skills</Label>
                          <Input
                            id="coreTeachingSkills"
                            value={formData.coreTeachingSkills}
                            onChange={(e) => handleInputChange('coreTeachingSkills', e.target.value)}
                            placeholder="e.g., Mathematics, Physics, Chemistry (comma separated)"
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
                      </div>
                    )}

                    {(userProfile.role === UserRole.STUDENT || (hasRole(UserRole.ADMIN) && formData.role === UserRole.STUDENT)) && (
                      <div className="space-y-4 p-4 border rounded-lg bg-green-50/50">
                        <div className="flex items-center gap-2 mb-2">
                          <GraduationCap className="h-5 w-5 text-green-600" />
                          <h3 className="font-semibold text-green-900">Student Information</h3>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="mainSubjects">Main Subjects</Label>
                          <Input
                            id="mainSubjects"
                            value={formData.mainSubjects}
                            onChange={(e) => handleInputChange('mainSubjects', e.target.value)}
                            placeholder="e.g., Computer Science, Engineering, Mathematics (comma separated)"
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
                          />
                          <p className="text-sm text-muted-foreground">
                            Your current class, year, or academic level
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Description and Bio */}
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder={
                          userProfile.role === UserRole.INSTRUCTOR
                            ? "Tell students about your teaching philosophy, experience, and what makes your courses special..."
                            : userProfile.role === UserRole.STUDENT
                            ? "Tell us about your academic interests, goals, and what you hope to learn..."
                            : "Tell us about yourself..."
                        }
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio (Legacy)</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        placeholder="Short bio or summary"
                        rows={2}
                      />
                      <p className="text-sm text-muted-foreground">
                        This field is kept for legacy purposes. Use Description field above instead.
                      </p>
                    </div>

                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Update Profile
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Account Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
              <CardDescription>Current account information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-muted-foreground">Role</p>
                  <Badge className={getRoleBadgeColor(userProfile.role)}>
                    {userProfile.role}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Member Since</p>
                  <p className="font-medium">{formatDate(userProfile.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Profile Status</p>
                  <Badge variant={userProfile.profileCompleted ? 'default' : 'secondary'}>
                    {userProfile.profileCompleted ? 'Completed' : 'Incomplete'}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Account Status</p>
                  <Badge variant={userProfile.isActive ? 'default' : 'destructive'}>
                    {userProfile.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}