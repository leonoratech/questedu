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
import { getAuthHeaders, UserRole } from '@/data/config/firebase-auth'
import { AdminCourse } from '@/data/services/admin-course-service'
import { enrollInCourse, getUserEnrollments } from '@/data/services/enrollment-service'
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
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')
  const [enrolledCourses, setEnrolledCourses] = useState<Set<string>>(new Set())
  const [enrollingCourses, setEnrollingCourses] = useState<Set<string>>(new Set())

  // Check if current user is a student
  const isStudent = user?.role === UserRole.STUDENT

  // Debounce search term
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  useEffect(() => {
    loadCourses(debouncedSearchTerm)
  }, [debouncedSearchTerm])

  useEffect(() => {
    // Debounce the filtering to avoid excessive re-renders during typing
    const timeoutId = setTimeout(() => {
      filterCourses()
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [courses, categoryFilter, levelFilter])

  // Debug logging for search functionality
  useEffect(() => {
    console.log('🔍 Browse Courses Debug Info:', {
      totalCourses: courses.length,
      filteredCourses: filteredCourses.length,
      searchTerm,
      debouncedSearchTerm,
      categoryFilter,
      levelFilter,
      isStudent,
      userRole: user?.role
    })
  }, [courses, filteredCourses, searchTerm, debouncedSearchTerm, categoryFilter, levelFilter, isStudent, user?.role])

  // Fetch all enrolled course IDs for the current student using the service abstraction
  const fetchEnrolledCourseIds = async (): Promise<Set<string>> => {
    try {
      const enrollments = await getUserEnrollments()
      // Only consider active/enrolled/completed enrollments
      const validStatuses = new Set(['enrolled', 'active', 'completed'])
      const courseIds = enrollments
        .filter(e => validStatuses.has(e.status))
        .map(e => e.courseId)
      return new Set(courseIds)
    } catch (error) {
      console.error('Error fetching enrolled courses:', error)
      return new Set()
    }
  }

  const loadCourses = async (searchQuery?: string) => {
    try {
      setLoading(true)
      console.log('Loading courses for browsing...', { searchQuery })
      
      // Build API URL with search parameter if provided
      let apiUrl = '/api/courses?browsing=true'
      if (searchQuery && searchQuery.trim()) {
        apiUrl += `&search=${encodeURIComponent(searchQuery.trim())}`
      }
      
      const response = await fetch(apiUrl, {
        headers: getAuthHeaders(),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData.error,
          details: errorData.details,
          url: apiUrl
        })
        
        if (response.status === 500) {
          toast.error('Server error while loading courses. Please try again.')
        } else if (response.status === 403) {
          toast.error('You do not have permission to access courses.')
        } else {
          toast.error(`Failed to load courses: ${errorData.error || 'Unknown error'}`)
        }
        return
      }
      
      const data = await response.json()
      
      if (!data.success) {
        console.error('API returned unsuccessful response:', data)
        toast.error('Failed to load courses')
        return
      }
      
      const allCourses = data.courses || []
      console.log('Loaded courses:', allCourses.length)
      
      // Only show published courses
      const publishedCourses = allCourses.filter((course: any) => {
        try {
          return course.status === 'published'
        } catch (error) {
          console.warn('Error checking course status:', course.id, error)
          return false
        }
      })
      console.log('Published courses:', publishedCourses.length)
      
      setCourses(publishedCourses)
      
      // Fetch all enrolled course IDs for the student in one call
      if (isStudent) {
        try {
          const enrolled = await fetchEnrolledCourseIds()
          setEnrolledCourses(enrolled)
          console.log('Fetched enrolled course IDs:', Array.from(enrolled))
        } catch (error) {
          console.warn('Failed to fetch enrolled course IDs:', error)
        }
      }
    } catch (error) {
      console.error('Error loading courses:', error)
      toast.error('Failed to load courses. Please try refreshing the page.')
    } finally {
      setLoading(false)
    }
  }

  const filterCourses = () => {
    try {
      let filtered = courses

      // Filter by category
      if (categoryFilter && categoryFilter !== 'all') {
        filtered = filtered.filter(course => {
          try {
            return course.categoryId === categoryFilter
          } catch (error) {
            console.warn('Error filtering by category:', course.id, error)
            return false
          }
        })
      }

      // Filter by level
      if (levelFilter && levelFilter !== 'all') {
        filtered = filtered.filter(course => {
          try {
            return course.difficultyId && course.difficultyId.toLowerCase() === levelFilter
          } catch (error) {
            console.warn('Error filtering by level:', course.id, error)
            return false
          }
        })
      }

      setFilteredCourses(filtered)
    } catch (error) {
      console.error('Error in filterCourses:', error)
      // Fallback to show all courses if filtering fails
      setFilteredCourses(courses)
    }
  }

  const handlePreviewCourse = (courseId: string) => {
    router.push(`/courses/${courseId}/preview`)
  }

  const handleEnrollCourse = async (courseId: string) => {
    if (!courseId) {
      toast.error('Invalid course ID')
      return
    }
    
    if (enrollingCourses.has(courseId)) {
      console.log('Already enrolling in course:', courseId)
      return
    }
    
    // Check if user is a student
    if (!isStudent) {
      toast.error('Only students can enroll in courses')
      return
    }
    
    try {
      setEnrollingCourses(prev => new Set(prev).add(courseId))
      console.log('Starting enrollment for course:', courseId)
      
      const result = await enrollInCourse(courseId)
      
      if (result.success) {
        toast.success('Successfully enrolled in course!')
        setEnrolledCourses(prev => new Set(prev).add(courseId))
        console.log('Successfully enrolled in course:', courseId)
        // Optionally redirect to enrolled courses
        // router.push('/my-enrolled-courses')
      } else {
        const errorMessage = result.error || 'Failed to enroll in course'
        console.error('Enrollment failed:', errorMessage)
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Error enrolling in course:', error)
      toast.error('An error occurred while enrolling. Please try again.')
    } finally {
      setEnrollingCourses(prev => {
        const newSet = new Set(prev)
        newSet.delete(courseId)
        return newSet
      })
    }
  }

  const getUniqueCategories = () => {
    try {
      const categories = courses
        .filter(course => course && course.categoryId) // Filter out invalid courses
        .map(course => course.categoryId)
        .filter(Boolean) // Remove any null/undefined categories
      return Array.from(new Set(categories))
    } catch (error) {
      console.error('Error getting unique categories:', error)
      return []
    }
  }

  const getDifficultyBadgeColor = (difficultyId: string) => {
    switch (difficultyId.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const CourseCard = ({ course }: { course: AdminCourse }) => {
    // Safety checks for course data
    if (!course) {
      console.warn('CourseCard received null/undefined course')
      return null
    }

    const isEnrolled = course.id ? enrolledCourses.has(course.id) : false
    const isEnrolling = course.id ? enrollingCourses.has(course.id) : false
    
    // Safe property access with fallbacks
    const title = course.title || 'Untitled Course'
    const instructor = course.instructor || 'Unknown Instructor'
    const description = course.description || 'No description available'
    const difficultyId = course.difficultyId || 'beginner'
    const categoryId = course.categoryId || 'general'
    const duration = course.duration || 0
    const enrollmentCount = course.enrollmentCount || 0
    const rating = course.rating || 0
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        {/* Course Image */}
        {course.image && (
          <div className="relative h-48 overflow-hidden rounded-t-lg">
            <img
              src={course.image}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-2">{title}</CardTitle>
              <CardDescription className="text-sm">by {instructor}</CardDescription>
            </div>
            <Badge className={getDifficultyBadgeColor(difficultyId)}>
              {difficultyId}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {description}
          </p>
          
          {/* Course Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span>{enrollmentCount} students</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              <span>{duration}h</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>{rating > 0 ? rating.toFixed(1) : 'No rating'}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-purple-600" />
              <span>{categoryId}</span>
            </div>
          </div>

          {/* Course Status */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-blue-600">
              {course.status === 'published' ? 'Available' : 'Coming Soon'}
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
              onClick={() => course.id && handlePreviewCourse(course.id)}
              className="flex-1"
              disabled={!course.id}
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
                  onClick={() => course.id && handleEnrollCourse(course.id)}
                  disabled={isEnrolling || !course.id}
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
                {searchTerm || categoryFilter !== 'all' || levelFilter !== 'all' 
                  ? 'Try adjusting your search criteria or browse all available courses.'
                  : 'No courses are currently available. Check back later for new courses.'
                }
              </p>
              {(searchTerm || categoryFilter !== 'all' || levelFilter !== 'all') && (
                <Button 
                  className="mt-4" 
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('')
                    setDebouncedSearchTerm('')
                    setCategoryFilter('all')
                    setLevelFilter('all')
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses
                .filter(course => course && course.id) // Filter out any invalid courses
                .map(course => (
                  <CourseCard key={course.id} course={course} />
                ))
              }
            </div>
          )}
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}
