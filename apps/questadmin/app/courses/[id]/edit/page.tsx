'use client'

import { AuthGuard } from '@/components/AuthGuard'
import { CourseAssociationManager } from '@/components/CourseAssociationManager'
import { CourseImageUpload } from '@/components/CourseImageUpload'
import { CourseQuestionsManager } from '@/components/CourseQuestionsManager'
import { CourseTopicsManager } from '@/components/CourseTopicsManager'
import { MultilingualArrayInput, MultilingualInput, MultilingualTextarea } from '@/components/MultilingualInput'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/data/config/firebase-auth'
import { CourseAssociation } from '@/data/models/course'
import { CourseCategory } from '@/data/models/course-category'
import { CourseDifficulty } from '@/data/models/course-difficulty'
import { AdminCourse, getCourseById, updateCourse } from '@/data/services/admin-course-service'
import { getMasterData } from '@/data/services/course-master-data-service'
import { ImageUploadResult } from '@/data/services/image-upload-service'
import { DEFAULT_LANGUAGE, MultilingualArray, MultilingualText, SupportedLanguage } from '@/lib/multilingual-types'
import { createMultilingualArray, createMultilingualText, getAvailableLanguages, getCompatibleArray, getCompatibleText, isMultilingualContent } from '@/lib/multilingual-utils'
import { ArrowLeft, BookOpen, Clock, FileText, Globe, HelpCircle, Languages, Settings, Star, TrendingUp, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface UnifiedCourseFormData {
  title: string | MultilingualText
  description: string | MultilingualText
  categoryId: string
  difficultyId: string
  duration: string // Keep as string for form input
  status: 'draft' | 'published' | 'archived'
  // Image fields
  image?: string
  imageFileName?: string
  imageStoragePath?: string
  thumbnailUrl?: string
  // Association fields
  association?: CourseAssociation
  // Language configuration
  primaryLanguage: SupportedLanguage
  supportedLanguages: SupportedLanguage[]
  enableTranslation: boolean
  // Enhanced fields
  whatYouWillLearn: string[] | MultilingualArray
  prerequisites: string[] | MultilingualArray
  tags: string[] | MultilingualArray
  // UI state
  multilingualMode: boolean
}

const categories = [
  'Technology',
  'Business',
  'Design',
  'Marketing',
  'Personal Development',
  'Languages',
  'Science',
  'Arts & Crafts',
  'Health & Fitness',
  'Music',
  'Photography',
  'Other'
]

interface EditCoursePageProps {
  params: Promise<{ id: string }>
}

export default function UnifiedEditCoursePage({ params }: EditCoursePageProps) {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [courseId, setCourseId] = useState<string>('')
  const [course, setCourse] = useState<AdminCourse | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<CourseCategory[]>([])
  const [difficulties, setDifficulties] = useState<CourseDifficulty[]>([])
  const [formData, setFormData] = useState<UnifiedCourseFormData>({
    title: '',
    description: '',
    categoryId: '',
    difficultyId: '',
    duration: '',
    status: 'draft',
    // Language configuration defaults
    primaryLanguage: DEFAULT_LANGUAGE,
    supportedLanguages: [DEFAULT_LANGUAGE],
    enableTranslation: false,
    // Enhanced fields
    whatYouWillLearn: [],
    prerequisites: [],
    tags: [],
    // UI state
    multilingualMode: false
  })

  // Load master data on mount
  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const { categories: categoriesData, difficulties: difficultiesData } = await getMasterData()
        setCategories(categoriesData)
        setDifficulties(difficultiesData)
      } catch (error) {
        console.error('Failed to load master data:', error)
        toast.error('Failed to load categories and difficulties')
      }
    }

    loadMasterData()
  }, [])

  // Get course ID from params
  useEffect(() => {
    async function getParams() {
      const resolvedParams = await params
      setCourseId(resolvedParams.id)
    }
    getParams()
  }, [params])

  // Fetch course data
  useEffect(() => {
    async function fetchCourse() {
      if (!courseId) return
      
      try {
        setFetchLoading(true)
        const courseData = await getCourseById(courseId)
        
        if (courseData) {
          setCourse(courseData)
          
          // // Enrich course with real rating data
          // const courseWithRating = await enrichCourseWithRating(courseData)
          // setCourse(courseWithRating)
          
          // Detect if course has multilingual content
          const hasMultilingualTitle = isMultilingualContent(courseData.title)
          const hasMultilingualDescription = isMultilingualContent(courseData.description)
          const isMultilingual = hasMultilingualTitle || hasMultilingualDescription
          
          // Determine available languages
          const languages = new Set<SupportedLanguage>([DEFAULT_LANGUAGE])
          if (hasMultilingualTitle) {
            getAvailableLanguages(courseData.title as MultilingualText).forEach(lang => languages.add(lang))
          }
          if (hasMultilingualDescription) {
            getAvailableLanguages(courseData.description as MultilingualText).forEach(lang => languages.add(lang))
          }
          
          setFormData({
            title: courseData.title,
            description: courseData.description,
            categoryId: courseData.categoryId || '',
            difficultyId: courseData.difficultyId || '',
            duration: courseData.duration !== undefined && courseData.duration !== null ? courseData.duration.toString() : '', // Convert number to string for form, handle undefined/null
            status: courseData.status,
            // Image fields
            image: courseData.image,
            imageFileName: courseData.imageFileName,
            imageStoragePath: courseData.imageStoragePath,
            thumbnailUrl: courseData.thumbnailUrl,
            // Language configuration
            primaryLanguage: DEFAULT_LANGUAGE,
            supportedLanguages: Array.from(languages),
            enableTranslation: isMultilingual,
            // Enhanced fields with multilingual support
            whatYouWillLearn: courseData.whatYouWillLearn || [],
            prerequisites: courseData.prerequisites || [],
            tags: courseData.tags || [],
            // UI state
            multilingualMode: isMultilingual
          })
        } else {
          setError('Course not found')
        }
      } catch (err) {
        setError('Failed to load course')
        console.error('Error fetching course:', err)
      } finally {
        setFetchLoading(false)
      }
    }

    fetchCourse()
  }, [courseId])

  const handleInputChange = (field: keyof UnifiedCourseFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const toggleMultilingualMode = () => {
    setFormData(prev => {
      const newMode = !prev.multilingualMode
      
      if (newMode) {
        // Converting to multilingual mode
        return {
          ...prev,
          multilingualMode: true,
          enableTranslation: true,
          title: typeof prev.title === 'string' ? createMultilingualText(prev.title) : prev.title,
          description: typeof prev.description === 'string' ? createMultilingualText(prev.description) : prev.description,
          whatYouWillLearn: Array.isArray(prev.whatYouWillLearn) ? createMultilingualArray(prev.whatYouWillLearn) : prev.whatYouWillLearn,
          prerequisites: Array.isArray(prev.prerequisites) ? createMultilingualArray(prev.prerequisites) : prev.prerequisites,
          tags: Array.isArray(prev.tags) ? createMultilingualArray(prev.tags) : prev.tags,
          supportedLanguages: prev.supportedLanguages.length > 1 ? prev.supportedLanguages : [DEFAULT_LANGUAGE, 'te' as SupportedLanguage]
        }
      } else {
        // Converting to standard mode
        return {
          ...prev,
          multilingualMode: false,
          enableTranslation: false,
          title: typeof prev.title === 'object' ? getCompatibleText(prev.title, prev.primaryLanguage) : prev.title,
          description: typeof prev.description === 'object' ? getCompatibleText(prev.description, prev.primaryLanguage) : prev.description,
          whatYouWillLearn: typeof prev.whatYouWillLearn === 'object' ? getCompatibleArray(prev.whatYouWillLearn, prev.primaryLanguage) : prev.whatYouWillLearn,
          prerequisites: typeof prev.prerequisites === 'object' ? getCompatibleArray(prev.prerequisites, prev.primaryLanguage) : prev.prerequisites,
          tags: typeof prev.tags === 'object' ? getCompatibleArray(prev.tags, prev.primaryLanguage) : prev.tags,
          supportedLanguages: [prev.primaryLanguage]
        }
      }
    })
  }

  const handleLanguageToggle = (language: SupportedLanguage) => {
    setFormData(prev => {
      const currentLanguages = prev.supportedLanguages
      if (currentLanguages.includes(language)) {
        // Don't allow removing the primary language
        if (language === prev.primaryLanguage && currentLanguages.length === 1) {
          return prev
        }
        return {
          ...prev,
          supportedLanguages: currentLanguages.filter(lang => lang !== language)
        }
      } else {
        return {
          ...prev,
          supportedLanguages: [...currentLanguages, language]
        }
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !userProfile || !course) {
      setError('Not authenticated or course not loaded')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Convert multilingual data to compatible format for API
      const updates = {
        title: typeof formData.title === 'object' ? getCompatibleText(formData.title, formData.primaryLanguage) : formData.title,
        description: typeof formData.description === 'object' ? getCompatibleText(formData.description, formData.primaryLanguage) : formData.description,
        categoryId: formData.categoryId,
        difficultyId: formData.difficultyId,
        duration: parseFloat(formData.duration.trim()) || 0, // Convert string to number for API
        status: formData.status,
        instructor: userProfile.firstName + ' ' + userProfile.lastName,
        instructorId: user.uid,
        // Image fields
        image: formData.image,
        imageFileName: formData.imageFileName,
        imageStoragePath: formData.imageStoragePath,
        thumbnailUrl: formData.thumbnailUrl,
        // Enhanced fields - convert to simple arrays for API compatibility
        whatYouWillLearn: typeof formData.whatYouWillLearn === 'object' ? getCompatibleArray(formData.whatYouWillLearn, formData.primaryLanguage) : formData.whatYouWillLearn,
        prerequisites: typeof formData.prerequisites === 'object' ? getCompatibleArray(formData.prerequisites, formData.primaryLanguage) : formData.prerequisites,
        tags: typeof formData.tags === 'object' ? getCompatibleArray(formData.tags, formData.primaryLanguage) : formData.tags
      }

      const success = await updateCourse(course.id!, updates, user.uid)
      
      if (success) {
        toast.success('Course updated successfully!')
        router.push('/my-courses')
      } else {
        setError('Failed to update course')
        toast.error('Failed to update course')
      }
    } catch (err) {
      setError('An error occurred while updating the course')
      console.error('Update course error:', err)
      toast.error('Failed to update course')
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyBadgeColor = (difficultyName: string | undefined | null) => {
    if (!difficultyName) return 'bg-gray-100 text-gray-800'
    
    switch (difficultyName.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      case 'expert': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleImageUploaded = (result: ImageUploadResult) => {
    setFormData(prev => ({
      ...prev,
      image: result.url,
      imageFileName: result.fileName,
      imageStoragePath: result.storagePath,
      thumbnailUrl: result.thumbnailUrl
    }))
  }

  const handleImageRemoved = () => {
    setFormData(prev => ({
      ...prev,
      image: undefined,
      imageFileName: undefined,
      imageStoragePath: undefined,
      thumbnailUrl: undefined
    }))
  }

  if (fetchLoading) {
    return (
      <AuthGuard requiredRole={UserRole.INSTRUCTOR}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading course...</span>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (error && !course) {
    return (
      <AuthGuard requiredRole={UserRole.INSTRUCTOR}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/my-courses')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Courses
            </Button>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredRole={UserRole.INSTRUCTOR}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="outline" 
              onClick={() => router.push('/my-courses')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to My Courses
            </Button>
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Edit Course</h1>
                <p className="text-muted-foreground">Update your course information and content</p>
              </div>
            </div>
          </div>

          {/* 2-Column Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Content - Left Column (2/3 width) */}
            <div className="xl:col-span-2 order-2 xl:order-1">
              <Tabs defaultValue="details" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details" className="flex items-center gap-2 text-xs sm:text-sm">
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Course </span>Details
                  </TabsTrigger>
                  <TabsTrigger value="topics" className="flex items-center gap-2 text-xs sm:text-sm">
                    <Settings className="h-4 w-4" />
                    Topics
                  </TabsTrigger>
                  <TabsTrigger value="questions" className="flex items-center gap-2 text-xs sm:text-sm">
                    <HelpCircle className="h-4 w-4" />
                    Q&A
                  </TabsTrigger>
                </TabsList>

                {/* Course Details Tab */}
                <TabsContent value="details" className="space-y-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Course Information</CardTitle>
                      <CardDescription>
                        Update the details for your course
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                            {error}
                          </div>
                        )}

                        {/* Multilingual Mode Toggle */}
                        <Card className={`border-2 ${formData.multilingualMode ? 'border-primary bg-muted/50' : 'border-muted'}`}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <Languages className="h-5 w-5" />
                                  Course Language Settings
                                </CardTitle>
                                <CardDescription>
                                  Configure language support for this course
                                </CardDescription>
                              </div>
                              <div className="flex items-center gap-3">
                                <Label htmlFor="multilingual-toggle" className="text-sm font-medium">
                                  {formData.multilingualMode ? 'Advanced Multilingual Mode' : 'Standard Course'}
                                </Label>
                                <Switch
                                  id="multilingual-toggle"
                                  checked={formData.multilingualMode}
                                  onCheckedChange={toggleMultilingualMode}
                                />
                              </div>
                            </div>
                          </CardHeader>
                          {formData.multilingualMode && (
                            <CardContent className="pt-0">
                              <div className="bg-muted/50 border border-muted rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                  <Globe className="h-5 w-5 text-primary mt-0.5" />
                                  <div>
                                    <p className="text-sm font-medium text-foreground">Multilingual Mode Enabled</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      This course supports multiple languages. Content can be provided in English and Telugu.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          )}
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Title */}
                          <div className="space-y-2">
                            <Label htmlFor="title" className="flex items-center gap-2">
                              {formData.multilingualMode && <Globe className="h-4 w-4 text-blue-600" />}
                              Course Title *
                            </Label>
                            {formData.multilingualMode ? (
                              <MultilingualInput
                                label="Course Title"
                                value={formData.title as MultilingualText}
                                onChange={(value) => handleInputChange('title', value)}
                                required
                              />
                            ) : (
                              <Input
                                id="title"
                                value={formData.title as string}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                placeholder="Enter course title"
                                required
                              />
                            )}
                          </div>

                          {/* Category */}
                          <div className="space-y-2">
                            <Label htmlFor="category">Category *</Label>
                            <Select 
                              value={formData.categoryId} 
                              onValueChange={(value) => handleInputChange('categoryId', value)}
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

                          {/* Level */}
                          <div className="space-y-2">
                            <Label htmlFor="difficultyId">Difficulty Level *</Label>
                            <Select 
                              value={formData.difficultyId} 
                              onValueChange={(value) => handleInputChange('difficultyId', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select difficulty level" />
                              </SelectTrigger>
                              <SelectContent>
                                {difficulties.map((difficulty) => (
                                  <SelectItem key={difficulty.id} value={difficulty.id}>
                                    <div className="flex items-center gap-2">
                                      <Badge className={getDifficultyBadgeColor(difficulty.name)}>
                                        {difficulty.name}
                                      </Badge>
                                      <span>{difficulty.description}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Duration */}
                          <div className="space-y-2">
                            <Label htmlFor="duration">Duration (hours) *</Label>
                            <Input
                              id="duration"
                              type="number"
                              value={formData.duration}
                              onChange={(e) => handleInputChange('duration', e.target.value)}
                              placeholder="e.g., 40"
                              min="0"
                              step="0.5"
                              required
                            />
                          </div>

                          {/* Course Image */}
                          <CourseImageUpload
                            courseId={courseId}
                            instructorId={user?.uid || ''}
                            currentImage={formData.image}
                            currentImageStoragePath={formData.imageStoragePath}
                            onImageUploaded={handleImageUploaded}
                            onImageRemoved={handleImageRemoved}
                            disabled={loading}
                            className="col-span-2"
                          />

                          {/* Course Association */}
                          <div className="col-span-2">
                            <CourseAssociationManager
                              courseId={courseId}
                              currentAssociation={course?.association}
                              onAssociationUpdate={(association) => handleInputChange('association', association)}
                              disabled={loading}
                            />
                          </div>

                          {/* Status */}
                          <div className="space-y-2">
                            <Label htmlFor="status">Publication Status *</Label>
                            <Select 
                              value={formData.status} 
                              onValueChange={(value: 'draft' | 'published' | 'archived') => handleInputChange('status', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="draft">
                                  <div className="flex items-center gap-2">
                                    <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>
                                    <span>Not visible to students</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="published">
                                  <div className="flex items-center gap-2">
                                    <Badge className="bg-green-100 text-green-800">Published</Badge>
                                    <span>Available for enrollment</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="archived">
                                  <div className="flex items-center gap-2">
                                    <Badge className="bg-gray-100 text-gray-800">Archived</Badge>
                                    <span>No longer available</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                          <Label htmlFor="description" className="flex items-center gap-2">
                            {formData.multilingualMode && <Globe className="h-4 w-4 text-blue-600" />}
                            Course Description *
                          </Label>
                          {formData.multilingualMode ? (
                            <MultilingualTextarea
                              label="Course Description"
                              value={formData.description as MultilingualText}
                              onChange={(value) => handleInputChange('description', value)}
                              placeholder="Provide a detailed description of your course..."
                              rows={6}
                              required
                            />
                          ) : (
                            <Textarea
                              id="description"
                              value={typeof formData.description === 'string' ? formData.description : getCompatibleText(formData.description, formData.primaryLanguage)}
                              onChange={(e) => handleInputChange('description', e.target.value)}
                              placeholder="Provide a detailed description of your course..."
                              rows={6}
                              required
                            />
                          )}
                        </div>

                        {/* Enhanced Fields Section */}
                        <Card className="bg-muted/50 border-muted">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Globe className="h-5 w-5 text-primary" />
                              Course Content Details
                            </CardTitle>
                            <CardDescription>
                              Add detailed information about what students will learn and course requirements
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            {/* What You'll Learn */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium flex items-center gap-2">
                                {formData.multilingualMode && <Globe className="h-4 w-4 text-primary" />}
                                What You'll Learn
                              </label>
                              {formData.multilingualMode ? (
                                <MultilingualArrayInput
                                  label="What You'll Learn"
                                  value={formData.whatYouWillLearn as MultilingualArray}
                                  onChange={(value) => handleInputChange('whatYouWillLearn', value)}
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
                                          handleInputChange('whatYouWillLearn', newItems)
                                        }}
                                        placeholder="What will students learn?"
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          const newItems = (formData.whatYouWillLearn as string[]).filter((_, i) => i !== index)
                                          handleInputChange('whatYouWillLearn', newItems)
                                        }}
                                      >
                                        Remove
                                      </Button>
                                    </div>
                                  ))}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      const newItems = [...(formData.whatYouWillLearn as string[]), '']
                                      handleInputChange('whatYouWillLearn', newItems)
                                    }}
                                  >
                                    Add Learning Outcome
                                  </Button>
                                </div>
                              )}
                            </div>

                            {/* Prerequisites */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium flex items-center gap-2">
                                {formData.multilingualMode && <Globe className="h-4 w-4 text-primary" />}
                                Prerequisites
                              </label>
                              {formData.multilingualMode ? (
                                <MultilingualArrayInput
                                  label="Prerequisites"
                                  value={formData.prerequisites as MultilingualArray}
                                  onChange={(value) => handleInputChange('prerequisites', value)}
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
                                          handleInputChange('prerequisites', newItems)
                                        }}
                                        placeholder="What should students know beforehand?"
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          const newItems = (formData.prerequisites as string[]).filter((_, i) => i !== index)
                                          handleInputChange('prerequisites', newItems)
                                        }}
                                      >
                                        Remove
                                      </Button>
                                    </div>
                                  ))}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      const newItems = [...(formData.prerequisites as string[]), '']
                                      handleInputChange('prerequisites', newItems)
                                    }}
                                  >
                                    Add Prerequisite
                                  </Button>
                                </div>
                              )}
                            </div>

                            {/* Tags */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium flex items-center gap-2">
                                {formData.multilingualMode && <Globe className="h-4 w-4 text-primary" />}
                                Course Tags
                              </label>
                              {formData.multilingualMode ? (
                                <MultilingualArrayInput
                                  label="Course Tags"
                                  value={formData.tags as MultilingualArray}
                                  onChange={(value) => handleInputChange('tags', value)}
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
                                          handleInputChange('tags', newItems)
                                        }}
                                        placeholder="Add a tag (e.g., JavaScript, Web Development)"
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          const newItems = (formData.tags as string[]).filter((_, i) => i !== index)
                                          handleInputChange('tags', newItems)
                                        }}
                                      >
                                        Remove
                                      </Button>
                                    </div>
                                  ))}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      const newItems = [...(formData.tags as string[]), '']
                                      handleInputChange('tags', newItems)
                                    }}
                                  >
                                    Add Tag
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Submit Buttons */}
                        <div className="flex gap-4 pt-6 border-t">
                          <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1"
                          >
                            {loading ? 'Updating...' : 'Update Course'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push('/my-courses')}
                            disabled={loading}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Course Topics Tab */}
                <TabsContent value="topics" className="space-y-0">
                  {courseId && (
                    <CourseTopicsManager 
                      courseId={courseId} 
                      isEditable={true} 
                      multilingualMode={formData.multilingualMode}
                    />
                  )}
                </TabsContent>

                {/* Questions & Answers Tab */}
                <TabsContent value="questions" className="space-y-0">
                  {courseId && course && (
                    <CourseQuestionsManager 
                      courseId={courseId} 
                      courseName={typeof course.title === 'string' ? course.title : getCompatibleText(course.title, formData.primaryLanguage)} 
                      isEditable={true}
                      multilingualMode={formData.multilingualMode}
                    />
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - Right Column (1/3 width) */}
            <div className="space-y-6 order-1 xl:order-2">
              {/* Course Status */}
              {course && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Course Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getDifficultyBadgeColor(
                            difficulties.find(d => d.id === course.difficultyId)?.name
                          )}>
                            {difficulties.find(d => d.id === course.difficultyId)?.name || 'Unknown'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Difficulty Level</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusBadgeColor(course.status)}>
                            {course.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Publication Status</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{course.enrollmentCount || 0}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Students Enrolled</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{course.duration}h</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Duration</p>
                      </div>
                    </div>

                    {course.rating && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{course.rating.toFixed(1)}</span>
                          <span className="text-sm text-muted-foreground">Rating</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Course Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Topics</span>
                      <span className="font-medium">-</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Questions</span>
                      <span className="font-medium">-</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Last Updated</span>
                      <span className="font-medium text-sm">
                        {course?.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => courseId && router.push(`/courses/${courseId}/preview`)}
                    disabled={!courseId}
                  >
                    Preview Course
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/my-courses')}
                  >
                    View All Courses
                  </Button>
                  {course?.status === 'published' && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        const url = `${window.location.origin}/courses/${courseId}`
                        navigator.clipboard.writeText(url)
                        toast.success('Course URL copied to clipboard!')
                      }}
                    >
                      Copy Course Link
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}