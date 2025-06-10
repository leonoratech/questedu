'use client'

import { AuthGuard } from '@/components/AuthGuard'
import { MultilingualArrayInput, MultilingualInput, MultilingualTextarea } from '@/components/MultilingualInput'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { addMultilingualCourse, CreateCourseData } from '@/data/services/admin-course-service'
import {
    DEFAULT_LANGUAGE,
    LANGUAGE_NAMES,
    MultilingualArray,
    MultilingualText,
    RequiredMultilingualText,
    SUPPORTED_LANGUAGES,
    SupportedLanguage
} from '@/lib/multilingual-types'
import {
    createMultilingualArray,
    createMultilingualText,
    getCompatibleText
} from '@/lib/multilingual-utils'
import { ArrowLeft, Globe, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface MultilingualCourseFormData {
  title: RequiredMultilingualText
  description: MultilingualText
  instructor: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  price: number
  duration: string
  instructorId: string
  whatYouWillLearn: MultilingualArray
  prerequisites: MultilingualArray
  tags: MultilingualArray
  // Language settings
  primaryLanguage: SupportedLanguage
  supportedLanguages: SupportedLanguage[]
  enableTranslation: boolean
}

export default function CreateMultilingualCoursePage() {
  const { userProfile } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<MultilingualCourseFormData>({
    title: createMultilingualText(''),
    description: createMultilingualText(''),
    instructor: userProfile ? `${userProfile.firstName} ${userProfile.lastName}`.trim() : '',
    category: '',
    level: 'beginner',
    price: 0,
    duration: '',
    instructorId: userProfile?.uid || '',
    whatYouWillLearn: createMultilingualArray([]),
    prerequisites: createMultilingualArray([]),
    tags: createMultilingualArray([]),
    // Language settings
    primaryLanguage: DEFAULT_LANGUAGE,
    supportedLanguages: [DEFAULT_LANGUAGE],
    enableTranslation: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userProfile) {
      toast.error('You must be logged in to create a course')
      return
    }

    setLoading(true)
    try {
      // Create course with enhanced multilingual support and language configuration
      const courseData: CreateCourseData = {
        title: getCompatibleText(formData.title, formData.primaryLanguage),
        description: getCompatibleText(formData.description, formData.primaryLanguage),
        instructor: formData.instructor,
        category: formData.category,
        level: formData.level,
        price: formData.price,
        duration: parseFloat(formData.duration) || 0,
        instructorId: formData.instructorId || userProfile.uid,
        status: 'draft',
        
        // Language Configuration
        primaryLanguage: formData.primaryLanguage,
        supportedLanguages: formData.supportedLanguages,
        enableTranslation: formData.enableTranslation,
        
        // Multilingual Content (if available)
        multilingualTitle: typeof formData.title === 'object' ? formData.title : undefined,
        multilingualDescription: typeof formData.description === 'object' ? formData.description : undefined,
        multilingualWhatYouWillLearn: typeof formData.whatYouWillLearn === 'object' ? formData.whatYouWillLearn : undefined,
        multilingualPrerequisites: typeof formData.prerequisites === 'object' ? formData.prerequisites : undefined,
        multilingualTargetAudience: typeof formData.tags === 'object' ? formData.tags : undefined,
      }

      const courseId = await addMultilingualCourse(courseData)
      if (courseId) {
        toast.success('Multilingual course created successfully!')
        router.push(`/courses/${courseId}/multilingual`)
      } else {
        toast.error('Failed to create course')
      }
    } catch (error) {
      console.error('Error creating course:', error)
      toast.error('Failed to create course. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAsDraft = async () => {
    // Same as handleSubmit but explicitly mark as draft
    await handleSubmit(new Event('submit') as any)
  }

  const isFormValid = () => {
    return getCompatibleText(formData.title, DEFAULT_LANGUAGE).trim() &&
           getCompatibleText(formData.description, DEFAULT_LANGUAGE).trim() &&
           formData.instructor.trim() &&
           formData.category.trim() &&
           formData.duration.trim() &&
           formData.primaryLanguage &&
           formData.supportedLanguages.length > 0
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4 max-w-4xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/courses')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Courses
                </Button>
                <div className="h-6 w-px bg-gray-300" />
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <h1 className="text-xl font-semibold text-gray-900">
                    Create Multilingual Course
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    Course Information
                  </CardTitle>
                  <CardDescription>
                    Create a course that supports multiple languages (English and Telugu)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                      
                      <div className="space-y-2">
                        <MultilingualInput
                          label="Course Title"
                          value={formData.title}
                          onChange={(value) => setFormData(prev => ({ ...prev, title: value }))}
                          placeholder="Enter course title"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <MultilingualTextarea
                          label="Course Description"
                          value={formData.description}
                          onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                          placeholder="Describe what students will learn in this course"
                          rows={4}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="instructor">Instructor Name *</Label>
                          <Input
                            id="instructor"
                            value={formData.instructor}
                            onChange={(e) => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
                            placeholder="Instructor name"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="category">Category *</Label>
                          <Input
                            id="category"
                            value={formData.category}
                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                            placeholder="e.g., Programming, Design, Business"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="level">Level *</Label>
                          <Select 
                            value={formData.level} 
                            onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => 
                              setFormData(prev => ({ ...prev, level: value }))
                            }
                          >
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

                        <div className="space-y-2">
                          <Label htmlFor="duration">Duration (hours) *</Label>
                          <Input
                            id="duration"
                            type="number"
                            value={formData.duration}
                            onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                            placeholder="e.g., 10"
                            min="0"
                            step="0.5"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="price">Price (USD) *</Label>
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
                      </div>
                    </div>

                    {/* Language Settings */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                        <Globe className="h-5 w-5 text-blue-600" />
                        Language Settings
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="primaryLanguage">Primary Language *</Label>
                          <Select 
                            value={formData.primaryLanguage} 
                            onValueChange={(value: SupportedLanguage) => 
                              setFormData(prev => ({ 
                                ...prev, 
                                primaryLanguage: value,
                                supportedLanguages: prev.supportedLanguages.includes(value) 
                                  ? prev.supportedLanguages 
                                  : [value, ...prev.supportedLanguages]
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select primary language" />
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
                          <div className="space-y-2">
                            {SUPPORTED_LANGUAGES.map((lang) => (
                              <div key={lang} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`lang-${lang}`}
                                  checked={formData.supportedLanguages.includes(lang)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormData(prev => ({
                                        ...prev,
                                        supportedLanguages: [...prev.supportedLanguages, lang]
                                      }))
                                    } else if (lang !== formData.primaryLanguage) {
                                      // Don't allow unchecking primary language
                                      setFormData(prev => ({
                                        ...prev,
                                        supportedLanguages: prev.supportedLanguages.filter(l => l !== lang)
                                      }))
                                    }
                                  }}
                                  disabled={lang === formData.primaryLanguage}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <Label htmlFor={`lang-${lang}`} className="text-sm">
                                  {LANGUAGE_NAMES[lang]}
                                  {lang === formData.primaryLanguage && (
                                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                      Primary
                                    </span>
                                  )}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="enableTranslation"
                          checked={formData.enableTranslation}
                          onChange={(e) => setFormData(prev => ({ ...prev, enableTranslation: e.target.checked }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <Label htmlFor="enableTranslation" className="text-sm">
                          Enable automatic translation suggestions for missing content
                        </Label>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex">
                          <Globe className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-blue-900">
                              Multilingual Course Benefits
                            </h4>
                            <div className="mt-2 text-sm text-blue-700">
                              <ul className="list-disc list-inside space-y-1">
                                <li>Reach students who speak different languages</li>
                                <li>Increase course accessibility and enrollment</li>
                                <li>Build content once, translate incrementally</li>
                                <li>Students can switch between languages seamlessly</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Course Content */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Course Content</h3>
                      
                      <div className="space-y-2">
                        <MultilingualArrayInput
                          label="What Students Will Learn"
                          value={formData.whatYouWillLearn}
                          onChange={(value) => setFormData(prev => ({ ...prev, whatYouWillLearn: value }))}
                          placeholder="Add a learning outcome"
                        />
                      </div>

                      <div className="space-y-2">
                        <MultilingualArrayInput
                          label="Prerequisites"
                          value={formData.prerequisites}
                          onChange={(value) => setFormData(prev => ({ ...prev, prerequisites: value }))}
                          placeholder="Add a prerequisite"
                        />
                      </div>

                      <div className="space-y-2">
                        <MultilingualArrayInput
                          label="Tags"
                          value={formData.tags}
                          onChange={(value) => setFormData(prev => ({ ...prev, tags: value }))}
                          placeholder="Add a tag"
                        />
                      </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-6 border-t">
                      <Button
                        type="submit"
                        disabled={!isFormValid() || loading}
                        className="flex-1"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Creating Course...' : 'Create Course'}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSaveAsDraft}
                        disabled={!isFormValid() || loading}
                      >
                        Save as Draft
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Course Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm">
                      {getCompatibleText(formData.title, DEFAULT_LANGUAGE) || 'Course Title'}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      by {formData.instructor || 'Instructor'}
                    </p>
                  </div>
                  
                  {getCompatibleText(formData.description, DEFAULT_LANGUAGE) && (
                    <p className="text-xs text-gray-600 line-clamp-3">
                      {getCompatibleText(formData.description, DEFAULT_LANGUAGE)}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {formData.category && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {formData.category}
                      </span>
                    )}
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                      {formData.level}
                    </span>
                    {formData.duration && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        {formData.duration}h
                      </span>
                    )}
                  </div>
                  
                  <div className="text-lg font-bold text-green-600">
                    ${formData.price.toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              {/* Language Support Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    Language Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-2">Primary Language:</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {formData.primaryLanguage === SupportedLanguage.ENGLISH ? '🇺🇸' : '🇮🇳'}
                      </span>
                      <span className="text-sm font-medium">
                        {LANGUAGE_NAMES[formData.primaryLanguage]}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Primary
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-600 mb-2">Supported Languages:</p>
                    <div className="space-y-1">
                      {formData.supportedLanguages.map((lang) => (
                        <div key={lang} className="flex items-center gap-2">
                          <span className="text-sm">
                            {lang === SupportedLanguage.ENGLISH ? '🇺🇸' : '🇮🇳'}
                          </span>
                          <span className="text-sm">
                            {LANGUAGE_NAMES[lang]}
                          </span>
                          {lang === formData.primaryLanguage && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded">
                              Primary
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${formData.enableTranslation ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                      <span className="text-xs text-gray-600">
                        Auto-translation: {formData.enableTranslation ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 mt-3">
                    Students will be able to view course content in {formData.supportedLanguages.length > 1 ? 'their preferred language' : 'the primary language'}. 
                    {formData.supportedLanguages.length > 1 && ' Content can be added for each language separately.'}
                  </p>
                </CardContent>
              </Card>

              {/* Help */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Creating your first multilingual course? Check out our guide for best practices.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    View Guide
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
