'use client'

import { AuthGuard } from '@/components/AuthGuard'
import { CourseReviewDialog } from '@/components/CourseReviewDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/data/config/firebase-auth'
import { getCourseById, getCourseTopics } from '@/data/services/admin-course-service'
import { getUserEnrollments } from '@/data/services/enrollment-service'
import { DEFAULT_LANGUAGE } from '@/lib/multilingual-types'
import { getCompatibleText } from '@/lib/multilingual-utils'
import {
    ArrowLeft,
    BookOpen,
    CheckCircle,
    Clock,
    Play,
    Star,
    Target,
    Trophy
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface CourseLearnPageProps {
  params: Promise<{ id: string }>
}

interface LearningCourse {
  id: string
  title: string
  description: string
  instructor: string
  category: string
  level: string
  duration: number
  rating?: number
  image?: string
}

interface LearningTopic {
  id: string
  title: string
  description?: string
  order: number
  duration?: number
  videoUrl?: string
  materials: any[]
  learningObjectives: string[]
  isCompleted: boolean
  isLocked: boolean
}

interface LearningProgress {
  completedTopics: string[]
  totalTopics: number
  completionPercentage: number
  timeSpent: number
  currentTopicId?: string
}

export default function CourseLearnPage({ params }: CourseLearnPageProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [courseId, setCourseId] = useState<string>('')
  const [course, setCourse] = useState<LearningCourse | null>(null)
  const [topics, setTopics] = useState<LearningTopic[]>([])
  const [progress, setProgress] = useState<LearningProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showRatingDialog, setShowRatingDialog] = useState(false)

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setCourseId(resolvedParams.id)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (courseId) {
      loadCourseData()
    }
  }, [courseId, user])

  const loadCourseData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load course details
      const courseData = await getCourseById(courseId)
      if (!courseData) {
        throw new Error('Course not found')
      }

      // Transform course data
      const learningCourse: LearningCourse = {
        id: courseData.id!,
        title: typeof courseData.title === 'string' 
          ? courseData.title 
          : getCompatibleText(courseData.title, DEFAULT_LANGUAGE),
        description: typeof courseData.description === 'string' 
          ? courseData.description 
          : getCompatibleText(courseData.description, DEFAULT_LANGUAGE),
        instructor: courseData.instructor,
        category: courseData.category,
        level: typeof courseData.level === 'string' 
          ? courseData.level 
          : getCompatibleText(courseData.level, DEFAULT_LANGUAGE),
        duration: courseData.duration || 0,
        rating: courseData.rating
      }
      setCourse(learningCourse)

      // Load topics
      const topicsData = await getCourseTopics(courseId)
      
      // Load user progress
      const enrollments = await getUserEnrollments()
      const enrollment = enrollments.find(e => e.courseId === courseId)
      
      if (!enrollment) {
        throw new Error('You are not enrolled in this course')
      }

      const userProgress = enrollment.progress || {
        completedTopics: [],
        totalTopics: topicsData.length,
        completionPercentage: 0,
        timeSpent: 0
      }

      // Transform topics with progress
      const learningTopics: LearningTopic[] = topicsData
        .sort((a, b) => a.order - b.order)
        .map((topic, index) => {
          const isCompleted = userProgress.completedTopics.includes(topic.id!)
          const isLocked = index > 0 && !userProgress.completedTopics.includes(topicsData[index - 1].id!)
          
          return {
            id: topic.id!,
            title: typeof topic.title === 'string' 
              ? topic.title 
              : getCompatibleText(topic.title, DEFAULT_LANGUAGE),
            description: typeof topic.description === 'string' 
              ? topic.description 
              : getCompatibleText(topic.description, DEFAULT_LANGUAGE),
            order: topic.order,
            duration: topic.duration,
            videoUrl: topic.videoUrl,
            materials: topic.materials || [],
            learningObjectives: Array.isArray(topic.learningObjectives) 
              ? topic.learningObjectives 
              : typeof topic.learningObjectives === 'string'
                ? [topic.learningObjectives]
                : getCompatibleText(topic.learningObjectives, DEFAULT_LANGUAGE) 
                  ? [getCompatibleText(topic.learningObjectives, DEFAULT_LANGUAGE)]
                  : [],
            isCompleted,
            isLocked: index > 0 && isLocked
          }
        })

      setTopics(learningTopics)
      setProgress(userProgress)

    } catch (err) {
      console.error('Error loading course data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load course')
      toast.error('Failed to load course data')
    } finally {
      setLoading(false)
    }
  }

  const handleStartTopic = (topicId: string) => {
    router.push(`/courses/${courseId}/learn/topic/${topicId}`)
  }

  const handleContinueLearning = () => {
    const nextIncompleteTopicIndex = topics.findIndex(topic => !topic.isCompleted && !topic.isLocked)
    if (nextIncompleteTopicIndex !== -1) {
      const nextTopic = topics[nextIncompleteTopicIndex]
      handleStartTopic(nextTopic.id)
    } else {
      // All topics completed, show rating dialog
      setShowRatingDialog(true)
    }
  }

  const handleRatingSubmitted = () => {
    setShowRatingDialog(false)
    loadCourseData() // Reload to update any changes
    toast.success('Thank you for rating the course!')
  }

  const getTotalDuration = () => {
    return topics.reduce((total, topic) => total + (topic.duration || 0), 0)
  }

  const getProgressStats = () => {
    const completed = topics.filter(t => t.isCompleted).length
    const total = topics.length
    const percentage = total > 0 ? (completed / total) * 100 : 0
    
    return { completed, total, percentage }
  }

  if (loading) {
    return (
      <AuthGuard requiredRole={UserRole.STUDENT}>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="space-y-6">
              <div className="h-8 bg-muted rounded animate-pulse" />
              <div className="h-64 bg-muted rounded-lg animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-32 bg-muted rounded animate-pulse" />
                <div className="h-32 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (error || !course) {
    return (
      <AuthGuard requiredRole={UserRole.STUDENT}>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Course</h3>
                <p className="text-red-600 mb-4">{error || 'Course not found'}</p>
                <Button variant="outline" onClick={() => router.back()}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AuthGuard>
    )
  }

  const stats = getProgressStats()

  return (
    <AuthGuard requiredRole={UserRole.STUDENT}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {course.category}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {course.level}
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
                <p className="text-lg opacity-90 mb-4">{course.description}</p>
                <div className="flex items-center gap-6 text-sm opacity-90">
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    {topics.length} Topics
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {getTotalDuration()} minutes
                  </span>
                  {course.rating && (
                    <span className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-current" />
                      {course.rating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <Card className="bg-white/10 border-white/20">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold mb-2">{stats.percentage.toFixed(0)}%</div>
                      <div className="text-sm opacity-90">Course Progress</div>
                    </div>
                    <Progress value={stats.percentage} className="mb-4" />
                    <div className="text-center text-sm opacity-90 mb-4">
                      {stats.completed} of {stats.total} topics completed
                    </div>
                    <Button 
                      onClick={handleContinueLearning}
                      className="w-full bg-white text-blue-600 hover:bg-gray-100"
                      size="lg"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      {stats.completed === 0 ? 'Start Learning' : 
                       stats.percentage === 100 ? 'Course Complete' : 'Continue Learning'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Topics List */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-6">Course Topics</h2>
              <div className="space-y-4">
                {topics.map((topic, index) => (
                  <Card 
                    key={topic.id} 
                    className={`transition-all ${
                      topic.isLocked 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:shadow-md cursor-pointer'
                    } ${topic.isCompleted ? 'border-green-200 bg-green-50' : ''}`}
                    onClick={() => !topic.isLocked && handleStartTopic(topic.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              topic.isCompleted 
                                ? 'bg-green-500 text-white' 
                                : topic.isLocked 
                                ? 'bg-gray-300 text-gray-500'
                                : 'bg-blue-500 text-white'
                            }`}>
                              {topic.isCompleted ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                index + 1
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{topic.title}</h3>
                              {topic.duration && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {topic.duration} minutes
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {topic.description && (
                            <p className="text-muted-foreground mb-3">{topic.description}</p>
                          )}
                          
                          {topic.learningObjectives.length > 0 && (
                            <div className="mb-3">
                              <p className="text-sm font-medium text-muted-foreground mb-1">
                                Learning Objectives:
                              </p>
                              <ul className="text-sm space-y-1">
                                {topic.learningObjectives.slice(0, 2).map((objective, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <Target className="h-3 w-3 mt-0.5 text-blue-500 flex-shrink-0" />
                                    {objective}
                                  </li>
                                ))}
                                {topic.learningObjectives.length > 2 && (
                                  <li className="text-muted-foreground">
                                    ... and {topic.learningObjectives.length - 2} more
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {topic.videoUrl && (
                              <span className="flex items-center gap-1">
                                <Play className="h-3 w-3" />
                                Video
                              </span>
                            )}
                            {topic.materials.length > 0 && (
                              <span className="flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                {topic.materials.length} Materials
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          {topic.isCompleted ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          ) : topic.isLocked ? (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-500">
                              Locked
                            </Badge>
                          ) : (
                            <Button size="sm">
                              <Play className="h-3 w-3 mr-1" />
                              Start
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Progress Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {stats.completed}/{stats.total}
                        </span>
                      </div>
                      <Progress value={stats.percentage} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                        <div className="text-xs text-muted-foreground">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {progress?.timeSpent ? Math.round(progress.timeSpent / 60) : 0}h
                        </div>
                        <div className="text-xs text-muted-foreground">Time Spent</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Achievement */}
              {stats.percentage === 100 && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="p-6 text-center">
                    <Trophy className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-yellow-800 mb-2">Congratulations!</h3>
                    <p className="text-sm text-yellow-700 mb-4">
                      You've completed the entire course!
                    </p>
                    <Button 
                      onClick={() => setShowRatingDialog(true)}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Rate Course
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              {/* Course Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Course Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Instructor</div>
                    <div className="font-medium">{course.instructor}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Category</div>
                    <div className="font-medium">{course.category}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Level</div>
                    <div className="font-medium">{course.level}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Duration</div>
                    <div className="font-medium">{getTotalDuration()} minutes</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Course Rating Dialog */}
        {showRatingDialog && (
          <CourseReviewDialog
            isOpen={showRatingDialog}
            onClose={() => setShowRatingDialog(false)}
            courseId={courseId}
            courseTitle={course.title}
            onReviewSubmitted={handleRatingSubmitted}
          />
        )}
      </div>
    </AuthGuard>
  )
}
