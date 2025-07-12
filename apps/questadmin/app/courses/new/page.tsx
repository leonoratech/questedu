'use client'

import { AuthGuard } from '@/components/AuthGuard'
import { MultilingualArrayInput, MultilingualInput, MultilingualTextarea } from '@/components/MultilingualInput'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import { CourseCategory } from '@/data/models/course-category'
import { CourseDifficulty } from '@/data/models/course-difficulty'
import { addCourse, addMultilingualCourse } from '@/data/services/admin-course-service'
import { getMasterData } from '@/data/services/course-master-data-service'
import { DEFAULT_LANGUAGE, LANGUAGE_NAMES, MultilingualArray, MultilingualText, SUPPORTED_LANGUAGES, SupportedLanguage } from '@/lib/multilingual-types'
import { createMultilingualArray, createMultilingualText, getCompatibleText } from '@/lib/multilingual-utils'
import { ArrowLeft, BookOpen, Globe, Languages, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface UnifiedCourseFormData {
  title: string | MultilingualText
  description: string | MultilingualText
  categoryId: string
  difficultyId: string
  duration: string
  status: 'draft' | 'published'
  // Language configuration
  primaryLanguage: SupportedLanguage
  supportedLanguages: SupportedLanguage[]
  enableTranslation: boolean
  // Advanced multilingual fields (optional)
  whatYouWillLearn: string[] | MultilingualArray
  prerequisites: string[] | MultilingualArray
  tags: string[] | MultilingualArray
  targetAudience: string[] | MultilingualArray
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

export default function UnifiedCreateCoursePage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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
    // Advanced fields defaults
    whatYouWillLearn: [],
    prerequisites: [],
    tags: [],
    targetAudience: [],
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

  const handleInputChange = (field: keyof UnifiedCourseFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
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

  const handlePrimaryLanguageChange = (language: SupportedLanguage) => {
    setFormData(prev => ({
      ...prev,
      primaryLanguage: language,
      supportedLanguages: prev.supportedLanguages.includes(language) 
        ? prev.supportedLanguages 
        : [...prev.supportedLanguages, language]
    }))
  }

  const toggleMultilingualMode = () => {
    setFormData(prev => {
      const newMode = !prev.multilingualMode
      
      if (newMode) {
        // Convert simple strings to multilingual objects
        return {
          ...prev,
          multilingualMode: newMode,
          title: typeof prev.title === 'string' ? createMultilingualText(prev.title) : prev.title,
          description: typeof prev.description === 'string' ? createMultilingualText(prev.description) : prev.description,
          whatYouWillLearn: Array.isArray(prev.whatYouWillLearn) && prev.whatYouWillLearn.length > 0 && typeof prev.whatYouWillLearn[0] === 'string' 
            ? createMultilingualArray(prev.whatYouWillLearn as string[]) 
            : prev.whatYouWillLearn,
          prerequisites: Array.isArray(prev.prerequisites) && prev.prerequisites.length > 0 && typeof prev.prerequisites[0] === 'string'
            ? createMultilingualArray(prev.prerequisites as string[])
            : prev.prerequisites,
          tags: Array.isArray(prev.tags) && prev.tags.length > 0 && typeof prev.tags[0] === 'string'
            ? createMultilingualArray(prev.tags as string[])
            : prev.tags,
          targetAudience: Array.isArray(prev.targetAudience) && prev.targetAudience.length > 0 && typeof prev.targetAudience[0] === 'string'
            ? createMultilingualArray(prev.targetAudience as string[])
            : prev.targetAudience,
          enableTranslation: true
        }
      } else {
        // Convert multilingual objects back to simple strings
        return {
          ...prev,
          multilingualMode: newMode,
          title: typeof prev.title === 'object' ? getCompatibleText(prev.title, prev.primaryLanguage) : prev.title,
          description: typeof prev.description === 'object' ? getCompatibleText(prev.description, prev.primaryLanguage) : prev.description,
          enableTranslation: false
        }
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!user || !userProfile) {
        throw new Error('User not authenticated')
      }

      // Validate required fields
      const titleValue = typeof formData.title === 'string' 
        ? formData.title.trim() 
        : getCompatibleText(formData.title, formData.primaryLanguage)
      
      const descriptionValue = typeof formData.description === 'string'
        ? formData.description.trim()
        : getCompatibleText(formData.description, formData.primaryLanguage)

      if (!titleValue) {
        throw new Error('Course title is required')
      }
      if (!descriptionValue) {
        throw new Error('Course description is required')
      }
      if (!formData.categoryId) {
        throw new Error('Course category is required')
      }
      if (!formData.difficultyId) {
        throw new Error('Course difficulty is required')
      }
      if (!formData.duration.trim()) {
        throw new Error('Course duration is required')
      }

      const durationValue = parseFloat(formData.duration.trim())
      if (isNaN(durationValue) || durationValue <= 0) {
        throw new Error('Duration must be a valid number greater than 0')
      }

      const instructorName = userProfile.firstName && userProfile.lastName 
        ? `${userProfile.firstName} ${userProfile.lastName}`.trim()
        : userProfile.email || 'Unknown Instructor'

      const courseData = {
        title: titleValue,
        description: descriptionValue,
        instructor: instructorName,
        instructorId: user.uid,
        categoryId: formData.categoryId,
        difficultyId: formData.difficultyId,
        duration: durationValue,
        status: formData.status,
        // Language configuration
        primaryLanguage: formData.primaryLanguage,
        supportedLanguages: formData.supportedLanguages,
        enableTranslation: formData.enableTranslation,
        // Include multilingual content if in multilingual mode
        ...(formData.multilingualMode && {
          multilingualTitle: typeof formData.title === 'object' ? formData.title : undefined,
          multilingualDescription: typeof formData.description === 'object' ? formData.description : undefined,
          multilingualWhatYouWillLearn: typeof formData.whatYouWillLearn === 'object' && !Array.isArray(formData.whatYouWillLearn) ? formData.whatYouWillLearn : undefined,
          multilingualPrerequisites: typeof formData.prerequisites === 'object' && !Array.isArray(formData.prerequisites) ? formData.prerequisites : undefined,
          multilingualTags: typeof formData.tags === 'object' && !Array.isArray(formData.tags) ? formData.tags : undefined,
          multilingualTargetAudience: typeof formData.targetAudience === 'object' && !Array.isArray(formData.targetAudience) ? formData.targetAudience : undefined,
        })
      }

      const courseId = formData.multilingualMode 
        ? await addMultilingualCourse(courseData)
        : await addCourse(courseData)
      
      if (courseId) {
        toast.success('Course created successfully!')
        router.push(`/courses/${courseId}`)
      } else {
        throw new Error('Failed to create course')
      }
    } catch (error) {
      console.error('Error creating course:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create course'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDraft = async () => {
    setFormData(prev => ({ ...prev, status: 'draft' }))
    const form = document.getElementById('course-form') as HTMLFormElement
    form?.requestSubmit()
  }

  const handlePublish = async () => {
    setFormData(prev => ({ ...prev, status: 'published' }))
    const form = document.getElementById('course-form') as HTMLFormElement
    form?.requestSubmit()
  }

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <BookOpen className="h-8 w-8 text-primary" />
                Create New Course
              </h1>
              <p className="text-muted-foreground">
                Create a course with optional multilingual support
              </p>
            </div>
          </div>

          {/* Multilingual Mode Toggle */}
          <div className="flex items-center gap-3">
            <Label htmlFor="multilingual-mode" className="text-sm font-medium">
              Advanced Multilingual Mode
            </Label>
            <Switch
              id="multilingual-mode"
              checked={formData.multilingualMode}
              onCheckedChange={toggleMultilingualMode}
            />
            <Languages className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        {/* Mode Info Banner */}
        {formData.multilingualMode && (
          <div className="mb-6 p-4 bg-muted/50 border border-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-foreground">Advanced Multilingual Mode Enabled</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              You can now create content in multiple languages. Fields marked with the globe icon support multilingual content.
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Course Form */}
        <form id="course-form" onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Provide the essential details about your course
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="flex items-center gap-2">
                      Course Title *
                      {formData.multilingualMode && <Globe className="h-4 w-4 text-blue-500" />}
                    </Label>
                    {formData.multilingualMode ? (
                      <MultilingualInput
                        label="Course Title"
                        value={formData.title as MultilingualText}
                        onChange={(value) => handleInputChange('title', value)}
                        placeholder="Enter course title"
                        required
                      />
                    ) : (
                      <Input
                        id="title"
                        type="text"
                        value={formData.title as string}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Enter course title"
                        required
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="flex items-center gap-2">
                      Description *
                      {formData.multilingualMode && <Globe className="h-4 w-4 text-blue-500" />}
                    </Label>
                    {formData.multilingualMode ? (
                      <MultilingualTextarea
                        label="Description"
                        value={formData.description as MultilingualText}
                        onChange={(value) => handleInputChange('description', value)}
                        placeholder="Describe what students will learn in this course"
                        rows={4}
                        required
                      />
                    ) : (
                      <Textarea
                        id="description"
                        value={formData.description as string}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Describe what students will learn in this course"
                        rows={4}
                        required
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.categoryId}
                        onValueChange={(value: string) => handleInputChange('categoryId', value)}
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
                      <Label htmlFor="difficulty">Difficulty Level *</Label>
                      <Select
                        value={formData.difficultyId}
                        onValueChange={(value: string) => handleInputChange('difficultyId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty level" />
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (hours) *</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={formData.duration}
                        onChange={(e) => handleInputChange('duration', e.target.value)}
                        placeholder="e.g., 20"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Language Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Language Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure language settings for your course
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryLanguage">Primary Language</Label>
                    <Select
                      value={formData.primaryLanguage}
                      onValueChange={(value: SupportedLanguage) => handlePrimaryLanguageChange(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_LANGUAGES.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {LANGUAGE_NAMES[lang]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Supported Languages</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <div key={lang} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`lang-${lang}`}
                            checked={formData.supportedLanguages.includes(lang)}
                            onChange={() => handleLanguageToggle(lang)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <Label 
                            htmlFor={`lang-${lang}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {LANGUAGE_NAMES[lang]}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="enableTranslation"
                      checked={formData.enableTranslation}
                      onChange={(e) => handleInputChange('enableTranslation', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label 
                      htmlFor="enableTranslation"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Enable automatic translation features
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Fields (only in multilingual mode) */}
              {formData.multilingualMode && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Additional Course Details
                    </CardTitle>
                    <CardDescription>
                      Add detailed information about your course in multiple languages
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        What You'll Learn
                        <Globe className="h-4 w-4 text-blue-500" />
                      </Label>
                      <MultilingualArrayInput
                        label="What You'll Learn"
                        value={formData.whatYouWillLearn as MultilingualArray}
                        onChange={(value) => handleInputChange('whatYouWillLearn', value)}
                        placeholder="Add learning outcome"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        Prerequisites
                        <Globe className="h-4 w-4 text-blue-500" />
                      </Label>
                      <MultilingualArrayInput
                        label="Prerequisites"
                        value={formData.prerequisites as MultilingualArray}
                        onChange={(value) => handleInputChange('prerequisites', value)}
                        placeholder="Add prerequisite"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        Course Tags
                        <Globe className="h-4 w-4 text-blue-500" />
                      </Label>
                      <MultilingualArrayInput
                        label="Course Tags"
                        value={formData.tags as MultilingualArray}
                        onChange={(value) => handleInputChange('tags', value)}
                        placeholder="Add tag"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        Target Audience
                        <Globe className="h-4 w-4 text-blue-500" />
                      </Label>
                      <MultilingualArrayInput
                        label="Target Audience"
                        value={formData.targetAudience as MultilingualArray}
                        onChange={(value) => handleInputChange('targetAudience', value)}
                        placeholder="Add target audience"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Course Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Publication Status</CardTitle>
                  <CardDescription>
                    Choose how to save your course
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={formData.status === 'published' ? 'default' : 'secondary'}>
                      {formData.status === 'published' ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSaveDraft}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'Saving...' : 'Save as Draft'}
                    </Button>
                    
                    <Button
                      type="button"
                      onClick={handlePublish}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'Publishing...' : 'Publish Course'}
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Drafts are only visible to you. Published courses are visible to all users.
                  </p>
                </CardContent>
              </Card>

              {/* Mode Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Mode</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {formData.multilingualMode ? (
                        <>
                          <Languages className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-700">Advanced Multilingual</span>
                        </>
                      ) : (
                        <>
                          <BookOpen className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700">Standard Course</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formData.multilingualMode 
                        ? 'Creating course with multilingual content support' 
                        : 'Creating standard course with basic language settings'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Course Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm">
                      {typeof formData.title === 'string' 
                        ? formData.title || 'Course Title'
                        : getCompatibleText(formData.title, formData.primaryLanguage) || 'Course Title'
                      }
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      by {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'Instructor'}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {formData.categoryId && (
                      <Badge variant="outline" className="text-xs">
                        {categories.find(c => c.id === formData.categoryId)?.name || 'Category'}
                      </Badge>
                    )}
                    {formData.difficultyId && (
                      <Badge variant="outline" className="text-xs">
                        {difficulties.find(d => d.id === formData.difficultyId)?.name || 'Difficulty'}
                      </Badge>
                    )}
                    {formData.primaryLanguage && (
                      <Badge variant="outline" className="text-xs">
                        {LANGUAGE_NAMES[formData.primaryLanguage]}
                      </Badge>
                    )}
                  </div>
                  
                  {formData.duration && (
                    <p className="text-xs text-muted-foreground">
                      Duration: {formData.duration} hours
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </AuthGuard>
  )
}