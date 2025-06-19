'use client'

import { AdminLayout } from '@/components/AdminLayout'
import { AuthGuard } from '@/components/AuthGuard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/data/config/firebase-auth'
import { CourseEnrollment, getUserEnrollments } from '@/data/services/enrollment-service'
import {
    BookOpen,
    CheckCircle,
    Clock,
    Play,
    Star,
    TrendingUp
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface EnrolledCourseData extends CourseEnrollment {
  // Additional display properties can be added here
}

export default function MyEnrolledCoursesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourseData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEnrolledCourses()
  }, [user])

  const loadEnrolledCourses = async () => {
    try {
      setLoading(true)
      const enrollments = await getUserEnrollments()
      setEnrolledCourses(enrollments)
    } catch (error) {
      console.error('Error loading enrolled courses:', error)
      toast.error('Failed to load enrolled courses')
    } finally {
      setLoading(false)
    }
  }

  const handleContinueCourse = (courseId: string) => {
    router.push(`/courses/${courseId}/learn`)
  }

  const handleViewCertificate = (courseId: string) => {
    router.push(`/courses/${courseId}/certificate`)
  }

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-green-500'
    if (progress >= 50) return 'bg-blue-500'
    return 'bg-yellow-500'
  }

  const getStatusBadge = (status: string, progress: number) => {
    if (status === 'completed' || progress === 100) {
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>
    }
    if (progress > 0) {
      return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
    }
    return <Badge className="bg-gray-100 text-gray-800">Not Started</Badge>
  }

  const EnrolledCourseCard = ({ course }: { course: EnrolledCourseData }) => {
    const courseProgress = course.progress?.completionPercentage || 0
    const isCompleted = course.status === 'completed' || courseProgress === 100
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-2">{course.course?.title || 'Course Title'}</CardTitle>
              <CardDescription className="text-sm">by {course.course?.instructor || 'Instructor'}</CardDescription>
            </div>
            {getStatusBadge(course.status, courseProgress)}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {course.course?.description || 'Course description'}
          </p>
          
          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">{courseProgress}%</span>
            </div>
            <Progress value={courseProgress} className="h-2" />
          </div>

          {/* Course Info */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              <span>{course.course?.duration || 0}h duration</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>{course.course?.rating || 'No rating'} rating</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-purple-600" />
              <span>{course.course?.category || 'General'}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span>{course.course?.level || 'Beginner'}</span>
            </div>
          </div>

          {/* Enrollment Info */}
          <div className="text-xs text-muted-foreground mb-4">
            Enrolled on {course.enrolledAt.toLocaleDateString()}
            {course.lastAccessedAt && (
              <span> • Last accessed {course.lastAccessedAt.toLocaleDateString()}</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {isCompleted ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleContinueCourse(course.courseId)}
                  className="flex-1"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Review Course
                </Button>
                <Button 
                  onClick={() => handleViewCertificate(course.courseId)}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Certificate
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => handleContinueCourse(course.courseId)}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                {courseProgress > 0 ? 'Continue Learning' : 'Start Learning'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Summary statistics
  const completedCourses = enrolledCourses.filter(course => {
    const progress = course.progress?.completionPercentage || 0
    return course.status === 'completed' || progress === 100
  })
  const inProgressCourses = enrolledCourses.filter(course => {
    const progress = course.progress?.completionPercentage || 0
    return progress > 0 && progress < 100
  })
  const notStartedCourses = enrolledCourses.filter(course => {
    const progress = course.progress?.completionPercentage || 0
    return progress === 0
  })
  const totalHours = enrolledCourses.reduce((sum, course) => sum + (course.course?.duration || 0), 0)

  if (loading) {
    return (
      <AuthGuard requiredRole={UserRole.STUDENT}>
        <AdminLayout>
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-80 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredRole={UserRole.STUDENT}>
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">My Enrolled Courses</h1>
            <p className="text-muted-foreground">
              Track your learning progress and continue your education journey
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{enrolledCourses.length}</div>
                <p className="text-xs text-muted-foreground">Enrolled courses</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{completedCourses.length}</div>
                <p className="text-xs text-muted-foreground">Courses completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{inProgressCourses.length}</div>
                <p className="text-xs text-muted-foreground">Currently learning</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalHours}h</div>
                <p className="text-xs text-muted-foreground">Learning content</p>
              </CardContent>
            </Card>
          </div>

          {/* Course List */}
          {enrolledCourses.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No enrolled courses yet</h3>
              <p className="text-muted-foreground mb-6">
                Start your learning journey by browsing and enrolling in courses.
              </p>
              <Button onClick={() => router.push('/browse-courses')}>
                Browse Courses
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map(course => (
                <EnrolledCourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}
