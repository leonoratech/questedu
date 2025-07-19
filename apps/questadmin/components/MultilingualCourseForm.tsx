/**
 * Enhanced Course Creation Form with Multilingual Support
 * 
 * This component demonstrates how to create and edit courses with multilingual content
 */

'use client';

import { LanguageCompletionIndicator } from '@/components/LanguageSelector';
import { MultilingualArrayInput, MultilingualInput, MultilingualTextarea } from '@/components/MultilingualInput';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addCourse } from '@/data/services/admin-course-service';
import {
  DEFAULT_LANGUAGE,
  SupportedLanguage
} from '@/lib/multilingual-types';
import {
  createMultilingualArray,
  createMultilingualText,
  getLocalizedText,
  getMultilingualContentStatus,
  hasLanguageArrayContent,
  hasLanguageContent
} from '@/lib/multilingual-utils';
import { AlertCircle, ArrowLeft, Eye, Globe, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

// ================================
// TYPES
// ================================

interface MultilingualCourseFormData {
  title: import('@/lib/multilingual-types').MultilingualText
  description: import('@/lib/multilingual-types').MultilingualText
  difficultyId: string
  duration: string
  status: 'draft' | 'published'
  image?: string
  imageFileName?: string
  imageStoragePath?: string
  thumbnailUrl?: string
  associations: any[]
  primaryLanguage: import('@/lib/multilingual-types').SupportedLanguage
  supportedLanguages: import('@/lib/multilingual-types').SupportedLanguage[]
  enableTranslation: boolean
  whatYouWillLearn: import('@/lib/multilingual-types').MultilingualArray
  prerequisites: import('@/lib/multilingual-types').MultilingualArray
  tags: import('@/lib/multilingual-types').MultilingualArray
  targetAudience: import('@/lib/multilingual-types').MultilingualArray
  skills: import('@/lib/multilingual-types').MultilingualArray
  multilingualMode: boolean
  instructor?: string
  instructorId?: string
}

// Define local types for category and difficulty
interface CourseCategory {
  id: string
  name: string
}
interface CourseDifficulty {
  id: string
  name: string
}

// ================================
// COMPONENT
// ================================

export default function MultilingualCourseForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Master data
  const [categories, setCategories] = useState<CourseCategory[]>(localCategories);
  const [difficulties, setDifficulties] = useState<CourseDifficulty[]>(localDifficulties);
  const [loadingMasterData, setLoadingMasterData] = useState(true);
  
  // Form data with multilingual support
  const [formData, setFormData] = useState<MultilingualCourseFormData>({
    title: createMultilingualText('', DEFAULT_LANGUAGE),
    description: createMultilingualText('', DEFAULT_LANGUAGE),
    instructor: '',
    instructorId: '',
    difficultyId: '',
    duration: '',
    status: 'draft',
    whatYouWillLearn: createMultilingualArray([], DEFAULT_LANGUAGE),
    prerequisites: createMultilingualArray([], DEFAULT_LANGUAGE),
    targetAudience: createMultilingualArray([], DEFAULT_LANGUAGE),
    tags: createMultilingualArray([], DEFAULT_LANGUAGE),
    skills: createMultilingualArray([], DEFAULT_LANGUAGE),
    associations: [],
    primaryLanguage: DEFAULT_LANGUAGE,
    supportedLanguages: [DEFAULT_LANGUAGE],
    enableTranslation: false,
    multilingualMode: false,
    image: '',
    imageFileName: '',
    imageStoragePath: '',
    thumbnailUrl: ''
  });

  // Load master data on component mount
  React.useEffect(() => {
    const loadMasterData = async () => {
      try {
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Error loading master data:', error);
      } finally {
        setLoadingMasterData(false);
      }
    };

    loadMasterData();
  }, []);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!hasLanguageContent(formData.title, DEFAULT_LANGUAGE)) {
      newErrors.title = 'Course title is required';
    }
    if (!hasLanguageContent(formData.description, DEFAULT_LANGUAGE)) {
      newErrors.description = 'Course description is required';
    }
    if (!(formData.instructor?.trim() || '')) {
      newErrors.instructor = 'Instructor name is required';
    }
    if (!formData.difficultyId) {
      newErrors.difficultyId = 'Course difficulty is required';
    }
    if (!formData.duration || parseFloat(formData.duration) <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Get content status for progress indicator
  const getContentStatus = () => {
    const status: Record<SupportedLanguage, boolean> = {
      [SupportedLanguage.ENGLISH]: true,
      [SupportedLanguage.TELUGU]: true
    };

    // Check if content exists for each language
    [SupportedLanguage.ENGLISH, SupportedLanguage.TELUGU].forEach(lang => {
      const hasTitle = hasLanguageContent(formData.title, lang);
      const hasDescription = hasLanguageContent(formData.description, lang);
      const hasLearningOutcomes = hasLanguageArrayContent(formData.whatYouWillLearn, lang);
      
      // Require at least title and description
      status[lang] = hasTitle && hasDescription;
    });

    return status;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // For demo purposes, we'll create a legacy course for now
      // In a real implementation, you'd modify the API to accept multilingual data
      const legacyFormData = {
        title: getLocalizedText(formData.title, DEFAULT_LANGUAGE) || '',
        description: getLocalizedText(formData.description, DEFAULT_LANGUAGE) || '',
        instructor: formData.instructor || '',
        difficultyId: formData.difficultyId,
        duration: parseFloat(formData.duration),
        instructorId: formData.instructorId || 'default-instructor-id',
        status: formData.status
      };

      const courseId = await addCourse(legacyFormData);
      
      if (!courseId) {
        throw new Error('Failed to create course');
      }
      
      // TODO: In a real implementation, save multilingual data separately
      console.log('Multilingual course data would be saved:', formData);
      
      router.push(`/courses/${courseId}/preview`);
    } catch (error) {
      console.error('Error creating course:', error);
      setErrors({ submit: 'Failed to create course. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle preview
  const handlePreview = () => {
    // Open preview in new window with current form data
    // This would typically create a temporary preview
    console.log('Preview course with data:', formData);
  };

  const contentStatus = getContentStatus();
  const multilingualStatus = getMultilingualContentStatus(
    formData, 
    ['title', 'description', 'whatYouWillLearn']
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create New Course</h1>
          <p className="text-muted-foreground mt-2">
            Create a new course with multilingual content support
          </p>
        </div>
        <div className="flex items-center gap-4">
          <LanguageCompletionIndicator 
            contentStatus={contentStatus}
            className="hidden md:flex"
          />
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      {/* Content Status Alert */}
      {!multilingualStatus.isFullyTranslated && (
        <Card className="mb-6 border-yellow-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-700">
              <Globe className="h-4 w-4" />
              <span className="font-medium">Multilingual Content</span>
            </div>
            <p className="text-sm text-yellow-600 mt-1">
              Content is available in {multilingualStatus.languages.filter(l => l.isComplete).length} of {multilingualStatus.languages.length} languages. 
              Consider adding translations to reach a wider audience.
            </p>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Course Information
            </CardTitle>
            <CardDescription>
              Basic information about your course. Content can be provided in multiple languages.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Course Title - Multilingual */}
            <MultilingualInput
              label="Course Title"
              value={formData.title}
              onChange={(value) => setFormData({ ...formData, title: value })}
              placeholder="Enter course title"
              required
              description="The main title of your course that will be displayed to students"
            />
            {errors.title && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.title}</span>
              </div>
            )}

            {/* Course Description - Multilingual */}
            <MultilingualTextarea
              label="Course Description"
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              placeholder="Provide a detailed description of your course"
              rows={6}
              required
              description="Detailed description explaining what the course covers and what students will learn"
            />
            {errors.description && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.description}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Instructor Name */}
              <div className="space-y-2">
                <Label htmlFor="instructor">Instructor Name *</Label>
                <Input
                  id="instructor"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  placeholder="Enter instructor name"
                  required
                />
                {errors.instructor && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.instructor}</span>
                  </div>
                )}
              </div>

              {/* Difficulty */}
              <div className="space-y-2">
                <Label htmlFor="difficultyId">Difficulty Level *</Label>
                <Select
                  value={formData.difficultyId}
                  onValueChange={(value: string) => setFormData({ ...formData, difficultyId: value })}
                  disabled={loadingMasterData}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty level" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map((difficulty) => (
                      <SelectItem key={difficulty.id} value={difficulty.id}>
                        <div className="flex items-center gap-2">
                          <Badge className={
                            difficulty.name.toLowerCase() === 'beginner' ? 'bg-green-100 text-green-800' :
                            difficulty.name.toLowerCase() === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {difficulty.name}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.difficultyId && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.difficultyId}</span>
                  </div>
                )}
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (hours) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="0"
                  required
                />
                {errors.duration && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.duration}</span>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'draft' | 'published') => 
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Content */}
        <Card>
          <CardHeader>
            <CardTitle>Course Content</CardTitle>
            <CardDescription>
              Define what students will learn and the course requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* What You'll Learn - Multilingual */}
            <MultilingualArrayInput
              label="What You'll Learn"
              value={formData.whatYouWillLearn}
              onChange={(value) => setFormData({ ...formData, whatYouWillLearn: value })}
              placeholder="Add a learning outcome"
              addItemPlaceholder="e.g., Master React fundamentals"
              description="Key learning outcomes that students will achieve"
            />

            {/* Prerequisites - Multilingual */}
            <MultilingualArrayInput
              label="Prerequisites"
              value={formData.prerequisites}
              onChange={(value) => setFormData({ ...formData, prerequisites: value })}
              placeholder="Add a prerequisite"
              addItemPlaceholder="e.g., Basic JavaScript knowledge"
              description="What students should know before taking this course"
            />

            {/* Target Audience - Multilingual */}
            <MultilingualArrayInput
              label="Target Audience"
              value={formData.targetAudience}
              onChange={(value) => setFormData({ ...formData, targetAudience: value })}
              placeholder="Add target audience"
              addItemPlaceholder="e.g., Web developers"
              description="Who this course is designed for"
            />

            {/* Tags - Multilingual */}
            <MultilingualArrayInput
              label="Tags"
              value={formData.tags}
              onChange={(value) => setFormData({ ...formData, tags: value })}
              placeholder="Add a tag"
              addItemPlaceholder="e.g., React, JavaScript"
              description="Tags to help students find your course"
            />

            {/* Skills - Multilingual */}
            <MultilingualArrayInput
              label="Skills"
              value={formData.skills}
              onChange={(value) => setFormData({ ...formData, skills: value })}
              placeholder="Add a skill"
              addItemPlaceholder="e.g., Component Development"
              description="Specific skills students will develop"
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handlePreview}
            disabled={loading}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Creating...' : 'Create Course'}
            </Button>
          </div>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="flex items-center gap-2 text-sm text-red-600 p-3 bg-red-50 rounded-md">
            <AlertCircle className="h-4 w-4" />
            <span>{errors.submit}</span>
          </div>
        )}
      </form>
    </div>
  );
}

// Local static data for categories and difficulties
const localCategories: CourseCategory[] = [
  { id: 'technology', name: 'Technology' },
  { id: 'business', name: 'Business' },
  { id: 'design', name: 'Design' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'personal-development', name: 'Personal Development' },
  { id: 'languages', name: 'Languages' },
  { id: 'science', name: 'Science' },
  { id: 'arts-crafts', name: 'Arts & Crafts' },
  { id: 'health-fitness', name: 'Health & Fitness' },
  { id: 'music', name: 'Music' },
  { id: 'photography', name: 'Photography' },
  { id: 'other', name: 'Other' }
]
const localDifficulties: CourseDifficulty[] = [
  { id: 'beginner', name: 'Beginner' },
  { id: 'intermediate', name: 'Intermediate' },
  { id: 'advanced', name: 'Advanced' }
]
