/**
 * Unified Course Preview Page
 * 
 * Supports both standard and multilingual course content with automatic detection
 * and language selection capabilities.
 */

'use client'

import { LanguageHelperText, LanguageSelector } from '@/components/LanguageSelector'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTheme } from '@/contexts/ThemeContext'
import { HybridAdminCourse, HybridAdminCourseTopic } from '@/data/models/data-model'
import { getCourseById, getCourseTopics } from '@/data/services/admin-course-service'
import { AdminUser, getUserById } from '@/data/services/admin-user-service'
import {
    DEFAULT_LANGUAGE,
    SupportedLanguage
} from '@/lib/multilingual-types'
import {
    getAvailableLanguages,
    getCompatibleArray,
    getCompatibleText,
    isMultilingualContent
} from '@/lib/multilingual-utils'
import {
    ArrowLeft,
    BookOpen,
    CheckCircle,
    Clock,
    Globe,
    Lock,
    Play,
    Star,
    Users
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface CoursePreviewPageProps {
  params: Promise<{
    id: string
  }>
}

export default function UnifiedCoursePreviewPage({ params }: CoursePreviewPageProps) {
  const router = useRouter()
  const { theme } = useTheme()
  const [course, setCourse] = useState<HybridAdminCourse | null>(null)
  const [topics, setTopics] = useState<HybridAdminCourseTopic[]>([])
  const [instructor, setInstructor] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(DEFAULT_LANGUAGE)
  const [availableLanguages, setAvailableLanguages] = useState<SupportedLanguage[]>([DEFAULT_LANGUAGE])
  const [isMultilingualCourse, setIsMultilingualCourse] = useState(false)

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        setError(null)
        const resolvedParams = await params
        
        // Load course details with hybrid typing support
        const courseData = await getCourseById(resolvedParams.id) as HybridAdminCourse
        if (!courseData) {
          setError('Course not found')
          return
        }
        setCourse(courseData)
        
        // Determine available languages from course content
        const courseLanguages = new Set<SupportedLanguage>([DEFAULT_LANGUAGE])
        let hasMultilingualContent = false
        
        // Check multilingual fields in course
        if (isMultilingualContent(courseData.title)) {
          hasMultilingualContent = true
          getAvailableLanguages(courseData.title).forEach(lang => courseLanguages.add(lang))
        }
        if (isMultilingualContent(courseData.description)) {
          hasMultilingualContent = true
          getAvailableLanguages(courseData.description).forEach(lang => courseLanguages.add(lang))
        }
        if (isMultilingualContent(courseData.whatYouWillLearn)) {
          hasMultilingualContent = true
          getAvailableLanguages(courseData.whatYouWillLearn).forEach(lang => courseLanguages.add(lang))
        }
        
        // Load course topics with hybrid typing support
        const topicsData = await getCourseTopics(resolvedParams.id) as HybridAdminCourseTopic[]
        setTopics(topicsData)
        
        // Check multilingual fields in topics
        topicsData.forEach(topic => {
          if (isMultilingualContent(topic.title)) {
            hasMultilingualContent = true
            getAvailableLanguages(topic.title).forEach(lang => courseLanguages.add(lang))
          }
          if (isMultilingualContent(topic.description)) {
            hasMultilingualContent = true
            getAvailableLanguages(topic.description).forEach(lang => courseLanguages.add(lang))
          }
        })
        
        // Set multilingual mode based on detected content
        setIsMultilingualCourse(hasMultilingualContent)
        
        const finalAvailableLanguages = Array.from(courseLanguages)
        setAvailableLanguages(finalAvailableLanguages)
        
        // Load instructor details if instructorId exists
        if (courseData.instructorId) {
          const instructorData = await getUserById(courseData.instructorId)
          setInstructor(instructorData)
        }
        
      } catch (error) {
        console.error('Error loading course data:', error)
        setError('Failed to load course details')
      } finally {
        setLoading(false)
      }
    }

    loadCourseData()
  }, [params])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-6">
            <div className="h-8 bg-muted rounded animate-pulse" />
            <div className="h-64 bg-muted rounded-lg animate-pulse" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-muted rounded-lg animate-pulse" />
              <div className="h-64 bg-muted rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2 text-foreground">Course Not Found</h2>
            <p className="text-muted-foreground mb-6">
              {error || 'The course you are looking for does not exist.'}
            </p>
            <Button onClick={() => window.close()} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Close Preview
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Calculate total duration from topics (in hours)
  const calculateTotalDuration = () => {
    const totalMinutes = topics.reduce((total, topic) => {
      return total + (topic.duration || 0)
    }, 0)
    return Math.round((totalMinutes / 60) * 10) / 10 // Round to 1 decimal place
  }

  // Calculate content counts from topics
  const calculateContentCounts = () => {
    let videosCount = 0
    let articlesCount = 0
    
    topics.forEach(topic => {
      if (topic.videoUrl) videosCount++
      if (topic.materials) {
        topic.materials.forEach(material => {
          if (material.type === 'video') videosCount++
          if (material.type === 'document' || material.type === 'pdf') articlesCount++
        })
      }
    })
    
    return { videosCount, articlesCount }
  }

  const totalDuration = calculateTotalDuration()
  const { videosCount, articlesCount } = calculateContentCounts()

  // Convert topics to lesson format for display with multilingual support
  const lessons = topics.map((topic, index) => ({
    id: topic.id || `topic_${index}`,
    title: getCompatibleText(topic.title, selectedLanguage),
    duration: topic.duration ? `${topic.duration} min` : 'TBD',
    completed: false,
    locked: index > 0, // First lesson unlocked, rest locked for preview
    description: getCompatibleText(topic.description, selectedLanguage)
  }))

  // Get instructor display name
  const instructorName = instructor 
    ? `${instructor.firstName} ${instructor.lastName}`.trim() 
    : course?.instructor || 'Instructor'

  // Get localized content
  const courseTitle = getCompatibleText(course.title, selectedLanguage)
  const courseDescription = getCompatibleText(course.description, selectedLanguage)
  const whatYouWillLearn = getCompatibleArray(course.whatYouWillLearn, selectedLanguage)
  const prerequisites = getCompatibleArray(course.prerequisites, selectedLanguage)
  const tags = getCompatibleArray(course.tags, selectedLanguage)

  // Check if course is multilingual
  const isMultilingual = availableLanguages.length > 1

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.close()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Close Preview
              </Button>
              <div className="h-6 w-px bg-border" />
              <Badge variant="secondary" className="text-xs">
                PREVIEW MODE
              </Badge>
              {isMultilingual && (
                <>
                  <div className="h-6 w-px bg-border" />
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Multilingual Content</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Student View
              </div>
              {isMultilingual && (
                <LanguageSelector
                  currentLanguage={selectedLanguage}
                  onLanguageChange={setSelectedLanguage}
                  availableLanguages={availableLanguages}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Language Helper */}
        {isMultilingual && (
          <div className="mb-6">
            <LanguageHelperText currentLanguage={selectedLanguage} />
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Hero */}
            <Card className="overflow-hidden">
              <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <Play className="h-16 w-16 mx-auto mb-4 opacity-80" />
                  <p className="text-sm opacity-90">Course Preview</p>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">{courseTitle}</h1>
                    <p className="text-muted-foreground">by {instructorName}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">${course.price}</div>
                    <Badge 
                      variant={
                        getCompatibleText(course.level, selectedLanguage) === 'beginner' 
                          ? 'secondary' 
                          : getCompatibleText(course.level, selectedLanguage) === 'intermediate' 
                            ? 'default' 
                            : 'destructive'
                      }
                      className="mt-1"
                    >
                      {getCompatibleText(course.level, selectedLanguage)}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-foreground leading-relaxed mb-4">
                  {courseDescription}
                </p>

                {/* Course Tags */}
                {tags && tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Course Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <Users className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                    <div className="text-sm font-medium">{course.enrollmentCount || 0}</div>
                    <div className="text-xs text-muted-foreground">Students</div>
                  </div>
                  <div className="text-center">
                    <Star className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
                    <div className="text-sm font-medium">
                      {course.rating && course.rating > 0 ? course.rating.toFixed(1) : 'No rating'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {course.ratingCount ? `(${course.ratingCount} reviews)` : 'Rating'}
                    </div>
                  </div>
                  <div className="text-center">
                    <Clock className="h-5 w-5 mx-auto mb-1 text-green-600" />
                    <div className="text-sm font-medium">{totalDuration}h</div>
                    <div className="text-xs text-muted-foreground">Duration</div>
                  </div>
                  <div className="text-center">
                    <BookOpen className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                    <div className="text-sm font-medium">{lessons.length}</div>
                    <div className="text-xs text-muted-foreground">Lessons</div>
                  </div>
                </div>

                <Button className="w-full" size="lg">
                  <Play className="h-5 w-5 mr-2" />
                  Enroll Now - ${course.price}
                </Button>
              </CardContent>
            </Card>

            {/* Course Content */}
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
                <CardDescription>
                  {lessons.length} lessons • {totalDuration} hours total length
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lessons.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No course content available yet.</p>
                    </div>
                  ) : (
                    lessons.map((lesson, index) => (
                      <div 
                        key={lesson.id} 
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          lesson.locked ? 'bg-muted/50 opacity-60' : 'bg-card hover:bg-muted/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {lesson.completed ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : lesson.locked ? (
                              <Lock className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <Play className="h-5 w-5 text-blue-500" />
                            )}
                          </div>
                          <div>
                            <h4 className={`font-medium ${lesson.locked ? 'text-muted-foreground' : 'text-foreground'}`}>
                              {index + 1}. {lesson.title}
                            </h4>
                            {lesson.description && (
                              <p className={`text-xs mt-1 ${lesson.locked ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                                {lesson.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className={`text-sm ${lesson.locked ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                          {lesson.duration}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <p className="text-sm font-medium text-foreground">{course.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Level</label>
                  <Badge variant="outline" className="text-xs">
                    {getCompatibleText(course.level, selectedLanguage)}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Language</label>
                  <p className="text-sm font-medium text-foreground">{course.language || 'English'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p className="text-sm text-foreground">
                    {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : 'Recently'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* What You'll Learn */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What You'll Learn</CardTitle>
              </CardHeader>
              <CardContent>
                {whatYouWillLearn && whatYouWillLearn.length > 0 ? (
                  <ul className="space-y-2 text-sm">
                    {whatYouWillLearn.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Master the fundamentals of {course.category.toLowerCase()}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Build practical projects and real-world applications</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Learn industry best practices and methodologies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Get hands-on experience with tools and technologies</span>
                    </li>
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Prerequisites */}
            {prerequisites && prerequisites.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Prerequisites</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {prerequisites.map((prerequisite, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <span>{prerequisite}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Course Features */}
            {(course.certificates || course.lifetimeAccess || course.mobileAccess || course.downloadableResources) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">This Course Includes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {course.certificates && (
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Certificate of completion</span>
                      </li>
                    )}
                    {course.lifetimeAccess && (
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Lifetime access</span>
                      </li>
                    )}
                    {course.mobileAccess && (
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Access on mobile and TV</span>
                      </li>
                    )}
                    {course.downloadableResources && (
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Downloadable resources</span>
                      </li>
                    )}
                    {course.assignmentsCount && course.assignmentsCount > 0 && (
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{course.assignmentsCount} assignments</span>
                      </li>
                    )}
                    {(articlesCount > 0 || course.articlesCount) && (
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{articlesCount || course.articlesCount} articles</span>
                      </li>
                    )}
                    {(videosCount > 0 || course.videosCount) && (
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{videosCount || course.videosCount} videos</span>
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Instructor */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {instructorName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{instructorName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {instructor?.department || instructor?.college || 'Expert Instructor'}
                    </p>
                    {instructor?.coreTeachingSkills && instructor.coreTeachingSkills.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Specializes in: {instructor.coreTeachingSkills.slice(0, 3).join(', ')}
                        {instructor.coreTeachingSkills.length > 3 && '...'}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-foreground">
                  {instructor?.bio || instructor?.description || 
                    `Experienced instructor with expertise in ${course.category.toLowerCase()}. ${
                      getCompatibleArray(course.targetAudience, selectedLanguage).length > 0 
                        ? `This course is designed for ${getCompatibleArray(course.targetAudience, selectedLanguage)[0].toLowerCase()}.`
                        : 'Passionate about teaching and helping students achieve their learning goals.'
                    }`
                  }
                </p>
                
                {/* Debug information (remove in production) */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-3 p-2 bg-muted rounded text-xs">
                    <p><strong>Debug Info:</strong></p>
                    <p>Course instructorId: {course.instructorId || 'Not set'}</p>
                    <p>Course instructor: {course.instructor || 'Not set'}</p>
                    <p>Instructor data loaded: {instructor ? 'Yes' : 'No'}</p>
                    {instructor && (
                      <p>Instructor name: {instructor.firstName} {instructor.lastName}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
