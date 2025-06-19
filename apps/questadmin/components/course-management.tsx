'use client'

import { CourseDeleteConfirmation } from '@/components/CourseDeleteConfirmation'
import { MultilingualInput, MultilingualTextarea } from '@/components/MultilingualInput'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/contexts/AuthContext'
import { HybridAdminCourse } from '@/data/models/data-model'
import {
    addCourse,
    AdminCourse,
    CreateCourseData,
    deleteCourse,
    getAllCourses,
    updateCourse
} from '@/data/services/admin-course-service'
import { enrichCoursesWithRatings } from '@/data/services/course-rating-loader'
import { formatDate as safeFormatDate } from '@/lib/date-utils'
import {
    DEFAULT_LANGUAGE,
    MultilingualText,
    RequiredMultilingualText
} from '@/lib/multilingual-types'
import {
    createMultilingualText,
    getCompatibleText,
    isMultilingualContent
} from '@/lib/multilingual-utils'
import { Edit, Eye, Globe, Plus, Search, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

// Enhanced course interface for multilingual support
interface MultilingualCourse extends Omit<AdminCourse, 'title' | 'description'> {
  title: RequiredMultilingualText | string
  description: MultilingualText | string
}

// Form-specific interface to handle multilingual content
interface CourseFormData {
  title: RequiredMultilingualText | string
  instructor: string
  description: RequiredMultilingualText | string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  price: number
  duration: string // Keep as string for form input
  instructorId: string
}

interface CourseManagementProps {
  multilingualMode?: boolean
}

export function CourseManagement({ multilingualMode = false }: CourseManagementProps) {
  const { userProfile } = useAuth()
  const [courses, setCourses] = useState<HybridAdminCourse[]>([])
  const [filteredCourses, setFilteredCourses] = useState<HybridAdminCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState<HybridAdminCourse | null>(null)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<HybridAdminCourse | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState<CourseFormData>({
    title: multilingualMode ? createMultilingualText('') : '',
    instructor: '',
    description: multilingualMode ? createMultilingualText('') : '',
    category: '',
    level: 'beginner',
    price: 0,
    duration: '',
    instructorId: ''
  })

  useEffect(() => {
    loadCourses()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = courses.filter(course => {
        const courseTitle = getCompatibleText(course.title, DEFAULT_LANGUAGE).toLowerCase()
        const courseDescription = getCompatibleText(course.description, DEFAULT_LANGUAGE).toLowerCase()
        const searchLower = searchTerm.toLowerCase()
        
        return courseTitle.includes(searchLower) ||
          course.instructor.toLowerCase().includes(searchLower) ||
          course.category?.toLowerCase().includes(searchLower) ||
          courseDescription.includes(searchLower)
      })
      setFilteredCourses(filtered)
    } else {
      setFilteredCourses(courses)
    }
  }, [searchTerm, courses])

  const loadCourses = async () => {
    try {
      setLoading(true)
      const fetchedCourses = await getAllCourses()
      // Convert legacy courses to hybrid format
      const hybridCourses: HybridAdminCourse[] = fetchedCourses.map(course => ({
        ...course,
        title: typeof course.title === 'string' ? course.title : course.title,
        description: typeof course.description === 'string' ? course.description : course.description
      }))
      
      // Enrich courses with real rating data
      const coursesWithRatings = await enrichCoursesWithRatings(hybridCourses)
      setCourses(coursesWithRatings)
    } catch (error) {
      console.error('Error loading courses:', error)
      toast.error('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Convert multilingual form data to API format
      const apiData: CreateCourseData = {
        title: typeof formData.title === 'string' 
          ? formData.title 
          : getCompatibleText(formData.title, DEFAULT_LANGUAGE),
        description: typeof formData.description === 'string' 
          ? formData.description 
          : getCompatibleText(formData.description, DEFAULT_LANGUAGE),
        instructor: formData.instructor,
        category: formData.category,
        level: formData.level,
        price: formData.price,
        duration: parseFloat(formData.duration.trim()) || 0,
        instructorId: formData.instructorId || userProfile?.uid || ''
      }
      
      if (editingCourse) {
        await updateCourse(editingCourse.id!, apiData)
        toast.success('Course updated successfully!')
      } else {
        await addCourse(apiData)
        toast.success('Course created successfully!')
      }
      await loadCourses()
      resetForm()
    } catch (error) {
      console.error('Error saving course:', error)
      toast.error('Failed to save course. Please try again.')
    }
  }

  const handleEdit = (course: HybridAdminCourse) => {
    setEditingCourse(course)
    setFormData({
      title: multilingualMode 
        ? (typeof course.title === 'string' ? createMultilingualText(course.title) : course.title)
        : (typeof course.title === 'string' ? course.title : getCompatibleText(course.title, DEFAULT_LANGUAGE)),
      instructor: course.instructor,
      description: multilingualMode
        ? (typeof course.description === 'string' ? createMultilingualText(course.description) : course.description)
        : (typeof course.description === 'string' ? course.description : getCompatibleText(course.description, DEFAULT_LANGUAGE)),
      category: course.category,
      level: course.level,
      price: course.price,
      duration: course.duration.toString(),
      instructorId: course.instructorId
    })
    setShowForm(true)
  }

  const handleDelete = async (course: HybridAdminCourse) => {
    setCourseToDelete(course)
    setShowDeleteConfirmation(true)
  }

  const handleDeleteConfirm = async () => {
    if (!courseToDelete?.id) return
    
    setIsDeleting(true)
    try {
      const success = await deleteCourse(courseToDelete.id)
      if (success) {
        await loadCourses()
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

  const resetForm = () => {
    setFormData({
      title: multilingualMode ? createMultilingualText('') : '',
      instructor: '',
      description: multilingualMode ? createMultilingualText('') : '',
      category: '',
      level: 'beginner',
      price: 0,
      duration: '',
      instructorId: ''
    })
    setEditingCourse(null)
    setShowForm(false)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const formatDate = (date: Date | undefined) => {
    return safeFormatDate(date)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            {multilingualMode && <Globe className="h-8 w-8 text-blue-600" />}
            {multilingualMode ? 'Multilingual Course Management' : 'Course Management'}
          </h1>
          {multilingualMode && (
            <p className="text-muted-foreground mt-2">
              Create and manage courses with multi-language support
            </p>
          )}
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Course
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, instructor, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Course Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingCourse ? 'Edit Course' : 'Add New Course'}</CardTitle>
            <CardDescription>
              {editingCourse ? 'Update course information' : 'Create a new course'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    {multilingualMode && <Globe className="h-4 w-4" />}
                    Course Title *
                  </label>
                  {multilingualMode ? (
                    <MultilingualInput
                      label="Course Title"
                      value={formData.title as RequiredMultilingualText}
                      onChange={(value) => setFormData(prev => ({ ...prev, title: value }))}
                      placeholder="Enter course title"
                      required
                    />
                  ) : (
                    <Input
                      value={formData.title as string}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter course title"
                      required
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="instructor" className="text-sm font-medium">Instructor</label>
                  <Input
                    id="instructor"
                    value={formData.instructor}
                    onChange={(e) => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
                    placeholder="Instructor name"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  {multilingualMode && <Globe className="h-4 w-4" />}
                  Description *
                </label>
                {multilingualMode ? (
                  <MultilingualTextarea
                    label="Description"
                    value={formData.description as RequiredMultilingualText}
                    onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                    placeholder="Course description"
                    rows={4}
                    required
                  />
                ) : (
                  <Input
                    value={formData.description as string}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Course description"
                    required
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">Category</label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Course category"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="level" className="text-sm font-medium">Level</label>
                  <Select value={formData.level} onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => 
                    setFormData(prev => ({ ...prev, level: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="price" className="text-sm font-medium">Price ($)</label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="duration" className="text-sm font-medium">Duration (hours)</label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g., 40"
                    min="0"
                    step="0.5"
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit">
                  {editingCourse ? 'Update Course' : 'Add Course'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Courses ({filteredCourses.length})</CardTitle>
          <CardDescription>
            Manage your courses and their settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No courses found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {isMultilingualContent(course.title) && (
                            <Globe className="h-4 w-4 text-blue-500" />
                          )}
                          {getCompatibleText(course.title, DEFAULT_LANGUAGE)}
                        </div>
                      </TableCell>
                      <TableCell>{course.instructor}</TableCell>
                      <TableCell>{course.category}</TableCell>
                      <TableCell>{course.level}</TableCell>
                      <TableCell>{formatPrice(course.price)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          course.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : course.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {course.status}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(course.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Link href={`/courses/${course.id}/preview`} target="_blank">
                            <Button
                              variant="outline"
                              size="sm"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(course)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(course)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      {courseToDelete && (
        <CourseDeleteConfirmation
          isOpen={showDeleteConfirmation}
          onClose={() => {
            setShowDeleteConfirmation(false)
            setCourseToDelete(null)
          }}
          onConfirm={handleDeleteConfirm}
          courseId={courseToDelete.id!}
          courseTitle={getCompatibleText(courseToDelete.title, DEFAULT_LANGUAGE)}
          isLoading={isDeleting}
        />
      )}
    </div>
  )
}
