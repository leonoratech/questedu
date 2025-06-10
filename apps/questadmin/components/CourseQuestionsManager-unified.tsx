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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import {
    getQuestionLanguages,
    isMultilingualQuestion
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
    MultilingualArray,
    MultilingualText,
    RequiredMultilingualText,
    SupportedLanguage
} from '@/lib/multilingual-types'
import {
    createMultilingualArray,
    createMultilingualText,
    getCompatibleArray,
    getCompatibleText
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

// Hybrid interface to support both legacy and multilingual questions
interface HybridCourseQuestion extends Omit<CourseQuestion, 'question' | 'options' | 'correctAnswer' | 'explanation' | 'tags'> {
  question: RequiredMultilingualText | string
  options?: MultilingualArray | string[]
  correctAnswer?: MultilingualText | string | string[]
  explanation?: MultilingualText | string
  tags: MultilingualArray | string[]
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
  const createInitialFormData = () => ({
    question: multilingualMode ? createMultilingualText('') : '',
    type: 'multiple_choice' as const,
    marks: 1,
    difficulty: 'easy' as const,
    options: multilingualMode ? createMultilingualArray(['', '', '', '']) : ['', '', '', ''],
    correctAnswer: multilingualMode ? createMultilingualText('') : '',
    explanation: multilingualMode ? createMultilingualText('') : '',
    tags: multilingualMode ? createMultilingualArray([]) : [],
    flags: {
      important: false,
      frequently_asked: false,
      practical: false,
      conceptual: false
    } as QuestionFlags,
    category: '',
    topicId: undefined as string | undefined
  })

  const [formData, setFormData] = useState(createInitialFormData())

  useEffect(() => {
    loadQuestions()
    loadTopics()
  }, [courseId])

  const loadQuestions = async () => {
    try {
      setLoading(true)
      const data = await getCourseQuestions(courseId)
      
      // Convert legacy questions to hybrid format and analyze languages
      const hybridQuestions: HybridCourseQuestion[] = data.map(question => ({
        ...question,
        question: question.question,
        options: question.options || [],
        correctAnswer: question.correctAnswer || '',
        explanation: question.explanation || '',
        tags: question.tags || []
      }))
      
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
              ? getCompatibleArray(formData.options as MultilingualArray, DEFAULT_LANGUAGE) 
              : formData.options as string[])
          : undefined,
        correctAnswer: multilingualMode 
          ? getCompatibleText(formData.correctAnswer as MultilingualText, DEFAULT_LANGUAGE)
          : formData.correctAnswer as string,
        explanation: multilingualMode 
          ? getCompatibleText(formData.explanation as MultilingualText, DEFAULT_LANGUAGE)
          : formData.explanation as string,
        explanationRichText: '',
        tags: multilingualMode 
          ? getCompatibleArray(formData.tags as MultilingualArray, DEFAULT_LANGUAGE)
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
        toast.success('Question updated successfully!')
      } else {
        await createCourseQuestion(questionData, user.uid)
        toast.success('Question created successfully!')
      }

      await loadQuestions()
      resetForm()
    } catch (error) {
      console.error('Error saving question:', error)
      toast.error('Failed to save question')
    }
  }

  const handleEdit = (question: HybridCourseQuestion) => {
    if (!isEditable) return
    
    setFormData({
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
            : (question.options as MultilingualArray || createMultilingualArray([])))
        : (Array.isArray(question.options) 
            ? question.options as string[]
            : getCompatibleArray(question.options as MultilingualArray || createMultilingualArray([]), DEFAULT_LANGUAGE)),
      correctAnswer: multilingualMode
        ? (typeof question.correctAnswer === 'string' 
            ? createMultilingualText(question.correctAnswer) 
            : (question.correctAnswer as MultilingualText || createMultilingualText('')))
        : (typeof question.correctAnswer === 'string' 
            ? question.correctAnswer 
            : getCompatibleText(question.correctAnswer as MultilingualText || createMultilingualText(''), DEFAULT_LANGUAGE)),
      explanation: multilingualMode
        ? (typeof question.explanation === 'string' 
            ? createMultilingualText(question.explanation) 
            : (question.explanation as MultilingualText || createMultilingualText('')))
        : (typeof question.explanation === 'string' 
            ? question.explanation 
            : getCompatibleText(question.explanation as MultilingualText || createMultilingualText(''), DEFAULT_LANGUAGE)),
      tags: multilingualMode
        ? (Array.isArray(question.tags) 
            ? createMultilingualArray(question.tags as string[]) 
            : (question.tags as MultilingualArray || createMultilingualArray([])))
        : (Array.isArray(question.tags) 
            ? question.tags as string[]
            : getCompatibleArray(question.tags as MultilingualArray || createMultilingualArray([]), DEFAULT_LANGUAGE)),
      topicId: question.topicId,
      flags: question.flags || {
        important: false,
        frequently_asked: false,
        practical: false,
        conceptual: false
      },
      category: question.category || ''
    })
    setEditingQuestion(question)
    setShowForm(true)
  }

  const handleDelete = async (question: HybridCourseQuestion) => {
    if (!isEditable || !question.id) return
    
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteCourseQuestion(question.id)
        await loadQuestions()
        toast.success('Question deleted successfully!')
      } catch (error) {
        console.error('Error deleting question:', error)
        toast.error('Failed to delete question')
      }
    }
  }

  // Filter questions based on search and filters
  const filteredQuestions = questions.filter(question => {
    const questionText = multilingualMode 
      ? getCompatibleText(question.question as RequiredMultilingualText, selectedLanguage)
      : (question.question as string)
    const questionTags = multilingualMode 
      ? getCompatibleArray(question.tags as MultilingualArray, selectedLanguage)
      : (question.tags as string[])
    
    const matchesSearch = searchTerm === '' || 
      questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      questionTags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesType = filterType === 'all' || question.type === filterType
    const matchesDifficulty = filterDifficulty === 'all' || question.difficulty === filterDifficulty
    const matchesTopic = filterTopic === 'all' || question.topicId === filterTopic
    
    return matchesSearch && matchesType && matchesDifficulty && matchesTopic
  })

  // Calculate statistics
  const stats = {
    total: questions.length,
    easy: questions.filter(q => q.difficulty === 'easy').length,
    medium: questions.filter(q => q.difficulty === 'medium').length,
    hard: questions.filter(q => q.difficulty === 'hard').length,
    multipleChoice: questions.filter(q => q.type === 'multiple_choice').length,
    essay: questions.filter(q => q.type === 'short_essay' || q.type === 'long_essay').length
  }

  const isMultilingual = availableLanguages.length > 1 && multilingualMode

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            {isMultilingual && <Globe className="h-6 w-6 text-blue-600" />}
            {multilingualMode ? 'Multilingual Course Questions' : 'Course Questions'}
          </h2>
          <p className="text-gray-600 mt-1">
            Manage questions and quizzes for {courseName}
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
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Questions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.easy}</div>
            <p className="text-xs text-muted-foreground">Easy</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.medium}</div>
            <p className="text-xs text-muted-foreground">Medium</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.hard}</div>
            <p className="text-xs text-muted-foreground">Hard</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Question Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {QUESTION_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                {DIFFICULTY_LEVELS.map(level => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterTopic} onValueChange={setFilterTopic}>
              <SelectTrigger>
                <SelectValue placeholder="Topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                <SelectItem value="">No Topic</SelectItem>
                {topics.map(topic => (
                  <SelectItem key={topic.id} value={topic.id!}>
                    {topic.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Question List</TabsTrigger>
          {showForm && (
            <TabsTrigger value="form">
              {editingQuestion ? 'Edit Question' : 'Add Question'}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading questions...</p>
              </CardContent>
            </Card>
          ) : filteredQuestions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
                <p className="text-gray-600 mb-4">
                  {questions.length === 0 
                    ? "Add questions to help students test their knowledge and understanding."
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
                const questionText = multilingualMode 
                  ? getCompatibleText(question.question as RequiredMultilingualText, selectedLanguage)
                  : (question.question as string)
                const questionTags = multilingualMode 
                  ? getCompatibleArray(question.tags as MultilingualArray, selectedLanguage)
                  : (question.tags as string[])
                const explanation = multilingualMode 
                  ? getCompatibleText(question.explanation as MultilingualText, selectedLanguage)
                  : (question.explanation as string)
                const options = multilingualMode 
                  ? getCompatibleArray(question.options as MultilingualArray, selectedLanguage)
                  : (question.options as string[])
                const isQuestionMultilingual = isMultilingualQuestion(question as any)
                
                return (
                  <Card key={question.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">
                              {QUESTION_TYPES.find(t => t.value === question.type)?.icon} {question.type.replace('_', ' ')}
                            </Badge>
                            <Badge className={DIFFICULTY_LEVELS.find(d => d.value === question.difficulty)?.color}>
                              {question.difficulty}
                            </Badge>
                            <Badge variant="outline">{question.marks} marks</Badge>
                            {isQuestionMultilingual && (
                              <Badge className="bg-blue-100 text-blue-800">
                                <Globe className="h-3 w-3 mr-1" />
                                Multilingual
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-lg font-medium mb-2">{questionText}</h3>
                          
                          {/* Show options for multiple choice */}
                          {question.type === 'multiple_choice' && options && options.length > 0 && (
                            <div className="mb-3">
                              <p className="text-sm font-medium text-gray-700 mb-1">Options:</p>
                              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                {options.map((option, i) => (
                                  <li key={i}>{option}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {/* Show explanation if available */}
                          {explanation && (
                            <div className="mb-3">
                              <p className="text-sm font-medium text-gray-700">Explanation:</p>
                              <p className="text-sm text-gray-600">{explanation}</p>
                            </div>
                          )}
                          
                          {/* Show tags */}
                          {questionTags && questionTags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {questionTags.map((tag, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
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
        </TabsContent>

        {/* Question Form */}
        {showForm && (
          <TabsContent value="form">
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingQuestion ? 'Edit Question' : 'Add New Question'}
                </CardTitle>
                <CardDescription>
                  {multilingualMode 
                    ? 'Create questions that support multiple languages (English and Telugu)'
                    : 'Create a new question for your course'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Question Text */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      {multilingualMode && <Globe className="h-4 w-4" />}
                      Question Text *
                    </Label>
                    {multilingualMode ? (
                      <MultilingualTextarea
                        label="Question Text"
                        value={formData.question as RequiredMultilingualText}
                        onChange={(value) => setFormData(prev => ({ ...prev, question: value }))}
                        placeholder="Enter your question"
                        rows={3}
                        required
                      />
                    ) : (
                      <Textarea
                        value={formData.question as string}
                        onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                        placeholder="Enter your question"
                        rows={3}
                        required
                      />
                    )}
                  </div>

                  {/* Question Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Question Type *</Label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {QUESTION_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.icon} {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Difficulty *</Label>
                      <Select 
                        value={formData.difficulty} 
                        onValueChange={(value: any) => setFormData(prev => ({ ...prev, difficulty: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
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

                    <div className="space-y-2">
                      <Label>Marks *</Label>
                      <Select 
                        value={formData.marks.toString()} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, marks: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select marks" />
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

                  {/* Options for Multiple Choice */}
                  {formData.type === 'multiple_choice' && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        {multilingualMode && <Globe className="h-4 w-4" />}
                        Answer Options *
                      </Label>
                      {multilingualMode ? (
                        <MultilingualArrayInput
                          label="Answer Options"
                          value={formData.options as MultilingualArray}
                          onChange={(value) => setFormData(prev => ({ ...prev, options: value }))}
                          placeholder="Enter an option"
                          minItems={2}
                          maxItems={6}
                        />
                      ) : (
                        <div className="space-y-2">
                          {(formData.options as string[]).map((option, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...(formData.options as string[])]
                                  newOptions[index] = e.target.value
                                  setFormData(prev => ({ ...prev, options: newOptions }))
                                }}
                                placeholder={`Option ${index + 1}`}
                              />
                              {(formData.options as string[]).length > 2 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    const newOptions = (formData.options as string[]).filter((_, i) => i !== index)
                                    setFormData(prev => ({ ...prev, options: newOptions }))
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          {(formData.options as string[]).length < 6 && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                const newOptions = [...(formData.options as string[]), '']
                                setFormData(prev => ({ ...prev, options: newOptions }))
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Option
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Correct Answer */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      {multilingualMode && <Globe className="h-4 w-4" />}
                      Correct Answer *
                    </Label>
                    {formData.type === 'true_false' ? (
                      <Select 
                        value={multilingualMode 
                          ? getCompatibleText(formData.correctAnswer as MultilingualText, DEFAULT_LANGUAGE)
                          : formData.correctAnswer as string
                        }
                        onValueChange={(value) => setFormData(prev => ({ 
                          ...prev, 
                          correctAnswer: multilingualMode ? createMultilingualText(value) : value 
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select answer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">True</SelectItem>
                          <SelectItem value="false">False</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : multilingualMode ? (
                      <MultilingualTextarea
                        label="Correct Answer"
                        value={formData.correctAnswer as MultilingualText}
                        onChange={(value) => setFormData(prev => ({ ...prev, correctAnswer: value }))}
                        placeholder="Enter the correct answer"
                        rows={2}
                        required
                      />
                    ) : (
                      <Textarea
                        value={formData.correctAnswer as string}
                        onChange={(e) => setFormData(prev => ({ ...prev, correctAnswer: e.target.value }))}
                        placeholder="Enter the correct answer"
                        rows={2}
                        required
                      />
                    )}
                  </div>

                  {/* Explanation */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      {multilingualMode && <Globe className="h-4 w-4" />}
                      Explanation
                    </Label>
                    {multilingualMode ? (
                      <MultilingualTextarea
                        label="Explanation"
                        value={formData.explanation as MultilingualText}
                        onChange={(value) => setFormData(prev => ({ ...prev, explanation: value }))}
                        placeholder="Explain why this is the correct answer"
                        rows={3}
                      />
                    ) : (
                      <Textarea
                        value={formData.explanation as string}
                        onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                        placeholder="Explain why this is the correct answer"
                        rows={3}
                      />
                    )}
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      {multilingualMode && <Globe className="h-4 w-4" />}
                      Tags
                    </Label>
                    {multilingualMode ? (
                      <MultilingualArrayInput
                        label="Tags"
                        value={formData.tags as MultilingualArray}
                        onChange={(value) => setFormData(prev => ({ ...prev, tags: value }))}
                        placeholder="Add a tag"
                      />
                    ) : (
                      <div className="space-y-2">
                        {(formData.tags as string[]).map((tag, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={tag}
                              onChange={(e) => {
                                const newTags = [...(formData.tags as string[])]
                                newTags[index] = e.target.value
                                setFormData(prev => ({ ...prev, tags: newTags }))
                              }}
                              placeholder="Enter a tag"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                const newTags = (formData.tags as string[]).filter((_, i) => i !== index)
                                setFormData(prev => ({ ...prev, tags: newTags }))
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
                            const newTags = [...(formData.tags as string[]), '']
                            setFormData(prev => ({ ...prev, tags: newTags }))
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Tag
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Additional Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Topic (Optional)</Label>
                      <Select 
                        value={formData.topicId || ''} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, topicId: value || undefined }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select topic" />
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

                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Input
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="e.g., Concept, Practice, Review"
                      />
                    </div>
                  </div>

                  {/* Question Flags */}
                  <div className="space-y-3">
                    <Label>Question Flags</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="important"
                          checked={formData.flags.important}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ 
                              ...prev, 
                              flags: { ...prev.flags, important: !!checked } 
                            }))
                          }
                        />
                        <Label htmlFor="important" className="text-sm">Important</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="frequently_asked"
                          checked={formData.flags.frequently_asked}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ 
                              ...prev, 
                              flags: { ...prev.flags, frequently_asked: !!checked } 
                            }))
                          }
                        />
                        <Label htmlFor="frequently_asked" className="text-sm">Frequently Asked</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="practical"
                          checked={formData.flags.practical}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ 
                              ...prev, 
                              flags: { ...prev.flags, practical: !!checked } 
                            }))
                          }
                        />
                        <Label htmlFor="practical" className="text-sm">Practical</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="conceptual"
                          checked={formData.flags.conceptual}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ 
                              ...prev, 
                              flags: { ...prev.flags, conceptual: !!checked } 
                            }))
                          }
                        />
                        <Label htmlFor="conceptual" className="text-sm">Conceptual</Label>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-3 pt-6 border-t">
                    <Button
                      type="submit"
                      className="flex-1"
                    >
                      {editingQuestion ? 'Update Question' : 'Create Question'}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
