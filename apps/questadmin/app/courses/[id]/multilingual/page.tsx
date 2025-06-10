'use client'

import { AuthGuard } from '@/components/AuthGuard'
import { CourseDeleteConfirmation } from '@/components/CourseDeleteConfirmation'
import { MultilingualCourseQuestionsManager } from '@/components/CourseQuestionsManager-multilingual'
import { MultilingualCourseTopicsManager } from '@/components/CourseTopicsManager-multilingual'
import { LanguageSelector } from '@/components/LanguageSelector'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { AdminCourse, deleteCourse, duplicateCourse, getCourseById } from '@/data/services/admin-course-service'
import {
    DEFAULT_LANGUAGE,
    SupportedLanguage
} from '@/lib/multilingual-types'
import {
    getAvailableLanguages,
    getCompatibleText,
    isMultilingualContent
} from '@/lib/multilingual-utils'
import {
    ArrowLeft,
    BookOpen,
    Copy,
    Edit,
    Eye,
    FileText,
    Globe,
    HelpCircle,
    Settings,
    Trash2,
    Users
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface CourseDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function MultilingualCourseDetailPage({ params }: CourseDetailPageProps) {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [course, setCourse] = useState<AdminCourse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(DEFAULT_LANGUAGE)
  const [availableLanguages, setAvailableLanguages] = useState<SupportedLanguage[]>([DEFAULT_LANGUAGE])

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
        setCourse(courseData)

        // Determine available languages from course content
        const courseLanguages = new Set<SupportedLanguage>([DEFAULT_LANGUAGE])
        
        if (isMultilingualContent(courseData.title)) {
          getAvailableLanguages(courseData.title).forEach(lang => courseLanguages.add(lang))
        }
        if (isMultilingualContent(courseData.description)) {
          getAvailableLanguages(courseData.description).forEach(lang => courseLanguages.add(lang))
        }
        
        const finalAvailableLanguages = Array.from(courseLanguages)
        setAvailableLanguages(finalAvailableLanguages)
        
      } catch (error) {
        console.error('Error loading course:', error)
        setError('Failed to load course details')
      } finally {
        setLoading(false)
      }
    }

    loadCourse()
  }, [params])

  const handleDelete = async () => {
    if (!course?.id) return
    
    setIsDeleting(true)
    try {
      const success = await deleteCourse(course.id)
      if (success) {
        toast.success('Course deleted successfully')
        router.push('/courses')
      } else {
        toast.error('Failed to delete course')
      }
    } catch (error) {
      console.error('Error deleting course:', error)
      toast.error('Failed to delete course')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirmation(false)
    }
  }

  const handleDuplicate = async () => {
    if (!course?.id) return
    
    setIsDuplicating(true)
    try {
      const duplicatedCourse = await duplicateCourse(course.id)
      if (duplicatedCourse) {
        toast.success('Course duplicated successfully')
        router.push(`/courses/${duplicatedCourse.id}/multilingual`)
      } else {
        toast.error('Failed to duplicate course')
      }
    } catch (error) {
      console.error('Error duplicating course:', error)
      toast.error('Failed to duplicate course')
    } finally {
      setIsDuplicating(false)
    }
  }

  // Check if user can edit this course
  const canEdit = userProfile?.role === 'admin' || 
    (userProfile?.role === 'instructor' && course?.instructorId === userProfile?.uid)

  // Check if course is multilingual
  const isMultilingual = availableLanguages.length > 1

  // Get localized content
  const courseTitle = course ? getCompatibleText(course.title, selectedLanguage) : ''
  const courseDescription = course ? getCompatibleText(course.description, selectedLanguage) : ''

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="space-y-6">
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
              <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-96 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (error || !course) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="text-center py-16">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-bold mb-2 text-gray-900">Course Not Found</h2>
              <p className="text-gray-600 mb-6">
                {error || 'The course you are looking for does not exist.'}
              </p>
              <Button onClick={() => router.push('/courses')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Courses
              </Button>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4 max-w-6xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/courses')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Courses
                </Button>
                <div className="h-6 w-px bg-gray-300" />
                <div className="flex items-center gap-2">
                  {isMultilingual && (
                    <Globe className="h-5 w-5 text-blue-600" />
                  )}
                  <h1 className="text-xl font-semibold text-gray-900">
                    {courseTitle}
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {isMultilingual && (
                  <>
                    <LanguageSelector
                      currentLanguage={selectedLanguage}
                      onLanguageChange={setSelectedLanguage}
                      availableLanguages={availableLanguages}
                    />
                    <div className="h-6 w-px bg-gray-300" />
                  </>
                )}
                
                <Link href={`/courses/${course.id}/preview`} target="_blank">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </Link>
                
                {canEdit && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleDuplicate}
                      disabled={isDuplicating}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {isDuplicating ? 'Duplicating...' : 'Duplicate'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteConfirmation(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2">
              {/* Course Overview */}
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {isMultilingual && (
                          <Globe className="h-5 w-5 text-blue-600" />
                        )}
                        Course Overview
                      </CardTitle>
                      <CardDescription>
                        Course details and settings
                      </CardDescription>
                    </div>
                    {canEdit && (
                      <Link href={`/courses/edit/${course.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Course
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Description</h3>
                      <p className="text-gray-600">{courseDescription}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Users className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                        <div className="text-sm font-medium">{course.enrollmentCount || 0}</div>
                        <div className="text-xs text-gray-600">Students</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <BookOpen className="h-5 w-5 mx-auto mb-1 text-green-600" />
                        <div className="text-sm font-medium">{course.duration}h</div>
                        <div className="text-xs text-gray-600">Duration</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Settings className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                        <div className="text-sm font-medium">{course.level}</div>
                        <div className="text-xs text-gray-600">Level</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <BookOpen className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <div className="text-xl sm:text-2xl font-bold">${course.price}</div>
                        <div className="text-xs sm:text-sm text-gray-600">Price</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Course Management Tabs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {isMultilingual && (
                      <Globe className="h-5 w-5 text-blue-600" />
                    )}
                    Multilingual Course Management
                  </CardTitle>
                  <CardDescription>
                    Manage your course content, topics, and questions with multi-language support
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
                      <MultilingualCourseTopicsManager 
                        courseId={course.id!} 
                        isEditable={canEdit}
                      />
                    </TabsContent>
                    
                    <TabsContent value="questions" className="space-y-4">
                      <MultilingualCourseQuestionsManager 
                        courseId={course.id!}
                        courseName={courseTitle}
                        isEditable={canEdit}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Sidebar */}
            <div className="space-y-6">
              {/* Course Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Course Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <Badge 
                      variant={course.status === 'published' ? 'default' : 'secondary'}
                      className="block w-fit mt-1"
                    >
                      {course.status}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Category</label>
                    <p className="text-sm font-medium text-gray-900">{course.category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Instructor</label>
                    <p className="text-sm font-medium text-gray-900">{course.instructor}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Created</label>
                    <p className="text-sm text-gray-900">
                      {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Last Updated</label>
                    <p className="text-sm text-gray-900">
                      {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Language Information */}
              {isMultilingual && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Globe className="h-5 w-5 text-blue-600" />
                      Language Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Available Languages</label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {availableLanguages.map(lang => (
                          <Badge 
                            key={lang}
                            variant={lang === selectedLanguage ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            {lang === 'en' ? '🇺🇸 English' : '🇮🇳 Telugu'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Content Type</label>
                      <Badge variant="secondary" className="block w-fit mt-1">
                        Multilingual Course
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href={`/courses/${course.id}/preview`} target="_blank" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview Course
                    </Button>
                  </Link>
                  
                  {canEdit && (
                    <>
                      <Link href={`/courses/edit/${course.id}`} className="block">
                        <Button variant="outline" className="w-full justify-start">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Course
                        </Button>
                      </Link>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={handleDuplicate}
                        disabled={isDuplicating}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        {isDuplicating ? 'Duplicating...' : 'Duplicate Course'}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {course && (
          <CourseDeleteConfirmation
            isOpen={showDeleteConfirmation}
            onClose={() => setShowDeleteConfirmation(false)}
            onConfirm={handleDelete}
            courseId={course.id!}
            courseTitle={courseTitle}
            isLoading={isDeleting}
          />
        )}
      </div>
    </AuthGuard>
  )
}
