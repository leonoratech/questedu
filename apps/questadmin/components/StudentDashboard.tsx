'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { getAllCourses } from '@/data/services/admin-course-service'

import {
  Clock,
  Eye,
  Search,
  Star
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function StudentDashboard() {
  const router = useRouter()
  const { user } = useAuth()
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
      // Only load recommended courses, no enrollments
      const [allCourses] = await Promise.all([
        getAllCourses()
      ])
      // You may want to sort/filter courses for recommendations
      setRecommendedCourses(allCourses)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
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
        <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
        <p className="text-blue-100 mb-4">Discover new courses and start learning today</p>
        <div className="flex gap-3">
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

      {/* Only show recommended courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-2">
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
                {recommendedCourses.slice(0, 6).map(course => (
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
