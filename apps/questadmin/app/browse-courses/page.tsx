'use client'

import { AdminLayout } from '@/components/AdminLayout'
import { AuthGuard } from '@/components/AuthGuard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/data/config/firebase-auth'
import { AdminCourse, getAllCoursesForBrowsing } from '@/data/services/admin-course-service'
import { enrichCoursesWithRatings } from '@/data/services/course-rating-loader'
import { enrollInCourse, isEnrolledInCourse } from '@/data/services/enrollment-service'
import {
    BookOpen,
    Clock,
    Eye,
    Search,
    Star,
    Users
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface BrowseCoursesPageProps {}

export default function BrowseCoursesPage({}: BrowseCoursesPageProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [courses, setCourses] = useState<AdminCourse[]>([])
  const [filteredCourses, setFilteredCourses] = useState<AdminCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')
  const [enrolledCourses, setEnrolledCourses] = useState<Set<string>>(new Set())
  const [enrollingCourses, setEnrollingCourses] = useState<Set<string>>(new Set())

  // Check if current user is a student
  const isStudent = user?.role === UserRole.STUDENT

  useEffect(() => {
    loadCourses()
  }, [])

  useEffect(() => {
    filterCourses()
  }, [courses, searchTerm, categoryFilter, levelFilter])

  const loadCourses = async () => {
    try {
      setLoading(true)
      const allCourses = await getAllCoursesForBrowsing()
      // Only show published courses to students
      const publishedCourses = allCourses.filter(course => course.status === 'published')
      
      // Enrich courses with real rating data from database
      const coursesWithRatings = await enrichCoursesWithRatings(publishedCourses)
      setCourses(coursesWithRatings)
      
      // Check enrollment status for each course (only for students)
      if (isStudent) {
        const enrolled = new Set<string>()
        for (const course of coursesWithRatings) {
          if (course.id && await isEnrolledInCourse(course.id)) {
            enrolled.add(course.id)
          }
        }
        setEnrolledCourses(enrolled)
      }
    } catch (error) {
      console.error('Error loading courses:', error)
      toast.error('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  const filterCourses = () => {
    let filtered = courses

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(course => course.category === categoryFilter)
    }

    // Filter by level
    if (levelFilter !== 'all') {
      filtered = filtered.filter(course => course.level.toLowerCase() === levelFilter)
    }

    setFilteredCourses(filtered)
  }

  const handlePreviewCourse = (courseId: string) => {
    router.push(`/courses/${courseId}/preview`)
  }

  const handleEnrollCourse = async (courseId: string) => {
    if (enrollingCourses.has(courseId)) return
    
    // Check if user is a student
    if (!isStudent) {
      toast.error('Only students can enroll in courses')
      return
    }
    
    try {
      setEnrollingCourses(prev => new Set(prev).add(courseId))
      
      const result = await enrollInCourse(courseId)
      
      if (result.success) {
        toast.success('Successfully enrolled in course!')
        setEnrolledCourses(prev => new Set(prev).add(courseId))
        // Optionally redirect to enrolled courses
        // router.push('/my-enrolled-courses')
      } else {
        toast.error(result.error || 'Failed to enroll in course')
      }
    } catch (error) {
      console.error('Error enrolling in course:', error)
      toast.error('An error occurred while enrolling')
    } finally {
      setEnrollingCourses(prev => {
        const newSet = new Set(prev)
        newSet.delete(courseId)
        return newSet
      })
    }
  }

  const getUniqueCategories = () => {
    const categories = courses.map(course => course.category)
    return Array.from(new Set(categories))
  }

  const getLevelBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const CourseCard = ({ course }: { course: AdminCourse }) => {
    const isEnrolled = course.id ? enrolledCourses.has(course.id) : false
    const isEnrolling = course.id ? enrollingCourses.has(course.id) : false
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
              <CardDescription className="text-sm">by {course.instructor}</CardDescription>
            </div>
            <Badge className={getLevelBadgeColor(course.level)}>
              {course.level}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {course.description}
          </p>
          
          {/* Course Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span>{course.enrollmentCount || 0} students</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              <span>{course.duration}h</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>{course.rating || 'No rating'}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-purple-600" />
              <span>{course.category}</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-bold text-green-600">
              {course.price > 0 ? `$${course.price}` : 'Free'}
            </span>
            {isEnrolled && (
              <Badge className="bg-green-100 text-green-800">Enrolled</Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePreviewCourse(course.id!)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            {isStudent ? (
              isEnrolled ? (
                <Button 
                  onClick={() => router.push('/my-enrolled-courses')}
                  className="flex-1"
                >
                  Go to Course
                </Button>
              ) : (
                <Button 
                  onClick={() => handleEnrollCourse(course.id!)}
                  disabled={isEnrolling}
                  className="flex-1"
                >
                  {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                </Button>
              )
            ) : (
              <Button 
                variant="secondary"
                size="sm"
                disabled
                className="flex-1"
                title={user?.role === UserRole.INSTRUCTOR ? "Instructors can preview courses but cannot enroll" : "Only students can enroll in courses"}
              >
                {user?.role === UserRole.INSTRUCTOR ? 'Preview Only' : 'Student Enrollment Only'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <AuthGuard>
        <AdminLayout>
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
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
    <AuthGuard>
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Browse Courses</h1>
            <p className="text-muted-foreground">
              {isStudent 
                ? "Discover and enroll in courses that match your interests"
                : "Explore available courses and preview content from other instructors"
              }
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search">Search Courses</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by title, instructor, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {getUniqueCategories().map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Level Filter */}
              <div className="space-y-2">
                <Label>Level</Label>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Showing {filteredCourses.length} of {courses.length} available courses
            </p>
          </div>

          {/* Course Grid */}
          {filteredCourses.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No courses found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or browse all available courses.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}
