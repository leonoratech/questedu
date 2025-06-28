'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { getAllCourses } from '@/data/services/admin-course-service'
import { CourseEnrollment, getUserEnrollments } from '@/data/services/enrollment-service'
import {
  BookOpen,
  Clock,
  Eye,
  GraduationCap,
  Play,
  Search,
  Star,
  TrendingUp
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function StudentDashboard() {
  const router = useRouter()
  const { user } = useAuth()
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([])
  const [recommendedCourses, setRecommendedCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load user enrollments and recommended courses in parallel
      const [userEnrollments, allCourses] = await Promise.all([
        getUserEnrollments(),
        getAllCourses()
      ])
      
      setEnrollments(userEnrollments)
      
      // Get published courses that user is not enrolled in (recommended)
      const enrolledCourseIds = new Set(userEnrollments.map(e => e.courseId))
      const publishedCourses = allCourses.filter(course => 
        course.status === 'published' && !enrolledCourseIds.has(course.id!)
      )
      
      // Enrich courses with real rating data
      // const coursesWithRatings = await enrichCoursesWithRatings(publishedCourses)
      const sortedCourses = publishedCourses
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 6)
      
      setRecommendedCourses(sortedCourses)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics
  const totalEnrollments = enrollments.length
  const completedCourses = enrollments.filter(e => {
    const progress = e.progress?.completionPercentage || 0
    return e.status === 'completed' || progress === 100
  }).length
  const inProgressCourses = enrollments.filter(e => {
    const progress = e.progress?.completionPercentage || 0
    return progress > 0 && progress < 100
  }).length
  const totalHoursLearned = enrollments.reduce((sum, e) => {
    const timeSpent = e.progress?.timeSpent || 0
    return sum + (timeSpent / 60) // Convert minutes to hours
  }, 0)

  const RecentEnrollmentCard = ({ enrollment }: { enrollment: CourseEnrollment }) => {
    const progress = enrollment.progress?.completionPercentage || 0
    const isCompleted = enrollment.status === 'completed' || progress === 100
    
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/my-enrolled-courses')}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="font-medium text-sm line-clamp-1">{enrollment.course?.title || 'Course Title'}</h4>
              <p className="text-xs text-muted-foreground">by {enrollment.course?.instructor || 'Instructor'}</p>
            </div>
            <Badge variant={isCompleted ? 'default' : 'secondary'} className="text-xs">
              {isCompleted ? 'Completed' : 'In Progress'}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const RecommendedCourseCard = ({ course }: { course: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-sm line-clamp-2">{course.title}</h4>
            <p className="text-xs text-muted-foreground">by {course.instructor}</p>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500" />
              <span>{course.rating || 'New'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span>{course.duration}h</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push(`/courses/${course.id}/preview`)}
              className="flex-1 h-7 text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </Button>
            <Button 
              onClick={() => router.push('/browse-courses')}
              size="sm"
              className="flex-1 h-7 text-xs"
            >
              View All
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse mb-2" />
                <div className="h-4 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-muted rounded animate-pulse" />
          <div className="h-64 bg-muted rounded animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, Student!</h1>
        <p className="text-blue-100 mb-4">Continue your learning journey and discover new courses</p>
        <div className="flex gap-3">
          <Button 
            variant="secondary" 
            onClick={() => router.push('/my-enrolled-courses')}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <Play className="h-4 w-4 mr-2" />
            Continue Learning
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push('/browse-courses')}
            className="border-white/30 text-white hover:bg-white/10"
          >
            <Search className="h-4 w-4 mr-2" />
            Browse Courses
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">Total enrollments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedCourses}</div>
            <p className="text-xs text-muted-foreground">Courses completed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressCourses}</div>
            <p className="text-xs text-muted-foreground">Currently learning</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Learned</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalHoursLearned)}h</div>
            <p className="text-xs text-muted-foreground">Time invested</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Enrollments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Enrollments</CardTitle>
            <CardDescription>Continue where you left off</CardDescription>
          </CardHeader>
          <CardContent>
            {enrollments.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground mb-4">No enrolled courses yet</p>
                <Button onClick={() => router.push('/browse-courses')}>
                  Browse Courses
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {enrollments.slice(0, 3).map(enrollment => (
                  <RecentEnrollmentCard key={enrollment.id} enrollment={enrollment} />
                ))}
                {enrollments.length > 3 && (
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/my-enrolled-courses')}
                    className="w-full"
                  >
                    View All Enrolled Courses
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommended Courses */}
        <Card>
          <CardHeader>
            <CardTitle>Recommended for You</CardTitle>
            <CardDescription>Popular courses you might like</CardDescription>
          </CardHeader>
          <CardContent>
            {recommendedCourses.length === 0 ? (
              <div className="text-center py-8">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground mb-4">No recommendations available</p>
                <Button onClick={() => router.push('/browse-courses')}>
                  Browse All Courses
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recommendedCourses.slice(0, 3).map(course => (
                  <RecommendedCourseCard key={course.id} course={course} />
                ))}
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/browse-courses')}
                  className="w-full"
                >
                  Browse All Courses
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
