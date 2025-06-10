'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTheme } from '@/contexts/ThemeContext'
import { AdminCourse, getCourseById } from '@/data/services/admin-course-service'
import {
    ArrowLeft,
    BookOpen,
    CheckCircle,
    Clock,
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

export default function CoursePreviewPage({ params }: CoursePreviewPageProps) {
  const router = useRouter()
  const { theme } = useTheme()
  const [course, setCourse] = useState<AdminCourse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      } catch (error) {
        console.error('Error loading course:', error)
        setError('Failed to load course details')
      } finally {
        setLoading(false)
      }
    }

    loadCourse()
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

  // Mock course content for preview
  const mockLessons = [
    { id: 1, title: 'Introduction to the Course', duration: '10 min', completed: false, locked: false },
    { id: 2, title: 'Getting Started', duration: '15 min', completed: false, locked: false },
    { id: 3, title: 'Core Concepts', duration: '25 min', completed: false, locked: true },
    { id: 4, title: 'Practical Examples', duration: '30 min', completed: false, locked: true },
    { id: 5, title: 'Advanced Topics', duration: '20 min', completed: false, locked: true },
    { id: 6, title: 'Final Project', duration: '45 min', completed: false, locked: true },
  ]

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
            </div>
            <div className="text-sm text-muted-foreground">
              Student View
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
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
                    <h1 className="text-2xl font-bold text-foreground mb-2">{course.title}</h1>
                    <p className="text-muted-foreground">by {course.instructor || 'Instructor'}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">${course.price}</div>
                    <Badge 
                      variant={course.level === 'beginner' ? 'secondary' : course.level === 'intermediate' ? 'default' : 'destructive'}
                      className="mt-1"
                    >
                      {course.level}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-foreground leading-relaxed mb-6">
                  {course.description}
                </p>

                {/* Course Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <Users className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                    <div className="text-sm font-medium">{course.enrollmentCount || 0}</div>
                    <div className="text-xs text-muted-foreground">Students</div>
                  </div>
                  <div className="text-center">
                    <Star className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
                    <div className="text-sm font-medium">{course.rating?.toFixed(1) || '4.5'}</div>
                    <div className="text-xs text-muted-foreground">Rating</div>
                  </div>
                  <div className="text-center">
                    <Clock className="h-5 w-5 mx-auto mb-1 text-green-600" />
                    <div className="text-sm font-medium">{course.duration}h</div>
                    <div className="text-xs text-muted-foreground">Duration</div>
                  </div>
                  <div className="text-center">
                    <BookOpen className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                    <div className="text-sm font-medium">{mockLessons.length}</div>
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
                  {mockLessons.length} lessons • {course.duration} hours total length
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockLessons.map((lesson, index) => (
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
                        </div>
                      </div>
                      <div className={`text-sm ${lesson.locked ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                        {lesson.duration}
                      </div>
                    </div>
                  ))}
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
                    {course.level}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Language</label>
                  <p className="text-sm font-medium text-foreground">English</p>
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
              </CardContent>
            </Card>

            {/* Instructor */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {course.instructor ? course.instructor.split(' ').map(n => n[0]).join('') : 'IN'}
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{course.instructor || 'Instructor'}</h4>
                    <p className="text-sm text-muted-foreground">Expert Instructor</p>
                  </div>
                </div>
                <p className="text-sm text-foreground">
                  Experienced instructor with expertise in {course.category.toLowerCase()}. 
                  Passionate about teaching and helping students achieve their learning goals.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
