'use client'

import { LanguageSelector } from '@/components/LanguageSelector'
import { MultilingualArrayInput, MultilingualTextarea } from '@/components/MultilingualInput'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import {
    getQuestionLanguages
} from '@/data/models/data-model'
import { AdminCourseTopic, getCourseTopics } from '@/data/services/admin-course-service'
import {
    CourseQuestion,
    CreateCourseQuestionData,
    QuestionFlags,
    createCourseQuestion,
    deleteCourseQuestion,
    getCourseQuestions,
    updateCourseQuestion
} from '@/data/services/course-questions-service'
import {
    DEFAULT_LANGUAGE,
    RequiredMultilingualArray,
    RequiredMultilingualText,
    SupportedLanguage
} from '@/lib/multilingual-types'
import {
    createMultilingualArray,
    createMultilingualText,
    getCompatibleArray,
    getCompatibleText,
    isMultilingualContent
} from '@/lib/multilingual-utils'
import {
    BookOpen,
    Edit,
    Globe,
    Plus,
    Search,
    Trash2
} from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface CourseQuestionsManagerProps {
  courseId: string
  courseName: string
  isEditable?: boolean
  multilingualMode?: boolean
}

// Form data that handles both modes with proper typing
interface QuestionFormData {
  question: string | RequiredMultilingualText
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'short_essay' | 'long_essay'
  marks: number
  difficulty: 'easy' | 'medium' | 'hard'
  options: string[] | RequiredMultilingualArray
  correctAnswer: string | RequiredMultilingualText
  explanation: string | RequiredMultilingualText
  tags: string[] | RequiredMultilingualArray
  flags: QuestionFlags
  category: string
  topicId: string | undefined
}

// Hybrid interface to support both legacy and multilingual questions
interface HybridCourseQuestion extends Omit<CourseQuestion, 'question' | 'options' | 'correctAnswer' | 'explanation' | 'tags'> {
  question: RequiredMultilingualText | string
  options?: RequiredMultilingualArray | string[]
  correctAnswer?: RequiredMultilingualText | string | string[]
  explanation?: RequiredMultilingualText | string
  tags: RequiredMultilingualArray | string[]
}

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice', icon: '☑️' },
  { value: 'true_false', label: 'True/False', icon: '✓✗' },
  { value: 'fill_blank', label: 'Fill in the Blanks', icon: '___' },
  { value: 'short_essay', label: 'Short Essay', icon: '📝' },
  { value: 'long_essay', label: 'Long Essay', icon: '📄' }
]

const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Easy', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'hard', label: 'Hard', color: 'bg-red-100 text-red-800' }
]

const MARKS_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25]

export function CourseQuestionsManager({ 
  courseId, 
  courseName, 
  isEditable = true,
  multilingualMode = false
}: CourseQuestionsManagerProps) {
  const { user } = useAuth()
  const [questions, setQuestions] = useState<HybridCourseQuestion[]>([])
  const [topics, setTopics] = useState<AdminCourseTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<HybridCourseQuestion | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
  const [filterTopic, setFilterTopic] = useState<string>('all')
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(DEFAULT_LANGUAGE)
  const [availableLanguages, setAvailableLanguages] = useState<SupportedLanguage[]>([DEFAULT_LANGUAGE])

  // Create form data based on multilingual mode
  const createInitialFormData = (): QuestionFormData => ({
    question: multilingualMode ? createMultilingualText('') : '',
    type: 'multiple_choice',
    marks: 1,
    difficulty: 'easy',
    options: multilingualMode ? createMultilingualArray(['', '', '', '']) : ['', '', '', ''],
    correctAnswer: multilingualMode ? createMultilingualText('') : '',
    explanation: multilingualMode ? createMultilingualText('') : '',
    tags: multilingualMode ? createMultilingualArray([]) : [],
    flags: {
      important: false,
      frequently_asked: false,
      practical: false,
      conceptual: false
    },
    category: '',
    topicId: undefined
  })

  const [formData, setFormData] = useState<QuestionFormData>(createInitialFormData())

  useEffect(() => {
    loadQuestions()
    loadTopics()
  }, [courseId])

  const loadQuestions = async () => {
    try {
      setLoading(true)
      const data = await getCourseQuestions(courseId)
      
      // Convert legacy questions to hybrid format and analyze languages
      const hybridQuestions: HybridCourseQuestion[] = data.map(question => {
        // Ensure proper types for multilingual content
        const processedQuestion: HybridCourseQuestion = {
          ...question,
          question: question.question || '',
          options: question.options || [],
          correctAnswer: question.correctAnswer || '',
          explanation: question.explanation || '',
          tags: question.tags || []
        }
        return processedQuestion
      })
      
      setQuestions(hybridQuestions)
      
      // Determine available languages from questions
      const questionsLanguages = new Set<SupportedLanguage>([DEFAULT_LANGUAGE])
      
      hybridQuestions.forEach(question => {
        const questionLanguages = getQuestionLanguages(question as any)
        questionLanguages.forEach(lang => questionsLanguages.add(lang))
      })
      
      setAvailableLanguages(Array.from(questionsLanguages))
    } catch (error) {
      console.error('Error loading questions:', error)
      toast.error('Failed to load questions')
    } finally {
      setLoading(false)
    }
  }

  const loadTopics = async () => {
    try {
      const data = await getCourseTopics(courseId)
      setTopics(data)
    } catch (error) {
      console.error('Error loading topics:', error)
    }
  }

  const resetForm = () => {
    setFormData(createInitialFormData())
    setEditingQuestion(null)
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.uid) {
      toast.error('You must be logged in to save questions')
      return
    }

    try {
      // Convert form data to API format based on mode
      const questionData: CreateCourseQuestionData = {
        courseId,
        question: multilingualMode 
          ? getCompatibleText(formData.question as RequiredMultilingualText, DEFAULT_LANGUAGE)
          : formData.question as string,
        questionRichText: '',
        type: formData.type,
        marks: formData.marks,
        difficulty: formData.difficulty,
        options: formData.type === 'multiple_choice' 
          ? (multilingualMode 
              ? getCompatibleArray(formData.options as RequiredMultilingualArray, DEFAULT_LANGUAGE) 
              : formData.options as string[])
          : undefined,
        correctAnswer: multilingualMode 
          ? getCompatibleText(formData.correctAnswer as RequiredMultilingualText, DEFAULT_LANGUAGE)
          : formData.correctAnswer as string,
        explanation: multilingualMode 
          ? getCompatibleText(formData.explanation as RequiredMultilingualText, DEFAULT_LANGUAGE)
          : formData.explanation as string,
        explanationRichText: '',
        tags: multilingualMode 
          ? getCompatibleArray(formData.tags as RequiredMultilingualArray, DEFAULT_LANGUAGE)
          : formData.tags as string[],
        topicId: formData.topicId,
        flags: formData.flags,
        category: formData.category,
        isPublished: true,
        order: questions.length + 1,
        createdBy: user.uid
      }

      if (editingQuestion?.id) {
        await updateCourseQuestion(editingQuestion.id, questionData, user.uid)
        toast.success('Question updated successfully')
      } else {
        await createCourseQuestion(questionData, user.uid)
        toast.success('Question created successfully')
      }

      resetForm()
      loadQuestions()
    } catch (error) {
      console.error('Error saving question:', error)
      toast.error('Failed to save question')
    }
  }

  const handleEdit = (question: HybridCourseQuestion) => {
    // Convert question data to form format
    const editFormData: QuestionFormData = {
      question: multilingualMode
        ? (typeof question.question === 'string' 
            ? createMultilingualText(question.question)
            : question.question)
        : (typeof question.question === 'string' 
            ? question.question 
            : getCompatibleText(question.question, DEFAULT_LANGUAGE)),
      type: question.type,
      marks: question.marks,
      difficulty: question.difficulty,
      options: multilingualMode
        ? (Array.isArray(question.options)
            ? createMultilingualArray(question.options as string[])
            : (question.options as RequiredMultilingualArray || createMultilingualArray(['', '', '', ''])))
        : (Array.isArray(question.options)
            ? question.options as string[]
            : getCompatibleArray(question.options as RequiredMultilingualArray, DEFAULT_LANGUAGE)),
      correctAnswer: multilingualMode
        ? (typeof question.correctAnswer === 'string'
            ? createMultilingualText(question.correctAnswer)
            : ((question.correctAnswer as RequiredMultilingualText) || createMultilingualText('')))
        : (typeof question.correctAnswer === 'string'
            ? question.correctAnswer
            : getCompatibleText((question.correctAnswer as RequiredMultilingualText) || createMultilingualText(''), DEFAULT_LANGUAGE)),
      explanation: multilingualMode
        ? (typeof question.explanation === 'string'
            ? createMultilingualText(question.explanation)
            : ((question.explanation as RequiredMultilingualText) || createMultilingualText('')))
        : (typeof question.explanation === 'string'
            ? question.explanation
            : getCompatibleText((question.explanation as RequiredMultilingualText) || createMultilingualText(''), DEFAULT_LANGUAGE)),
      tags: multilingualMode
        ? (Array.isArray(question.tags)
            ? createMultilingualArray(question.tags as string[])
            : ((question.tags as RequiredMultilingualArray) || createMultilingualArray([])))
        : (Array.isArray(question.tags)
            ? question.tags as string[]
            : getCompatibleArray((question.tags as RequiredMultilingualArray) || createMultilingualArray([]), DEFAULT_LANGUAGE)),
      topicId: question.topicId,
      flags: question.flags,
      category: question.category || ''
    }

    setFormData(editFormData)
    setEditingQuestion(question)
    setShowForm(true)
  }

  const handleDelete = async (question: HybridCourseQuestion) => {
    if (!question.id || !window.confirm('Are you sure you want to delete this question?')) {
      return
    }

    try {
      await deleteCourseQuestion(question.id)
      toast.success('Question deleted successfully')
      loadQuestions()
    } catch (error) {
      console.error('Error deleting question:', error)
      toast.error('Failed to delete question')
    }
  }

  // Helper functions for form data updates
  const updateFormDataField = <K extends keyof QuestionFormData>(
    field: K, 
    value: QuestionFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Helper to handle tags update for regular mode
  const handleTagsUpdate = (newTags: string[]) => {
    updateFormDataField('tags', newTags as string[] | RequiredMultilingualArray)
  }

  // Filter questions based on search and filters
  const filteredQuestions = questions.filter(question => {
    const questionText = getCompatibleText(question.question, selectedLanguage).toLowerCase()
    const matchesSearch = searchTerm === '' || questionText.includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || question.type === filterType
    const matchesDifficulty = filterDifficulty === 'all' || question.difficulty === filterDifficulty
    const matchesTopic = filterTopic === 'all' || question.topicId === filterTopic
    
    return matchesSearch && matchesType && matchesDifficulty && matchesTopic
  })

  const isMultilingual = multilingualMode && availableLanguages.length > 1

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading questions...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Course Questions</h2>
          <p className="text-gray-600">
            Manage questions for {courseName}
            {isMultilingual && <span className="ml-2 text-blue-600">(Multilingual)</span>}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {isMultilingual && (
            <LanguageSelector
              currentLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              availableLanguages={availableLanguages}
            />
          )}
          {isEditable && (
            <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
            <p className="text-sm text-gray-600">Total Questions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {questions.filter(q => q.difficulty === 'easy').length}
            </div>
            <p className="text-sm text-gray-600">Easy</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {questions.filter(q => q.difficulty === 'medium').length}
            </div>
            <p className="text-sm text-gray-600">Medium</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {questions.filter(q => q.difficulty === 'hard').length}
            </div>
            <p className="text-sm text-gray-600">Hard</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <Label>Search Questions</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by question text..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {QUESTION_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Difficulty</Label>
              <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {DIFFICULTY_LEVELS.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Topic</Label>
              <Select value={filterTopic} onValueChange={setFilterTopic}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {topics.map(topic => (
                    <SelectItem key={topic.id} value={topic.id!}>
                      {topic.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
              {multilingualMode && <Globe className="h-4 w-4 text-blue-600" />}
            </CardTitle>
            <CardDescription>
              {editingQuestion ? 'Update the question details below' : 'Enter the question details below'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Question Text */}
              <div>
                {multilingualMode ? (
                  <MultilingualTextarea
                    label="Question *"
                    value={formData.question as RequiredMultilingualText}
                    onChange={(value) => updateFormDataField('question', value)}
                    placeholder="Enter the question text"
                    rows={3}
                    required
                  />
                ) : (
                  <div className="space-y-2">
                    <Label>Question *</Label>
                    <Textarea
                      value={formData.question as string}
                      onChange={(e) => updateFormDataField('question', e.target.value)}
                      placeholder="Enter the question text"
                      rows={3}
                      required
                    />
                  </div>
                )}
              </div>

              {/* Question Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Type *</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value: any) => updateFormDataField('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {QUESTION_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <span className="flex items-center gap-2">
                            <span>{type.icon}</span>
                            {type.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Difficulty *</Label>
                  <Select 
                    value={formData.difficulty} 
                    onValueChange={(value: any) => updateFormDataField('difficulty', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTY_LEVELS.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Marks *</Label>
                  <Select 
                    value={formData.marks.toString()} 
                    onValueChange={(value) => updateFormDataField('marks', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MARKS_OPTIONS.map(marks => (
                        <SelectItem key={marks} value={marks.toString()}>
                          {marks} mark{marks !== 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Multiple Choice Options */}
              {formData.type === 'multiple_choice' && (
                <div>
                  {multilingualMode ? (
                    <MultilingualArrayInput
                      label="Answer Options *"
                      value={formData.options as RequiredMultilingualArray}
                      onChange={(value) => updateFormDataField('options', value)}
                      placeholder="Add an option"
                      required
                    />
                  ) : (
                    <div className="space-y-2">
                      <Label>Answer Options *</Label>
                      {(formData.options as string[]).map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...(formData.options as string[])]
                              newOptions[index] = e.target.value
                              updateFormDataField('options', newOptions)
                            }}
                            placeholder={`Option ${index + 1}`}
                            required
                          />
                          {(formData.options as string[]).length > 2 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newOptions = (formData.options as string[]).filter((_, i) => i !== index)
                                updateFormDataField('options', newOptions)
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newOptions = [...(formData.options as string[]), '']
                          updateFormDataField('options', newOptions)
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Option
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Correct Answer */}
              <div>
                {multilingualMode ? (
                  <MultilingualTextarea
                    label="Correct Answer *"
                    value={formData.correctAnswer as RequiredMultilingualText}
                    onChange={(value) => updateFormDataField('correctAnswer', value)}
                    placeholder="Enter the correct answer"
                    rows={2}
                    required
                  />
                ) : (
                  <div className="space-y-2">
                    <Label>Correct Answer *</Label>
                    <Textarea
                      value={formData.correctAnswer as string}
                      onChange={(e) => updateFormDataField('correctAnswer', e.target.value)}
                      placeholder="Enter the correct answer"
                      rows={2}
                      required
                    />
                  </div>
                )}
              </div>

              {/* Explanation */}
              <div>
                {multilingualMode ? (
                  <MultilingualTextarea
                    label="Explanation"
                    value={formData.explanation as RequiredMultilingualText}
                    onChange={(value) => updateFormDataField('explanation', value)}
                    placeholder="Enter an explanation (optional)"
                    rows={3}
                  />
                ) : (
                  <div className="space-y-2">
                    <Label>Explanation</Label>
                    <Textarea
                      value={formData.explanation as string}
                      onChange={(e) => updateFormDataField('explanation', e.target.value)}
                      placeholder="Enter an explanation (optional)"
                      rows={3}
                    />
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                {multilingualMode ? (
                  <MultilingualArrayInput
                    label="Tags"
                    value={formData.tags as RequiredMultilingualArray}
                    onChange={(value) => updateFormDataField('tags', value)}
                    placeholder="Add a tag"
                  />
                ) : (
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {(formData.tags as string[]).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newTags = (formData.tags as string[]).filter((_, i) => i !== index)
                              updateFormDataField('tags', newTags as string[] | RequiredMultilingualArray)
                            }}
                            className="h-auto p-0 text-xs"
                          >
                            ×
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            const input = e.target as HTMLInputElement
                            const newTag = input.value.trim()
                            if (newTag && !(formData.tags as string[]).includes(newTag)) {
                              const newTags = [...(formData.tags as string[]), newTag]
                              updateFormDataField('tags', newTags as string[] | RequiredMultilingualArray)
                              input.value = ''
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Topic Selection */}
              <div>
                <Label>Topic</Label>
                <Select 
                  value={formData.topicId || ''} 
                  onValueChange={(value) => updateFormDataField('topicId', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a topic (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Topic</SelectItem>
                    {topics.map(topic => (
                      <SelectItem key={topic.id} value={topic.id!}>
                        {topic.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Question Flags */}
              <div>
                <Label>Question Flags</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                  {Object.entries(formData.flags).map(([flag, checked]) => (
                    <div key={flag} className="flex items-center space-x-2">
                      <Checkbox
                        id={flag}
                        checked={checked}
                        onCheckedChange={(value) => {
                          updateFormDataField('flags', {
                            ...formData.flags,
                            [flag]: value === true
                          })
                        }}
                      />
                      <Label htmlFor={flag} className="text-sm capitalize">
                        {flag.replace('_', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingQuestion ? 'Update Question' : 'Create Question'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Questions ({filteredQuestions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredQuestions.length === 0 ? (
            <Card className="p-8">
              <CardContent className="text-center">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-600 mb-2">
                  {questions.length === 0 
                    ? "No questions found" 
                    : "No questions match your current filters"
                  }
                </p>
                <p className="text-gray-500 mb-4">
                  {questions.length === 0 
                    ? "Get started by creating your first question." 
                    : "Try adjusting your filters to see more questions."
                  }
                </p>
                {isEditable && questions.length === 0 && (
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Question
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((question, index) => {
                const questionText = getCompatibleText(question.question, selectedLanguage)
                const questionTags = getCompatibleArray(question.tags, selectedLanguage)
                const explanation = getCompatibleText(question.explanation, selectedLanguage)
                const options = getCompatibleArray(question.options, selectedLanguage)
                const isQuestionMultilingual = isMultilingualContent(question.question)
                
                return (
                  <Card key={question.id || index} className="relative">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge 
                              variant="outline" 
                              className={DIFFICULTY_LEVELS.find(l => l.value === question.difficulty)?.color}
                            >
                              {DIFFICULTY_LEVELS.find(l => l.value === question.difficulty)?.label}
                            </Badge>
                            <Badge variant="secondary">
                              {QUESTION_TYPES.find(t => t.value === question.type)?.label}
                            </Badge>
                            <Badge variant="outline">
                              {question.marks} mark{question.marks !== 1 ? 's' : ''}
                            </Badge>
                            {isQuestionMultilingual && (
                              <Badge variant="outline" className="text-blue-600 border-blue-600">
                                <Globe className="h-3 w-3 mr-1" />
                                Multilingual
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-medium text-lg mb-2">{questionText}</h3>
                          
                          {/* Show options for multiple choice */}
                          {question.type === 'multiple_choice' && options.length > 0 && (
                            <div className="mb-3">
                              <p className="text-sm font-medium text-gray-600 mb-1">Options:</p>
                              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                {options.map((option, optIndex) => (
                                  <li key={optIndex}>{option}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Show explanation if available */}
                          {explanation && (
                            <div className="mb-3">
                              <p className="text-sm font-medium text-gray-600 mb-1">Explanation:</p>
                              <p className="text-sm text-gray-700">{explanation}</p>
                            </div>
                          )}

                          {/* Show tags */}
                          {questionTags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {questionTags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Topic */}
                          {question.topicId && (
                            <p className="text-xs text-gray-500">
                              Topic: {topics.find(t => t.id === question.topicId)?.title || 'Unknown'}
                            </p>
                          )}
                        </div>

                        {isEditable && (
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(question)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(question)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
