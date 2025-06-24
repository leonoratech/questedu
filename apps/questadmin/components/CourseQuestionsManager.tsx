'use client'

import { LanguageSelector } from '@/components/LanguageSelector'
import { MultilingualArrayInput, MultilingualTextarea } from '@/components/MultilingualInput'
import { MultilingualRichTextEditor, RichTextDisplay, RichTextEditor } from '@/components/RichTextEditor'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

// Form data that handles both modes with proper typing
interface QuestionFormData {
  question: string | RequiredMultilingualText
  questionRichText: string | RequiredMultilingualText
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'short_essay' | 'long_essay'
  marks: number
  difficulty: 'easy' | 'medium' | 'hard'
  options: string[] | RequiredMultilingualArray
  correctAnswer: string | RequiredMultilingualText
  correctAnswerRichText: string | RequiredMultilingualText
  explanation: string | RequiredMultilingualText
  explanationRichText: string | RequiredMultilingualText
  tags: string[] | RequiredMultilingualArray
  flags: QuestionFlags
  category: string
  topicId: string | undefined
}

// Hybrid interface to support both legacy and multilingual questions
interface HybridCourseQuestion extends Omit<CourseQuestion, 'question' | 'questionRichText' | 'options' | 'correctAnswer' | 'explanation' | 'explanationRichText' | 'tags'> {
  question: RequiredMultilingualText | string
  questionRichText?: RequiredMultilingualText | string
  options?: RequiredMultilingualArray | string[]
  correctAnswer?: RequiredMultilingualText | string | string[]
  explanation?: RequiredMultilingualText | string
  explanationRichText?: RequiredMultilingualText | string
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
    questionRichText: multilingualMode ? createMultilingualText('') : '',
    type: 'multiple_choice',
    marks: 1,
    difficulty: 'easy',
    options: multilingualMode ? createMultilingualArray(['', '', '', '']) : ['', '', '', ''],
    correctAnswer: multilingualMode ? createMultilingualText('') : '',
    correctAnswerRichText: multilingualMode ? createMultilingualText('') : '',
    explanation: multilingualMode ? createMultilingualText('') : '',
    explanationRichText: multilingualMode ? createMultilingualText('') : '',
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
          type: question.type || 'multiple_choice', // Fallback to multiple_choice if type is missing
          marks: question.marks || 1, // Fallback to 1 mark if missing
          difficulty: question.difficulty || 'easy', // Fallback to easy if missing
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
      // Determine if this is an essay question that should use rich text
      const isEssayQuestion = formData.type === 'short_essay' || formData.type === 'long_essay'
      
      // Convert form data to API format based on mode
      const questionData: CreateCourseQuestionData = {
        courseId,
        question: multilingualMode 
          ? getCompatibleText(formData.question as RequiredMultilingualText, DEFAULT_LANGUAGE)
          : formData.question as string,
        questionRichText: isEssayQuestion 
          ? (multilingualMode 
              ? getCompatibleText(formData.questionRichText as RequiredMultilingualText, DEFAULT_LANGUAGE)
              : formData.questionRichText as string)
          : '',
        type: formData.type,
        marks: formData.marks,
        difficulty: formData.difficulty,
        options: formData.type === 'multiple_choice' 
          ? (multilingualMode 
              ? getCompatibleArray(formData.options as RequiredMultilingualArray, DEFAULT_LANGUAGE) 
              : formData.options as string[])
          : undefined,
        correctAnswer: isEssayQuestion 
          ? '' // Essay questions don't have predefined correct answers
          : (multilingualMode 
              ? getCompatibleText(formData.correctAnswer as RequiredMultilingualText, DEFAULT_LANGUAGE)
              : formData.correctAnswer as string),
        explanation: multilingualMode 
          ? getCompatibleText(formData.explanation as RequiredMultilingualText, DEFAULT_LANGUAGE)
          : formData.explanation as string,
        explanationRichText: isEssayQuestion 
          ? (multilingualMode 
              ? getCompatibleText(formData.explanationRichText as RequiredMultilingualText, DEFAULT_LANGUAGE)
              : formData.explanationRichText as string)
          : '',
        tags: multilingualMode 
          ? getCompatibleArray(formData.tags as RequiredMultilingualArray, DEFAULT_LANGUAGE)
          : formData.tags as string[],
        // Only include topicId if it's not undefined (handles "No Topic" selection)
        ...(formData.topicId && { topicId: formData.topicId }),
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
      questionRichText: multilingualMode ? createMultilingualText('') : '',
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
      correctAnswerRichText: multilingualMode ? createMultilingualText('') : '',
      explanation: multilingualMode
        ? (typeof question.explanation === 'string'
            ? createMultilingualText(question.explanation)
            : ((question.explanation as RequiredMultilingualText) || createMultilingualText('')))
        : (typeof question.explanation === 'string'
            ? question.explanation
            : getCompatibleText((question.explanation as RequiredMultilingualText) || createMultilingualText(''), DEFAULT_LANGUAGE)),
      explanationRichText: multilingualMode ? createMultilingualText('') : '',
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
    setFormData(prev => {
      const updatedData = { ...prev, [field]: value }
      
      // Special handling when question type changes to true/false
      if (field === 'type' && value === 'true_false') {
        // Set default correct answer to 'true' for true/false questions
        updatedData.correctAnswer = multilingualMode 
          ? createMultilingualText('true')
          : 'true'
      }
      
      return updatedData
    })
  }

  // Helper function to safely get rich text content
  const getRichTextContent = (content: any, language: SupportedLanguage): string => {
    if (!content) return ''
    if (typeof content === 'string') return content
    if (typeof content === 'object' && content[language]) {
      return content[language]
    }
    return getCompatibleText(content, language)
  }

  // Filter questions based on search and filters
  const filteredQuestions = questions.filter(question => {
    const questionText = multilingualMode 
      ? getCompatibleText(question.question as RequiredMultilingualText, selectedLanguage)
      : (question.question as string)
    const questionTags = multilingualMode 
      ? getCompatibleArray(question.tags as RequiredMultilingualArray, selectedLanguage)
      : (question.tags as string[])
    
    const matchesSearch = searchTerm === '' || 
      questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      questionTags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesType = filterType === 'all' || question.type === filterType
    const matchesDifficulty = filterDifficulty === 'all' || question.difficulty === filterDifficulty
    const matchesTopic = filterTopic === 'all' || 
      (filterTopic === 'none' && (!question.topicId || question.topicId === '')) ||
      question.topicId === filterTopic
    
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

  const isMultilingual = multilingualMode && availableLanguages.length > 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Course Questions
            {isMultilingual && (
              <Badge className="bg-blue-100 text-blue-800">
                <Globe className="h-3 w-3 mr-1" />
                Multilingual
              </Badge>
            )}
          </h2>
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

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total</p>
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
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.multipleChoice}</div>
            <p className="text-xs text-muted-foreground">Multiple Choice</p>
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
                <SelectItem value="none">No Topic</SelectItem>
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

      {/* Main Content with Tabs */}
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
                <p className="text-gray-600">
                  {questions.length === 0 
                    ? 'Get started by creating your first question'
                    : 'Try adjusting your search or filter criteria'
                  }
                </p>
                {isEditable && questions.length === 0 && (
                  <Button onClick={() => setShowForm(true)} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Question
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
                  ? getCompatibleArray(question.tags as RequiredMultilingualArray, selectedLanguage)
                  : (question.tags as string[])
                const explanation = multilingualMode 
                  ? getCompatibleText(question.explanation as RequiredMultilingualText, selectedLanguage)
                  : (question.explanation as string)
                // Handle different option formats
                const rawOptions = question.options || []
                const options = multilingualMode && question.type === 'multiple_choice'
                  ? getCompatibleArray(rawOptions as RequiredMultilingualArray, selectedLanguage)
                  : Array.isArray(rawOptions) 
                    ? rawOptions.map(option => 
                        typeof option === 'string' ? option : (option as any)?.text || String(option)
                      )
                    : []
                  
                return (
                  <Card key={question.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">
                              {QUESTION_TYPES.find(t => t.value === question.type)?.icon} {question.type?.replace('_', ' ') || 'Unknown Type'}
                            </Badge>
                            <Badge className={DIFFICULTY_LEVELS.find(d => d.value === question.difficulty)?.color}>
                              {question.difficulty || 'Unknown'}
                            </Badge>
                            <Badge variant="outline">{question.marks || 0} marks</Badge>
                          </div>

                          <h3 className="text-lg font-medium mb-2">
                            {question.type === 'short_essay' || question.type === 'long_essay' ? (
                              // For essay questions, check if we have rich text content
                              question.questionRichText ? (
                                <RichTextDisplay content={getRichTextContent(question.questionRichText, selectedLanguage)} />
                              ) : (
                                questionText
                              )
                            ) : (
                              questionText
                            )}
                          </h3>
                          
                          {/* Show options for multiple choice */}
                          {question.type === 'multiple_choice' && options && options.length > 0 && (
                            <div className="mb-3">
                              <p className="text-sm font-medium text-gray-700 mb-1">Options:</p>
                              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                {options.map((option, i) => (
                                  <li key={i}>{typeof option === 'string' ? option : String(option)}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Show correct answer for true/false questions */}
                          {question.type === 'true_false' && (
                            <div className="mb-3">
                              <p className="text-sm font-medium text-gray-700 mb-1">Correct Answer:</p>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                (typeof question.correctAnswer === 'string' ? question.correctAnswer : 
                                 getCompatibleText(question.correctAnswer as RequiredMultilingualText, selectedLanguage)) === 'true'
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {typeof question.correctAnswer === 'string' 
                                  ? question.correctAnswer.charAt(0).toUpperCase() + question.correctAnswer.slice(1)
                                  : getCompatibleText(question.correctAnswer as RequiredMultilingualText, selectedLanguage)
                                      .charAt(0).toUpperCase() + 
                                    getCompatibleText(question.correctAnswer as RequiredMultilingualText, selectedLanguage).slice(1)
                                }
                              </span>
                            </div>
                          )}
                          
                          {/* Show explanation if available */}
                          {explanation && (
                            <div className="mb-3">
                              <p className="text-sm font-medium text-gray-700">
                                {question.type === 'short_essay' || question.type === 'long_essay' 
                                  ? 'Grading Guidelines:' 
                                  : 'Explanation:'
                                }
                              </p>
                              {question.type === 'short_essay' || question.type === 'long_essay' ? (
                                // For essay questions, check if we have rich text explanation
                                question.explanationRichText ? (
                                  <RichTextDisplay 
                                    content={getRichTextContent(question.explanationRichText, selectedLanguage)}
                                    className="text-sm"
                                  />
                                ) : (
                                  <p className="text-sm text-gray-600">{explanation}</p>
                                )
                              ) : (
                                <p className="text-sm text-gray-600">{explanation}</p>
                              )}
                            </div>
                          )}

                          {/* Show tags */}
                          {questionTags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {questionTags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="secondary" className="text-xs">
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
                              className="text-blue-600 hover:text-blue-700"
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
                    {formData.type === 'short_essay' || formData.type === 'long_essay' ? (
                      // Rich text editor for essay questions
                      multilingualMode ? (
                        <MultilingualRichTextEditor
                          value={formData.questionRichText as RequiredMultilingualText}
                          onChange={(value) => updateFormDataField('questionRichText', value)}
                          placeholder="Enter your essay question with formatting..."
                          minHeight={formData.type === 'long_essay' ? '150px' : '120px'}
                          label=""
                          required
                        />
                      ) : (
                        <RichTextEditor
                          content={formData.questionRichText as string}
                          onChange={(value) => updateFormDataField('questionRichText', value)}
                          placeholder="Enter your essay question with formatting..."
                          minHeight={formData.type === 'long_essay' ? '150px' : '120px'}
                        />
                      )
                    ) : (
                      // Regular textarea for other question types
                      multilingualMode ? (
                        <MultilingualTextarea
                          label="Question Text"
                          value={formData.question as RequiredMultilingualText}
                          onChange={(value) => updateFormDataField('question', value)}
                          placeholder="Enter your question"
                          rows={3}
                          required
                        />
                      ) : (
                        <Textarea
                          value={formData.question as string}
                          onChange={(e) => updateFormDataField('question', e.target.value)}
                          placeholder="Enter your question"
                          rows={3}
                          required
                        />
                      )
                    )}
                  </div>

                  {/* Question Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Question Type *</Label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(value: any) => updateFormDataField('type', value)}
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
                        onValueChange={(value: any) => updateFormDataField('difficulty', value)}
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
                        onValueChange={(value) => updateFormDataField('marks', parseInt(value))}
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
                          value={formData.options as RequiredMultilingualArray}
                          onChange={(value) => updateFormDataField('options', value)}
                          placeholder="Enter an option"
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
                                  updateFormDataField('options', newOptions)
                                }}
                                placeholder={`Option ${index + 1}`}
                              />
                              {(formData.options as string[]).length > 2 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    const newOptions = (formData.options as string[]).filter((_, i) => i !== index)
                                    updateFormDataField('options', newOptions)
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
                                updateFormDataField('options', newOptions)
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

                  {/* Correct Answer - Hide for essay questions */}
                  {formData.type !== 'short_essay' && formData.type !== 'long_essay' && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        {multilingualMode && <Globe className="h-4 w-4" />}
                        Correct Answer *
                      </Label>
                      
                      {/* Special handling for True/False questions */}
                      {formData.type === 'true_false' ? (
                        <div className="space-y-3">
                          <RadioGroup 
                            value={formData.correctAnswer as string} 
                            onValueChange={(value) => updateFormDataField('correctAnswer', value)}
                            className="flex space-x-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="true" id="true-answer" />
                              <Label htmlFor="true-answer" className="cursor-pointer font-medium">
                                True
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="false" id="false-answer" />
                              <Label htmlFor="false-answer" className="cursor-pointer font-medium">
                                False
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                      ) : (
                        /* Regular text input for other question types */
                        multilingualMode ? (
                          <MultilingualTextarea
                            label="Correct Answer"
                            value={formData.correctAnswer as RequiredMultilingualText}
                            onChange={(value) => updateFormDataField('correctAnswer', value)}
                            placeholder="Enter the correct answer"
                            rows={2}
                            required
                          />
                        ) : (
                          <Textarea
                            value={formData.correctAnswer as string}
                            onChange={(e) => updateFormDataField('correctAnswer', e.target.value)}
                            placeholder="Enter the correct answer"
                            rows={2}
                            required
                          />
                        )
                      )}
                    </div>
                  )}

                  {/* Explanation */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      {multilingualMode && <Globe className="h-4 w-4" />}
                      {formData.type === 'short_essay' || formData.type === 'long_essay' 
                        ? 'Grading Rubric/Guidelines' 
                        : 'Explanation'
                      }
                    </Label>
                    {formData.type === 'short_essay' || formData.type === 'long_essay' ? (
                      // Rich text editor for essay explanations/rubrics
                      multilingualMode ? (
                        <MultilingualRichTextEditor
                          value={formData.explanationRichText as RequiredMultilingualText}
                          onChange={(value) => updateFormDataField('explanationRichText', value)}
                          placeholder="Enter grading guidelines, rubric, or example answer..."
                          minHeight="120px"
                          label=""
                        />
                      ) : (
                        <RichTextEditor
                          content={formData.explanationRichText as string}
                          onChange={(value) => updateFormDataField('explanationRichText', value)}
                          placeholder="Enter grading guidelines, rubric, or example answer..."
                          minHeight="120px"
                        />
                      )
                    ) : (
                      // Regular textarea for other question types
                      multilingualMode ? (
                        <MultilingualTextarea
                          label="Explanation"
                          value={formData.explanation as RequiredMultilingualText}
                          onChange={(value) => updateFormDataField('explanation', value)}
                          placeholder="Explain why this is the correct answer"
                          rows={3}
                        />
                      ) : (
                        <Textarea
                          value={formData.explanation as string}
                          onChange={(e) => updateFormDataField('explanation', e.target.value)}
                          placeholder="Explain why this is the correct answer"
                          rows={3}
                        />
                      )
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
                        value={formData.tags as RequiredMultilingualArray}
                        onChange={(value) => updateFormDataField('tags', value)}
                        placeholder="Add a tag"
                      />
                    ) : (
                      <div className="space-y-2">
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

                  {/* Additional Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Topic (Optional)</Label>
                      <Select 
                        value={formData.topicId || 'none'} 
                        onValueChange={(value) => updateFormDataField('topicId', value === 'none' ? undefined : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select topic" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Topic</SelectItem>
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
                        onChange={(e) => updateFormDataField('category', e.target.value)}
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
                            updateFormDataField('flags', {
                              ...formData.flags,
                              important: !!checked
                            })
                          }
                        />
                        <Label htmlFor="important" className="text-sm">Important</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="frequently_asked"
                          checked={formData.flags.frequently_asked}
                          onCheckedChange={(checked) => 
                            updateFormDataField('flags', {
                              ...formData.flags,
                              frequently_asked: !!checked
                            })
                          }
                        />
                        <Label htmlFor="frequently_asked" className="text-sm">Frequently Asked</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="practical"
                          checked={formData.flags.practical}
                          onCheckedChange={(checked) => 
                            updateFormDataField('flags', {
                              ...formData.flags,
                              practical: !!checked
                            })
                          }
                        />
                        <Label htmlFor="practical" className="text-sm">Practical</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="conceptual"
                          checked={formData.flags.conceptual}
                          onCheckedChange={(checked) => 
                            updateFormDataField('flags', {
                              ...formData.flags,
                              conceptual: !!checked
                            })
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
