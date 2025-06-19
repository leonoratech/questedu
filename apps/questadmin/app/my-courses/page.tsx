'use client'

import { AdminLayout } from '@/components/AdminLayout'
import { AuthGuard } from '@/components/AuthGuard'
import { CourseDeleteConfirmation } from '@/components/CourseDeleteConfirmation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { AdminCourse, deleteCourse, getCoursesByInstructor } from '@/data/services/admin-course-service'
import { enrichCoursesWithRatings } from '@/data/services/course-rating-loader'
import {
    BookOpen,
    Clock,
    Edit,
    Eye,
    Plus,
    Star,
    Trash2,
    Users
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function MyCoursesPage() {
  const { user, userProfile } = useAuth()
  const [courses, setCourses] = useState<AdminCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<AdminCourse | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user || !userProfile) {
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      console.log('Loading courses for user:', user.uid)
      const userCourses = await getCoursesByInstructor(user.uid)
      console.log('Fetched courses:', userCourses.length)
      
      // Enrich courses with real rating data from database
      const coursesWithRatings = await enrichCoursesWithRatings(userCourses)
      setCourses(coursesWithRatings)
    } catch (error) {
      console.error('Error loading courses:', error)
      toast.error('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCourse = async () => {
    if (!courseToDelete?.id) return
    
    setIsDeleting(true)
    try {
      const success = await deleteCourse(courseToDelete.id)
      if (success) {
        setCourses(courses.filter(course => course.id !== courseToDelete.id))
        toast.success('Course deleted successfully')
      } else {
        toast.error('Failed to delete course')
      }
    } catch (error) {
      console.error('Error deleting course:', error)
      toast.error('Failed to delete course')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirmation(false)
      setCourseToDelete(null)
    }
  }

  const handleDeleteClick = (course: AdminCourse) => {
    setCourseToDelete(course)
    setShowDeleteConfirmation(true)
  }

  if (loading) {
    return (
      <AuthGuard>
        <AdminLayout title="My Courses">
          <div className="space-y-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  const publishedCourses = courses.filter(course => course.status === 'published')
  const totalEnrollments = courses.reduce((acc, course) => acc + (course.enrollmentCount || 0), 0)
  const coursesWithRatings = courses.filter(course => course.rating && course.rating > 0)
  const averageRating = coursesWithRatings.length > 0 
    ? coursesWithRatings.reduce((acc, course) => acc + (course.rating || 0), 0) / coursesWithRatings.length 
    : 0

  return (
    <AuthGuard>
      <AdminLayout title="My Courses">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
              <p className="text-muted-foreground">Manage courses you've created</p>
            </div>
            <Link href="/courses/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </Link>
          </div>

          {/* Course Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{courses.length}</div>
                <p className="text-xs text-muted-foreground">
                  {publishedCourses.length} published
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEnrollments}</div>
                <p className="text-xs text-muted-foreground">
                  Across all courses
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  From student reviews
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Courses List */}
          <div className="space-y-4">
            {courses.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No courses yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start creating your first course to share your knowledge.
                    </p>
                    <Link href="/courses/new">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Course
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              courses.map((course) => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  onDelete={handleDeleteClick}
                />
              ))
            )}
          </div>

          {/* Delete Confirmation Dialog */}
          {courseToDelete && (
            <CourseDeleteConfirmation
              isOpen={showDeleteConfirmation}
              onClose={() => {
                setShowDeleteConfirmation(false)
                setCourseToDelete(null)
              }}
              onConfirm={handleDeleteCourse}
              courseId={courseToDelete.id!}
              courseTitle={courseToDelete.title}
              isLoading={isDeleting}
            />
          )}
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}

function CourseCard({ course, onDelete }: { course: AdminCourse; onDelete: (course: AdminCourse) => void }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{course.title}</CardTitle>
            <CardDescription className="mt-2">{course.description}</CardDescription>
          </div>
          <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
            {course.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Course Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{course.enrollmentCount || 0} students</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4" />
              <span>
                {course.rating && course.rating > 0 ? `${course.rating.toFixed(1)}` : 'No ratings'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{course.duration || 'TBD'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>0 modules</span>
            </div>
          </div>

          {/* Course Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <span className="text-sm text-muted-foreground">
              Created on {course.createdAt?.toLocaleDateString() || 'Unknown'}
            </span>
            <div className="flex gap-2">
              <Link href={`/courses/${course.id}/preview`} target="_blank">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </Link>
              <Link href={`/courses/${course.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDelete(course)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
