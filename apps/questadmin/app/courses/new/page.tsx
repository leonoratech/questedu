'use client'

import { AuthGuard } from '@/components/AuthGuard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import { addCourse } from '@/lib/admin-course-service'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

interface CourseFormData {
  title: string
  description: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  price: number
  duration: string
  status: 'draft' | 'published'
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

export default function CreateCoursePage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    category: '',
    level: 'beginner',
    price: 0,
    duration: '',
    status: 'draft'
  })

  const handleInputChange = (field: keyof CourseFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!user || !userProfile) {
        throw new Error('User not authenticated')
      }

      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Course title is required')
      }
      if (!formData.description.trim()) {
        throw new Error('Course description is required')
      }
      if (!formData.category) {
        throw new Error('Course category is required')
      }
      if (!formData.duration.trim()) {
        throw new Error('Course duration is required')
      }

      const courseData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        instructor: `${userProfile.firstName} ${userProfile.lastName}`,
        instructorId: user.uid,
        category: formData.category,
        level: formData.level.charAt(0).toUpperCase() + formData.level.slice(1) as 'Beginner' | 'Intermediate' | 'Advanced',
        price: formData.price,
        duration: formData.duration.trim(),
        status: formData.status
      }

      const courseId = await addCourse(courseData)
      
      // Redirect to the course management page or course detail
      router.push(`/courses/${courseId}`)
    } catch (error) {
      console.error('Error creating course:', error)
      setError(error instanceof Error ? error.message : 'Failed to create course')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDraft = async () => {
    const currentStatus = formData.status
    setFormData(prev => ({ ...prev, status: 'draft' }))
    
    // Trigger form submission with draft status
    const form = document.getElementById('course-form') as HTMLFormElement
    if (form) {
      form.requestSubmit()
    }
    
    // Reset status if needed
    setFormData(prev => ({ ...prev, status: currentStatus }))
  }

  const handlePublish = async () => {
    setFormData(prev => ({ ...prev, status: 'published' }))
    
    // Trigger form submission with published status
    const form = document.getElementById('course-form') as HTMLFormElement
    if (form) {
      form.requestSubmit()
    }
  }

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              Create New Course
            </h1>
            <p className="text-muted-foreground">
              Add a new course to the platform
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Course Form */}
        <form id="course-form" onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Provide the essential details about your course
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Course Title *</Label>
                    <Input
                      id="title"
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter course title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe what students will learn in this course"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value: string) => handleInputChange('category', value)}
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

                    <div className="space-y-2">
                      <Label htmlFor="level">Difficulty Level *</Label>
                      <Select
                        value={formData.level}
                        onValueChange={(value: string) => handleInputChange('level', value as 'beginner' | 'intermediate' | 'advanced')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration *</Label>
                      <Input
                        id="duration"
                        type="text"
                        value={formData.duration}
                        onChange={(e) => handleInputChange('duration', e.target.value)}
                        placeholder="e.g., 4 weeks, 20 hours"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Course Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Publication Status</CardTitle>
                  <CardDescription>
                    Choose how to save your course
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={formData.status === 'published' ? 'default' : 'secondary'}>
                      {formData.status === 'published' ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSaveDraft}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'Saving...' : 'Save as Draft'}
                    </Button>
                    
                    <Button
                      type="button"
                      onClick={handlePublish}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'Publishing...' : 'Publish Course'}
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Drafts are only visible to you. Published courses are visible to all users.
                  </p>
                </CardContent>
              </Card>

              {/* Course Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm">
                      {formData.title || 'Course Title'}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      by {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'Instructor'}
                    </p>
                  </div>
                  
                  {formData.description && (
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {formData.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {formData.category && (
                      <Badge variant="outline" className="text-xs">
                        {formData.category}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {formData.level}
                    </Badge>
                  </div>
                  
                  {formData.duration && (
                    <p className="text-xs text-muted-foreground">
                      Duration: {formData.duration}
                    </p>
                  )}
                  
                  {formData.price > 0 && (
                    <p className="text-xs font-medium">
                      ${formData.price.toFixed(2)}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </AuthGuard>
  )
}