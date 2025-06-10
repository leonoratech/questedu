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

interface MultilingualCourseQuestionsManagerProps {
  courseId: string
  courseName: string
  isEditable?: boolean
}

interface MultilingualQuestionFormData {
  question: RequiredMultilingualText
  questionRichText?: MultilingualText
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'short_essay' | 'long_essay'
  marks: number
  difficulty: 'easy' | 'medium' | 'hard'
  options: MultilingualArray
  correctAnswer: MultilingualText
  explanation: MultilingualText
  explanationRichText?: MultilingualText
  tags: MultilingualArray
  topicId?: string
  flags: QuestionFlags
  category?: string
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

export function MultilingualCourseQuestionsManager({ 
  courseId, 
  courseName, 
  isEditable = true 
}: MultilingualCourseQuestionsManagerProps) {
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
  const [formData, setFormData] = useState<MultilingualQuestionFormData>({
    question: createMultilingualText(''),
    type: 'multiple_choice',
    marks: 1,
    difficulty: 'easy',
    options: createMultilingualArray(['', '', '', '']),
    correctAnswer: createMultilingualText(''),
    explanation: createMultilingualText(''),
    tags: createMultilingualArray([]),
    flags: {
      important: false,
      frequently_asked: false,
      practical: false,
      conceptual: false
    }
  })

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
    setFormData({
      question: createMultilingualText(''),
      type: 'multiple_choice',
      marks: 1,
      difficulty: 'easy',
      options: createMultilingualArray(['', '', '', '']),
      correctAnswer: createMultilingualText(''),
      explanation: createMultilingualText(''),
      tags: createMultilingualArray([]),
      flags: {
        important: false,
        frequently_asked: false,
        practical: false,
        conceptual: false
      }
    })
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
      // For now, convert multilingual data to legacy format for API compatibility
      const questionData: CreateCourseQuestionData = {
        courseId,
        question: getCompatibleText(formData.question, DEFAULT_LANGUAGE),
        questionRichText: '',
        type: formData.type,
        marks: formData.marks,
        difficulty: formData.difficulty,
        options: formData.type === 'multiple_choice' ? getCompatibleArray(formData.options, DEFAULT_LANGUAGE) : undefined,
        correctAnswer: getCompatibleText(formData.correctAnswer, DEFAULT_LANGUAGE),
        explanation: getCompatibleText(formData.explanation, DEFAULT_LANGUAGE),
        explanationRichText: '',
        tags: getCompatibleArray(formData.tags, DEFAULT_LANGUAGE),
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
      question: typeof question.question === 'string' 
        ? createMultilingualText(question.question) 
        : question.question,
      type: question.type,
      marks: question.marks,
      difficulty: question.difficulty,
      options: Array.isArray(question.options) 
        ? createMultilingualArray(question.options as string[]) 
        : (question.options as MultilingualArray || createMultilingualArray([])),
      correctAnswer: typeof question.correctAnswer === 'string' 
        ? createMultilingualText(question.correctAnswer) 
        : (question.correctAnswer as MultilingualText || createMultilingualText('')),
      explanation: typeof question.explanation === 'string' 
        ? createMultilingualText(question.explanation) 
        : (question.explanation as MultilingualText || createMultilingualText('')),
      tags: Array.isArray(question.tags) 
        ? createMultilingualArray(question.tags as string[]) 
        : (question.tags as MultilingualArray || createMultilingualArray([])),
      topicId: question.topicId,
      flags: question.flags,
      category: question.category
    })
    setEditingQuestion(question)
    setShowForm(true)
  }

  const handleDelete = async (questionId: string) => {
    if (!isEditable) return
    
    if (!confirm('Are you sure you want to delete this question?')) return

    try {
      await deleteCourseQuestion(questionId)
      toast.success('Question deleted successfully!')
      await loadQuestions()
    } catch (error) {
      console.error('Error deleting question:', error)
      toast.error('Failed to delete question')
    }
  }

  const filteredQuestions = questions.filter(question => {
    const questionText = getCompatibleText(question.question, selectedLanguage).toLowerCase()
    const questionTags = getCompatibleArray(question.tags, selectedLanguage)
    const explanation = getCompatibleText(question.explanation, selectedLanguage).toLowerCase()
    
    const matchesSearch = searchTerm === '' || 
      questionText.includes(searchTerm.toLowerCase()) ||
      explanation.includes(searchTerm.toLowerCase()) ||
      questionTags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesType = filterType === 'all' || question.type === filterType
    const matchesDifficulty = filterDifficulty === 'all' || question.difficulty === filterDifficulty
    const matchesTopic = filterTopic === 'all' || question.topicId === filterTopic

    return matchesSearch && matchesType && matchesDifficulty && matchesTopic
  })

  const questionStats = {
    total: questions.length,
    easy: questions.filter(q => q.difficulty === 'easy').length,
    medium: questions.filter(q => q.difficulty === 'medium').length,
    hard: questions.filter(q => q.difficulty === 'hard').length,
    multipleChoice: questions.filter(q => q.type === 'multiple_choice').length,
    essay: questions.filter(q => q.type === 'short_essay' || q.type === 'long_essay').length
  }

  const isMultilingual = availableLanguages.length > 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            {isMultilingual && <Globe className="h-6 w-6 text-blue-600" />}
            Course Questions
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
            <div className="text-2xl font-bold text-blue-600">{questionStats.total}</div>
            <div className="text-sm text-gray-600">Total Questions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{questionStats.easy}</div>
            <div className="text-sm text-gray-600">Easy</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{questionStats.medium}</div>
            <div className="text-sm text-gray-600">Medium</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{questionStats.hard}</div>
            <div className="text-sm text-gray-600">Hard</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="questions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="questions">Questions Library</TabsTrigger>
          {showForm && (
            <TabsTrigger value="form">
              {editingQuestion ? 'Edit Question' : 'New Question'}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="questions" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters & Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search Questions</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search questions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Question Type</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
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
                </div>

                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                    <SelectTrigger>
                      <SelectValue placeholder="All difficulties" />
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
                </div>

                <div className="space-y-2">
                  <Label>Topic</Label>
                  <Select value={filterTopic} onValueChange={setFilterTopic}>
                    <SelectTrigger>
                      <SelectValue placeholder="All topics" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Topics</SelectItem>
                      {topics.map(topic => (
                        <SelectItem key={topic.id} value={topic.id!}>
                          {getCompatibleText(topic.title, selectedLanguage)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('')
                      setFilterType('all')
                      setFilterDifficulty('all')
                      setFilterTopic('all')
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading questions...</p>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Questions Found</h3>
                <p className="text-gray-600 mb-4">
                  {questions.length === 0 
                    ? "Start building your question bank by adding your first question."
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
                const isQuestionMultilingual = isMultilingualQuestion(question as any)
                
                return (
                  <Card key={question.id || index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-gray-900 flex items-center gap-2">
                              {isQuestionMultilingual && (
                                <Globe className="h-4 w-4 text-blue-600" />
                              )}
                              Q{index + 1}: {questionText}
                            </h3>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="outline">
                              {QUESTION_TYPES.find(t => t.value === question.type)?.icon} {QUESTION_TYPES.find(t => t.value === question.type)?.label}
                            </Badge>
                            <Badge 
                              className={DIFFICULTY_LEVELS.find(d => d.value === question.difficulty)?.color}
                            >
                              {DIFFICULTY_LEVELS.find(d => d.value === question.difficulty)?.label}
                            </Badge>
                            <Badge variant="secondary">{question.marks} marks</Badge>
                            {question.flags.important && <Badge className="bg-red-100 text-red-800">Important</Badge>}
                            {question.flags.frequently_asked && <Badge className="bg-blue-100 text-blue-800">FAQ</Badge>}
                          </div>

                          {question.type === 'multiple_choice' && options.length > 0 && (
                            <div className="mb-3">
                              <p className="text-sm font-medium text-gray-700 mb-1">Options:</p>
                              <ul className="list-disc list-inside space-y-1">
                                {options.map((option, optIndex) => (
                                  <li key={optIndex} className="text-sm text-gray-600">{option}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {explanation && (
                            <div className="mb-3">
                              <p className="text-sm font-medium text-gray-700">Explanation:</p>
                              <p className="text-sm text-gray-600">{explanation}</p>
                            </div>
                          )}

                          {questionTags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {questionTags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        {isEditable && (
                          <div className="flex gap-2">
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
                              onClick={() => handleDelete(question.id!)}
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
        </TabsContent>

        {showForm && (
          <TabsContent value="form">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  {editingQuestion ? 'Edit Multilingual Question' : 'Add New Multilingual Question'}
                </CardTitle>
                <CardDescription>
                  Create questions that support multiple languages (English and Telugu)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Question Text */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Question Text *
                    </Label>
                    <MultilingualTextarea
                      label="Question Text"
                      value={formData.question}
                      onChange={(value) => setFormData(prev => ({ ...prev, question: value }))}
                      placeholder="Enter your question"
                      rows={3}
                      required
                    />
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
                          {MARKS_OPTIONS.map(mark => (
                            <SelectItem key={mark} value={mark.toString()}>
                              {mark} mark{mark > 1 ? 's' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Multiple Choice Options */}
                  {formData.type === 'multiple_choice' && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Answer Options *
                      </Label>
                      <MultilingualArrayInput
                        label="Answer Options"
                        value={formData.options}
                        onChange={(value) => setFormData(prev => ({ ...prev, options: value }))}
                        placeholder="Enter an option"
                      />
                    </div>
                  )}

                  {/* Correct Answer */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Correct Answer *
                    </Label>
                    {formData.type === 'true_false' ? (
                      <Select 
                        value={getCompatibleText(formData.correctAnswer, DEFAULT_LANGUAGE)} 
                        onValueChange={(value) => setFormData(prev => ({ 
                          ...prev, 
                          correctAnswer: createMultilingualText(value) 
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
                    ) : (
                      <MultilingualTextarea
                        label="Correct Answer"
                        value={formData.correctAnswer}
                        onChange={(value) => setFormData(prev => ({ ...prev, correctAnswer: value }))}
                        placeholder="Enter the correct answer"
                        rows={2}
                        required
                      />
                    )}
                  </div>

                  {/* Explanation */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Explanation
                    </Label>
                    <MultilingualTextarea
                      label="Explanation"
                      value={formData.explanation}
                      onChange={(value) => setFormData(prev => ({ ...prev, explanation: value }))}
                      placeholder="Explain why this is the correct answer"
                      rows={3}
                    />
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Tags
                    </Label>
                    <MultilingualArrayInput
                      label="Tags"
                      value={formData.tags}
                      onChange={(value) => setFormData(prev => ({ ...prev, tags: value }))}
                      placeholder="Add a tag"
                    />
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
                              {getCompatibleText(topic.title, selectedLanguage)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Category (Optional)</Label>
                      <Input
                        value={formData.category || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="e.g., Concept, Practice, Review"
                      />
                    </div>
                  </div>

                  {/* Flags */}
                  <div className="space-y-4">
                    <Label>Question Flags</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
