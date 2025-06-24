'use client'

import { AuthGuard } from '@/components/AuthGuard'
import { CourseDeleteConfirmation } from '@/components/CourseDeleteConfirmation'
import { CourseQuestionsManager } from '@/components/CourseQuestionsManager'
import { CourseTopicsManager } from '@/components/CourseTopicsManager'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { AdminCourse, deleteCourse, duplicateCourse, getCourseById } from '@/data/services/admin-course-service'
import { enrichCourseWithRating } from '@/data/services/course-rating-loader'
import { isMultilingualContent } from '@/lib/multilingual-utils'
import { ArrowLeft, BookOpen, Edit, Eye, FileText, HelpCircle, Trash2, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface CourseDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [course, setCourse] = useState<AdminCourse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const loadCourse = async () => {
      try {
        setError(null)
        const resolvedParams = await params
        const courseData = await getCourseById(resolvedParams.id)
        if (!courseData) {
          setError('Course not found')
          return
        }
        
        // Enrich course with real rating data from database
        const courseWithRating = await enrichCourseWithRating(courseData)
        setCourse(courseWithRating)
      } catch (error) {
        console.error('Error loading course:', error)
        setError('Failed to load course details')
      } finally {
        setLoading(false)
      }
    }

    loadCourse()
  }, [params])

  const handleDuplicateCourse = async () => {
    if (!course || !course.id) return
    
    try {
      setLoading(true)
      const duplicatedCourse = await duplicateCourse(course.id)
      
      if (duplicatedCourse && duplicatedCourse.id) {
        // Navigate to the new duplicated course
        router.push(`/courses/${duplicatedCourse.id}`)
      } else {
        setError('Failed to duplicate course')
      }
    } catch (error) {
      console.error('Error duplicating course:', error)
      setError('Failed to duplicate course')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCourse = async () => {
    if (!course || !course.id) return
    
    setIsDeleting(true)
    try {
      const success = await deleteCourse(course.id)
      
      if (success) {
        // Navigate back to courses list
        router.push('/courses')
      } else {
        setError('Failed to delete course')
      }
    } catch (error) {
      console.error('Error deleting course:', error)
      setError('Failed to delete course')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirmation(false)
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true)
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-6">
            <div className="h-8 bg-muted rounded animate-pulse" />
            <div className="h-32 bg-muted rounded animate-pulse" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-muted rounded animate-pulse" />
              <div className="h-64 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (error || !course) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
            <p className="text-muted-foreground mb-6">
              {error || 'The course you are looking for does not exist.'}
            </p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </AuthGuard>
    )
  }

  const canEdit = userProfile?.role === 'instructor' || course.instructorId === user?.uid

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
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
              <h1 className="text-2xl sm:text-3xl font-bold">{course.title}</h1>
              <p className="text-muted-foreground">
                by {course.instructor}
              </p>
            </div>
          </div>

          {/* Actions */}
          {canEdit && (
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={() => router.push(`/courses/${course.id}/edit`)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>                  <Button
                    variant="outline"
                    onClick={() => {
                      window.open(`/courses/${course.id}/preview`, '_blank')
                    }}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </Button>
            </div>
          )}
        </div>

        {/* Course Status Badge */}
        {/* <div className="mb-6">
          <Badge 
            variant={course.status === 'published' ? 'default' : course.status === 'draft' ? 'secondary' : 'destructive'}
            className="text-sm"
          >
            {course.status ? course.status.toUpperCase() : 'DRAFT'}
          </Badge>
        </div> */}

        {/* Enhanced 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Main Content - Takes 3 columns on large screens */}
          <div className="lg:col-span-3 space-y-6">
            {/* Course Management Tabs */}
            <Card>
              <CardHeader>
                <CardTitle>Course Management</CardTitle>
                <CardDescription>
                  Manage your course content, topics, and questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="topics" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="topics" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="hidden sm:inline">Course Topics</span>
                      <span className="sm:hidden">Topics</span>
                    </TabsTrigger>
                    <TabsTrigger value="questions" className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">Questions & Quizzes</span>
                      <span className="sm:hidden">Questions</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="topics" className="space-y-4">
                    <CourseTopicsManager 
                      courseId={course.id!} 
                      isEditable={canEdit}
                      multilingualMode={isMultilingualContent(course.title) || isMultilingualContent(course.description)}
                    />
                  </TabsContent>
                  
                  <TabsContent value="questions" className="space-y-4">
                    <CourseQuestionsManager 
                      courseId={course.id!}
                      courseName={course.title}
                      multilingualMode={isMultilingualContent(course.title) || isMultilingualContent(course.description)}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Sidebar - Takes 1 column on large screens */}
          <div className="lg:col-span-1 space-y-6">
            {/* Course Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    <p className="text-sm font-medium">{course.category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Level</label>
                    <Badge variant="outline" className="text-xs">
                      {course.level}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Instructor</label>
                    <p className="text-sm font-medium">{course.instructor}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <Badge 
                      variant={course.status === 'published' ? 'default' : course.status === 'draft' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {course.status ? course.status.toUpperCase() : 'DRAFT'}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                    <p className="text-sm">
                      {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Updated</label>
                    <p className="text-sm">
                      {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            {canEdit && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/courses/${course.id}/edit`)}
                    className="w-full justify-start text-sm"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Course Details
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      window.open(`/courses/${course.id}/preview`, '_blank')
                    }}
                    className="w-full justify-start text-sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Course
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDuplicateCourse}
                    className="w-full justify-start text-sm"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Duplicate Course
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDeleteClick}
                    className="w-full justify-start text-sm text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Course
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Enrollment Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Enrollment Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Students</span>
                    <span className="font-medium">{course.enrollmentCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Average Rating</span>
                    <span className="font-medium">
                      {course.rating ? `${course.rating.toFixed(1)} ⭐` : 'No ratings'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Revenue</span>
                    <span className="font-medium">
                      ₹{((course.enrollmentCount || 0) * course.price).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Progress */}
            <Card className="lg:block hidden">
              <CardHeader>
                <CardTitle className="text-lg">Course Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Detailed analytics coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Course Delete Confirmation Dialog */}
      {course && (
        <CourseDeleteConfirmation
          isOpen={showDeleteConfirmation}
          onClose={() => setShowDeleteConfirmation(false)}
          onConfirm={handleDeleteCourse}
          courseTitle={course.title}
          courseId={course.id || ''}
          isLoading={isDeleting}
        />
      )}
    </AuthGuard>
  )
}
