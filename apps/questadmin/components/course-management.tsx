'use client'

import { AssociationSelector } from '@/components/AssociationSelector'
import { CourseDeleteConfirmation } from '@/components/CourseDeleteConfirmation'
import { MultilingualArrayInput, MultilingualInput, MultilingualTextarea } from '@/components/MultilingualInput'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/contexts/AuthContext'
import { CourseCategory } from '@/data/models/course-category'
import { CourseDifficulty } from '@/data/models/course-difficulty'
import { HybridAdminCourse } from '@/data/models/data-model'
import {
    addCourse,
    CreateCourseData,
    deleteCourse,
    getAllCourses,
    updateCourse
} from '@/data/services/admin-course-service'
import { formatDate as safeFormatDate } from '@/lib/date-utils'
import {
    DEFAULT_LANGUAGE,
    RequiredMultilingualArray,
    RequiredMultilingualText
} from '@/lib/multilingual-types'
import {
    createMultilingualArray,
    createMultilingualText,
    getCompatibleArray,
    getCompatibleText
} from '@/lib/multilingual-utils'
import { Edit, Eye, Globe, Plus, Search, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { CourseAssociation } from '@/data/models/course'

interface CourseFormData {
  title: RequiredMultilingualText | string
  instructor: string
  description: RequiredMultilingualText | string
  categoryId: string
  difficultyId: string
  duration: string // Keep as string for form input
  instructorId: string
  // Enhanced fields
  whatYouWillLearn: string[] | RequiredMultilingualArray
  prerequisites: string[] | RequiredMultilingualArray
  tags: string[] | RequiredMultilingualArray
  // Associations
  associations: CourseAssociation[]
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
  const [categories, setCategories] = useState<CourseCategory[]>([])
  const [difficulties, setDifficulties] = useState<CourseDifficulty[]>([])
  const [loadingMasterData, setLoadingMasterData] = useState(true)

  const [formData, setFormData] = useState<CourseFormData>({
    title: multilingualMode ? createMultilingualText('') : '',
    instructor: '',
    description: multilingualMode ? createMultilingualText('') : '',
    categoryId: '',
    difficultyId: '',
    duration: '',
    instructorId: '',
    // Enhanced fields
    whatYouWillLearn: multilingualMode ? createMultilingualArray([]) : [],
    prerequisites: multilingualMode ? createMultilingualArray([]) : [],
    tags: multilingualMode ? createMultilingualArray([]) : [],
    associations: []
  })

  const loadMasterData = async () => {
    try {
      const response = await fetch('/api/master-data')
      if (!response.ok) {
        throw new Error('Failed to fetch master data')
      }
      const data = await response.json()
      setCategories(data.categories)
      setDifficulties(data.difficulties)
    } catch (error) {
      console.error('Error loading master data:', error)
      toast.error('Failed to load categories and difficulties')
    } finally {
      setLoadingMasterData(false)
    }
  }

  const loadCourses = async () => {
    try {
      const fetchedCourses = await getAllCourses()
      // Convert AdminCourse to HybridAdminCourse for compatibility
      const hybridCourses: HybridAdminCourse[] = fetchedCourses.map(course => ({
        ...course,
        title: course.title,
        description: course.description,
        // Map old structure to new for backward compatibility
        category: (course as any).category || 'Unknown',
        level: (course as any).level || 'beginner',
        price: (course as any).price || 0,
        // Add new fields with defaults if missing
        categoryId: (course as any).categoryId || '',
        difficultyId: (course as any).difficultyId || ''
      }))
      setCourses(hybridCourses)
      setFilteredCourses(hybridCourses)
    } catch (error) {
      console.error('Error loading courses:', error)
      toast.error('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourses()
    loadMasterData()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = courses.filter(course => {
        const courseTitle = getCompatibleText(course.title, DEFAULT_LANGUAGE).toLowerCase()
        const courseDescription = getCompatibleText(course.description, DEFAULT_LANGUAGE).toLowerCase()
        const searchLower = searchTerm.toLowerCase()
        
        return courseTitle.includes(searchLower) ||
          course.instructor.toLowerCase().includes(searchLower) ||
          ((course as any).category?.toLowerCase().includes(searchLower)) ||
          courseDescription.includes(searchLower)
      })
      setFilteredCourses(filtered)
    } else {
      setFilteredCourses(courses)
    }
  }, [searchTerm, courses])

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
        categoryId: formData.categoryId,
        difficultyId: formData.difficultyId,
        duration: parseFloat(formData.duration.trim()) || 0,
        instructorId: formData.instructorId || userProfile?.uid || '',
        // Enhanced fields
        associations: formData.associations,
        ...(multilingualMode ? {
          // Include multilingual versions
          multilingualWhatYouWillLearn: typeof formData.whatYouWillLearn === 'object' && !Array.isArray(formData.whatYouWillLearn) 
            ? formData.whatYouWillLearn 
            : undefined,
          multilingualPrerequisites: typeof formData.prerequisites === 'object' && !Array.isArray(formData.prerequisites)
            ? formData.prerequisites
            : undefined,
          multilingualTags: typeof formData.tags === 'object' && !Array.isArray(formData.tags)
            ? formData.tags
            : undefined
        } : {
          // Include simple array versions
          whatYouWillLearn: Array.isArray(formData.whatYouWillLearn) 
            ? formData.whatYouWillLearn 
            : getCompatibleArray(formData.whatYouWillLearn, DEFAULT_LANGUAGE),
          prerequisites: Array.isArray(formData.prerequisites)
            ? formData.prerequisites
            : getCompatibleArray(formData.prerequisites, DEFAULT_LANGUAGE),
          tags: Array.isArray(formData.tags)
            ? formData.tags
            : getCompatibleArray(formData.tags, DEFAULT_LANGUAGE)
        })
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
      categoryId: course.categoryId || '',
      difficultyId: course.difficultyId || '',
      duration: course.duration?.toString() || '',
      instructorId: course.instructorId,
      // Enhanced fields
      whatYouWillLearn: multilingualMode
        ? (typeof course.whatYouWillLearn === 'object' && !Array.isArray(course.whatYouWillLearn)
            ? course.whatYouWillLearn
            : createMultilingualArray(Array.isArray(course.whatYouWillLearn) ? course.whatYouWillLearn : []))
        : (Array.isArray(course.whatYouWillLearn)
            ? course.whatYouWillLearn
            : getCompatibleArray(course.whatYouWillLearn, DEFAULT_LANGUAGE)),
      prerequisites: multilingualMode
        ? (typeof course.prerequisites === 'object' && !Array.isArray(course.prerequisites)
            ? course.prerequisites
            : createMultilingualArray(Array.isArray(course.prerequisites) ? course.prerequisites : []))
        : (Array.isArray(course.prerequisites)
            ? course.prerequisites
            : getCompatibleArray(course.prerequisites, DEFAULT_LANGUAGE)),
      tags: multilingualMode
        ? (typeof course.tags === 'object' && !Array.isArray(course.tags)
            ? course.tags
            : createMultilingualArray(Array.isArray(course.tags) ? course.tags : []))
        : (Array.isArray(course.tags)
            ? course.tags
            : getCompatibleArray(course.tags, DEFAULT_LANGUAGE)),
      associations: Array.isArray((course as any).associations) ? (course as any).associations : []
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
      categoryId: '',
      difficultyId: '',
      duration: '',
      instructorId: '',
      // Enhanced fields
      whatYouWillLearn: multilingualMode ? createMultilingualArray([]) : [],
      prerequisites: multilingualMode ? createMultilingualArray([]) : [],
      tags: multilingualMode ? createMultilingualArray([]) : [],
      associations: []
    })
    setEditingCourse(null)
    setShowForm(false)
  }

  const formatDate = (date: Date | undefined) => {
    return safeFormatDate(date)
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.name || 'Unknown'
  }

  const getDifficultyName = (difficultyId: string) => {
    const difficulty = difficulties.find(d => d.id === difficultyId)
    return difficulty?.name || 'Unknown'
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
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Course Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {multilingualMode && <Globe className="h-5 w-5 text-blue-600" />}
              {editingCourse ? 'Edit Course' : 'Add New Course'}
            </CardTitle>
            <CardDescription>
              {multilingualMode 
                ? 'Create courses with multi-language support'
                : 'Fill in the details to create a new course'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    {multilingualMode && <Globe className="h-4 w-4" />}
                    Course Title
                  </label>
                  {multilingualMode ? (
                    <MultilingualInput
                      label="Course Title"
                      value={formData.title as RequiredMultilingualText}
                      onChange={(value) => setFormData(prev => ({ ...prev, title: value }))}
                      required
                    />
                  ) : (
                    <Input
                      value={formData.title as string}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Course title"
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
                  Description
                </label>
                {multilingualMode ? (
                  <MultilingualTextarea
                    label="Course Description"
                    value={formData.description as RequiredMultilingualText}
                    onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                    required
                  />
                ) : (
                  <textarea
                    className="w-full p-2 border rounded-md"
                    value={formData.description as string}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Course description"
                    rows={3}
                    required
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="categoryId" className="text-sm font-medium">Category</label>
                  <Select 
                    value={formData.categoryId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                    disabled={loadingMasterData}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="difficultyId" className="text-sm font-medium">Difficulty</label>
                  <Select 
                    value={formData.difficultyId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, difficultyId: value }))}
                    disabled={loadingMasterData}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.map((difficulty) => (
                        <SelectItem key={difficulty.id} value={difficulty.id}>
                          {difficulty.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="duration" className="text-sm font-medium">Duration (hours)</label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="Duration in hours"
                    min="0.5"
                    step="0.5"
                    required
                  />
                </div>
              </div>

              {/* Enhanced fields */}
              <div className="space-y-4">
                {/* What You Will Learn */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    {multilingualMode && <Globe className="h-4 w-4" />}
                    What You Will Learn
                  </label>
                  {multilingualMode ? (
                    <MultilingualArrayInput
                      label="Learning Outcomes"
                      value={formData.whatYouWillLearn as RequiredMultilingualArray}
                      onChange={(value) => setFormData(prev => ({ ...prev, whatYouWillLearn: value }))}
                      placeholder="Add learning outcome"
                    />
                  ) : (
                    <div className="space-y-2">
                      {(formData.whatYouWillLearn as string[]).map((item, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={item}
                            onChange={(e) => {
                              const newItems = [...(formData.whatYouWillLearn as string[])]
                              newItems[index] = e.target.value
                              setFormData(prev => ({ ...prev, whatYouWillLearn: newItems }))
                            }}
                            placeholder="What will students learn?"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newItems = (formData.whatYouWillLearn as string[]).filter((_, i) => i !== index)
                              setFormData(prev => ({ ...prev, whatYouWillLearn: newItems }))
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const newItems = [...(formData.whatYouWillLearn as string[]), '']
                          setFormData(prev => ({ ...prev, whatYouWillLearn: newItems }))
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Learning Outcome
                      </Button>
                    </div>
                  )}
                </div>


                
                {/* Prerequisites */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    {multilingualMode && <Globe className="h-4 w-4" />}
                    Prerequisites
                  </label>
                  {multilingualMode ? (
                    <MultilingualArrayInput
                      label="Prerequisites"
                      value={formData.prerequisites as RequiredMultilingualArray}
                      onChange={(value) => setFormData(prev => ({ ...prev, prerequisites: value }))}
                      placeholder="Add prerequisite"
                    />
                  ) : (
                    <div className="space-y-2">
                      {(formData.prerequisites as string[]).map((item, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={item}
                            onChange={(e) => {
                              const newItems = [...(formData.prerequisites as string[])]
                              newItems[index] = e.target.value
                              setFormData(prev => ({ ...prev, prerequisites: newItems }))
                            }}
                            placeholder="Enter prerequisite"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newItems = (formData.prerequisites as string[]).filter((_, i) => i !== index)
                              setFormData(prev => ({ ...prev, prerequisites: newItems }))
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const newItems = [...(formData.prerequisites as string[]), '']
                          setFormData(prev => ({ ...prev, prerequisites: newItems }))
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Prerequisite
                      </Button>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    {multilingualMode && <Globe className="h-4 w-4" />}
                    Course Tags
                  </label>
                  {multilingualMode ? (
                    <MultilingualArrayInput
                      label="Course Tags"
                      value={formData.tags as RequiredMultilingualArray}
                      onChange={(value) => setFormData(prev => ({ ...prev, tags: value }))}
                      placeholder="Add tag"
                    />
                  ) : (
                    <div className="space-y-2">
                      {(formData.tags as string[]).map((item, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={item}
                            onChange={(e) => {
                              const newItems = [...(formData.tags as string[])]
                              newItems[index] = e.target.value
                              setFormData(prev => ({ ...prev, tags: newItems }))
                            }}
                            placeholder="Enter tag"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newItems = (formData.tags as string[]).filter((_, i) => i !== index)
                              setFormData(prev => ({ ...prev, tags: newItems }))
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const newItems = [...(formData.tags as string[]), '']
                          setFormData(prev => ({ ...prev, tags: newItems }))
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Tag
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Associations Section */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Program Associations</label>
                <p className="text-xs text-muted-foreground">
                  Associate this course with academic programs and subjects (optional)
                </p>
                
                {formData.associations.length === 0 && (
                  <div className="text-muted-foreground text-sm text-center py-4 border border-dashed rounded-lg">
                    No associations yet. Click "Add Program Association" to get started.
                  </div>
                )}
                
                {formData.associations.map((assoc, idx) => (
                  <AssociationSelector
                    key={idx}
                    association={assoc}
                    onUpdate={(updated) => {
                      const newAssociations = [...formData.associations]
                      newAssociations[idx] = updated
                      setFormData(prev => ({ ...prev, associations: newAssociations }))
                    }}
                    onRemove={() => {
                      setFormData(prev => ({
                        ...prev,
                        associations: prev.associations.filter((_, i) => i !== idx)
                      }))
                    }}
                  />
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    associations: [
                      ...prev.associations,
                      { collegeId: '', programId: '', yearOrSemester: 1, subjectId: '' }
                    ]
                  }))}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Program Association
                </Button>
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
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Duration</TableHead>
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
                        {getCompatibleText(course.title, DEFAULT_LANGUAGE)}
                      </TableCell>
                      <TableCell>{course.instructor}</TableCell>
                      <TableCell>{getCategoryName(course.categoryId)}</TableCell>
                      <TableCell>{getDifficultyName(course.difficultyId)}</TableCell>
                      <TableCell>{course.duration ? `${course.duration}h` : 'N/A'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
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
