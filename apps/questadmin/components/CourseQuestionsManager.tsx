'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
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
    BookOpen,
    Edit,
    Plus,
    Search,
    Star,
    Trash2
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface CourseQuestionsManagerProps {
  courseId: string
  courseName: string
}

interface QuestionFormData {
  question: string
  questionRichText?: string
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'short_essay' | 'long_essay'
  marks: number
  difficulty: 'easy' | 'medium' | 'hard'
  options: string[]
  correctAnswer: string
  explanation: string
  explanationRichText?: string
  tags: string[]
  topicId?: string
  flags: QuestionFlags
  category?: string
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

export function CourseQuestionsManager({ courseId, courseName }: CourseQuestionsManagerProps) {
  const { user } = useAuth()
  const [questions, setQuestions] = useState<CourseQuestion[]>([])
  const [topics, setTopics] = useState<AdminCourseTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<CourseQuestion | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
  const [filterTopic, setFilterTopic] = useState<string>('all')
  const [formData, setFormData] = useState<QuestionFormData>({
    question: '',
    type: 'multiple_choice',
    marks: 1,
    difficulty: 'easy',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    tags: [],
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
      const fetchedQuestions = await getCourseQuestions(courseId)
      setQuestions(fetchedQuestions)
    } catch (error) {
      console.error('Error loading questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTopics = async () => {
    try {
      const fetchedTopics = await getCourseTopics(courseId)
      setTopics(fetchedTopics)
    } catch (error) {
      console.error('Error loading topics:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const questionData: CreateCourseQuestionData = {
        ...formData,
        courseId,
        tags: formData.tags.filter(tag => tag.trim() !== ''),
        options: formData.type === 'multiple_choice' ? formData.options.filter(opt => opt.trim() !== '') : undefined,
        isPublished: false,
        order: questions.length,
        createdBy: user.uid
      }

      if (editingQuestion) {
        await updateCourseQuestion(editingQuestion.id!, questionData, user.uid)
      } else {
        await createCourseQuestion(questionData, user.uid)
      }

      await loadQuestions()
      resetForm()
    } catch (error) {
      console.error('Error saving question:', error)
    }
  }

  const handleEdit = (question: CourseQuestion) => {
    setEditingQuestion(question)
    setFormData({
      question: question.question,
      questionRichText: question.questionRichText,
      type: question.type,
      marks: question.marks,
      difficulty: question.difficulty,
      options: question.options || ['', '', '', ''],
      correctAnswer: Array.isArray(question.correctAnswer) 
        ? question.correctAnswer.join(', ') 
        : question.correctAnswer || '',
      explanation: question.explanation || '',
      explanationRichText: question.explanationRichText,
      tags: question.tags,
      topicId: question.topicId,
      flags: question.flags,
      category: question.category
    })
    setShowForm(true)
  }

  const handleDelete = async (questionId: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteCourseQuestion(questionId)
        await loadQuestions()
      } catch (error) {
        console.error('Error deleting question:', error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      question: '',
      type: 'multiple_choice',
      marks: 1,
      difficulty: 'easy',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      tags: [],
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

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = filterType === 'all' || question.type === filterType
    const matchesDifficulty = filterDifficulty === 'all' || question.difficulty === filterDifficulty
    const matchesTopic = filterTopic === 'all' || question.topicId === filterTopic

    return matchesSearch && matchesType && matchesDifficulty && matchesTopic
  })

  const getTypeIcon = (type: string) => {
    return QUESTION_TYPES.find(t => t.value === type)?.icon || '❓'
  }

  const getDifficultyColor = (difficulty: string) => {
    return DIFFICULTY_LEVELS.find(d => d.value === difficulty)?.color || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Questions & Answers</h1>
          <p className="text-muted-foreground">{courseName}</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions or tags..."
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
                  <SelectValue />
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
                  <SelectValue />
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
            <CardTitle>{editingQuestion ? 'Edit Question' : 'Add New Question'}</CardTitle>
            <CardDescription>
              Create comprehensive questions for your course
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Question Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Question Type *</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                  <Label htmlFor="marks">Marks *</Label>
                  <Select 
                    value={formData.marks.toString()} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, marks: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MARKS_OPTIONS.map(mark => (
                        <SelectItem key={mark} value={mark.toString()}>
                          {mark} mark{mark !== 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty *</Label>
                  <Select 
                    value={formData.difficulty} 
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, difficulty: value }))}
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
                <div className="space-y-2">
                  <Label htmlFor="topicId">Associated Topic (Optional)</Label>
                  <Select 
                    value={formData.topicId || 'none'} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, topicId: value === 'none' ? undefined : value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No specific topic</SelectItem>
                      {topics.map(topic => (
                        <SelectItem key={topic.id} value={topic.id!}>
                          {topic.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-2">
                <Label htmlFor="question">Question *</Label>
                <Textarea
                  id="question"
                  value={formData.question}
                  onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="Enter your question here..."
                  rows={3}
                  required
                />
              </div>

              {/* Multiple Choice Options */}
              {formData.type === 'multiple_choice' && (
                <div className="space-y-2">
                  <Label>Answer Options</Label>
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...formData.options]
                          newOptions[index] = e.target.value
                          setFormData(prev => ({ ...prev, options: newOptions }))
                        }}
                        placeholder={`Option ${index + 1}`}
                      />
                      {formData.options.length > 2 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newOptions = formData.options.filter((_, i) => i !== index)
                            setFormData(prev => ({ ...prev, options: newOptions }))
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, options: [...prev.options, ''] }))}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </div>
              )}

              {/* Correct Answer */}
              {(formData.type === 'multiple_choice' || formData.type === 'true_false' || formData.type === 'fill_blank') && (
                <div className="space-y-2">
                  <Label htmlFor="correctAnswer">Correct Answer</Label>
                  {formData.type === 'true_false' ? (
                    <Select 
                      value={formData.correctAnswer} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, correctAnswer: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select true or false" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">True</SelectItem>
                        <SelectItem value="false">False</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="correctAnswer"
                      value={formData.correctAnswer}
                      onChange={(e) => setFormData(prev => ({ ...prev, correctAnswer: e.target.value }))}
                      placeholder="Enter the correct answer"
                    />
                  )}
                </div>
              )}

              {/* Explanation */}
              <div className="space-y-2">
                <Label htmlFor="explanation">Explanation (Optional)</Label>
                <Textarea
                  id="explanation"
                  value={formData.explanation}
                  onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                  placeholder="Provide an explanation for the answer..."
                  rows={2}
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
                  }))}
                  placeholder="e.g., javascript, variables, functions"
                />
              </div>

              {/* Flags */}
              <div className="space-y-2">
                <Label>Question Flags</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(formData.flags).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={value as boolean}
                        onCheckedChange={(checked: boolean) => 
                          setFormData(prev => ({
                            ...prev,
                            flags: { ...prev.flags, [key]: checked }
                          }))
                        }
                      />
                      <Label htmlFor={key} className="text-sm capitalize">
                        {key.replace('_', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-6 border-t">
                <Button type="submit" className="flex-1">
                  {editingQuestion ? 'Update Question' : 'Add Question'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      <Card>
        <CardHeader>
          <CardTitle>Questions ({filteredQuestions.length})</CardTitle>
          <CardDescription>
            Manage your course questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No questions found. Add your first question!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((question, index) => (
                <div
                  key={question.id}
                  className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getTypeIcon(question.type)}</span>
                        <Badge className={getDifficultyColor(question.difficulty)}>
                          {question.difficulty}
                        </Badge>
                        <Badge variant="outline">
                          {question.marks} mark{question.marks !== 1 ? 's' : ''}
                        </Badge>
                        {question.flags.important && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                            <Star className="h-3 w-3 mr-1" />
                            Important
                          </Badge>
                        )}
                        {question.topicId && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {topics.find(t => t.id === question.topicId)?.title || 'Topic'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium mb-2">{question.question}</p>
                      {question.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {question.tags.map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {question.explanation && (
                        <p className="text-xs text-muted-foreground">
                          Explanation: {question.explanation.substring(0, 100)}...
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(question)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(question.id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
