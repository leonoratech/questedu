'use client'

import { AuthGuard } from '@/components/AuthGuard'
import { CourseQuestionsManager } from '@/components/CourseQuestionsManager'
import { CourseTopicsManager } from '@/components/CourseTopicsManager'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/data/config/firebase-auth'
import { AdminCourse, getCourseById, updateCourse } from '@/data/services/admin-course-service'
import { ArrowLeft, BookOpen, FileText, HelpCircle, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

interface CourseFormData {
  title: string
  description: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  price: number
  duration: string // Keep as string for form input
  status: 'draft' | 'published' | 'archived'
}

const categories = [
  'Technology',
  'Business',
  'Design',
  'Marketing',
  'Personal Development',
  'Languages',
  'Science',
  'Arts & Crafts',
  'Health & Fitness',
  'Music',
  'Photography',
  'Other'
]

interface EditCoursePageProps {
  params: Promise<{ id: string }>
}

export default function EditCoursePage({ params }: EditCoursePageProps) {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [courseId, setCourseId] = useState<string>('')
  const [course, setCourse] = useState<AdminCourse | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'details' | 'topics' | 'questions'>('details')
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    category: '',
    level: 'beginner',
    price: 0,
    duration: '',
    status: 'draft'
  })

  // Get course ID from params
  useEffect(() => {
    async function getParams() {
      const resolvedParams = await params
      setCourseId(resolvedParams.id)
    }
    getParams()
  }, [params])

  // Fetch course data
  useEffect(() => {
    async function fetchCourse() {
      if (!courseId) return
      
      try {
        setFetchLoading(true)
        const courseData = await getCourseById(courseId)
        
        if (courseData) {
          setCourse(courseData)
          setFormData({
            title: courseData.title,
            description: courseData.description,
            category: courseData.category,
            level: courseData.level,
            price: courseData.price,
            duration: courseData.duration.toString(), // Convert number to string for form
            status: courseData.status
          })
        } else {
          setError('Course not found')
        }
      } catch (err) {
        setError('Failed to load course')
        console.error('Error fetching course:', err)
      } finally {
        setFetchLoading(false)
      }
    }

    fetchCourse()
  }, [courseId])

  const handleInputChange = (field: keyof CourseFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !userProfile || !course) {
      setError('Not authenticated or course not loaded')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const updates = {
        ...formData,
        duration: parseFloat(formData.duration.trim()) || 0, // Convert string to number for API
        instructor: userProfile.firstName + ' ' + userProfile.lastName,
        instructorId: user.uid
      }

      const success = await updateCourse(course.id!, updates, user.uid)
      
      if (success) {
        router.push('/my-courses')
      } else {
        setError('Failed to update course')
      }
    } catch (err) {
      setError('An error occurred while updating the course')
      console.error('Update course error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getLevelBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (fetchLoading) {
    return (
      <AuthGuard requiredRole={UserRole.INSTRUCTOR}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading course...</span>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (error && !course) {
    return (
      <AuthGuard requiredRole={UserRole.INSTRUCTOR}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/my-courses')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Courses
            </Button>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredRole={UserRole.INSTRUCTOR}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="outline" 
              onClick={() => router.push('/my-courses')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to My Courses
            </Button>
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Edit Course</h1>
                <p className="text-muted-foreground">Update your course information</p>
              </div>
            </div>
          </div>

          {/* Course Status */}
          {course && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Current Course Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Level:</span>
                    <Badge className={getLevelBadgeColor(course.level)}>
                      {course.level}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Status:</span>
                    <Badge className={getStatusBadgeColor(course.status)}>
                      {course.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Enrollments:</span>
                    <span>{course.enrollmentCount || 0}</span>
                  </div>
                  {course.rating && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Rating:</span>
                      <span>{course.rating.toFixed(1)} ⭐</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab Navigation */}
          <div className="flex border-b mb-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Course Details
              </div>
            </button>
            <button
              onClick={() => setActiveTab('topics')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'topics'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Course Topics
              </div>
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'questions'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Questions & Answers
              </div>
            </button>
          </div>

          {/* Course Details Tab */}
          {activeTab === 'details' && (
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
                <CardDescription>
                  Update the details for your course
                </CardDescription>
              </CardHeader>
              <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Course Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter course title"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => handleInputChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Level */}
                  <div className="space-y-2">
                    <Label htmlFor="level">Difficulty Level *</Label>
                    <Select 
                      value={formData.level} 
                      onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => handleInputChange('level', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-800">Beginner</Badge>
                            <span>New to the subject</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="intermediate">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-yellow-100 text-yellow-800">Intermediate</Badge>
                            <span>Some experience required</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="advanced">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-red-100 text-red-800">Advanced</Badge>
                            <span>Expert level content</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price */}
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (USD) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (hours) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      placeholder="e.g., 40"
                      min="0"
                      step="0.5"
                      required
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status">Publication Status *</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value: 'draft' | 'published' | 'archived') => handleInputChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>
                            <span>Not visible to students</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="published">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-800">Published</Badge>
                            <span>Available for enrollment</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="archived">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-gray-100 text-gray-800">Archived</Badge>
                            <span>No longer available</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Course Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Provide a detailed description of your course..."
                    rows={6}
                    required
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-6 border-t">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? 'Updating...' : 'Update Course'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/my-courses')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          )}

          {/* Course Topics Tab */}
          {activeTab === 'topics' && courseId && (
            <CourseTopicsManager courseId={courseId} isEditable={true} />
          )}

          {/* Questions & Answers Tab */}
          {activeTab === 'questions' && courseId && course && (
            <CourseQuestionsManager courseId={courseId} courseName={course.title} />
          )}
        </div>
      </div>
    </AuthGuard>
  )
}