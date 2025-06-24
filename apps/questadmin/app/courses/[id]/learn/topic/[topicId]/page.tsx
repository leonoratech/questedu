'use client'

import { AuthGuard } from '@/components/AuthGuard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/data/config/firebase-auth'
import { getCourseTopics } from '@/data/services/admin-course-service'
import { getCourseQuestions } from '@/data/services/course-questions-service'
import { getUserEnrollments } from '@/data/services/enrollment-service'
import { DEFAULT_LANGUAGE } from '@/lib/multilingual-types'
import { getCompatibleArray, getCompatibleText } from '@/lib/multilingual-utils'
import {
    ArrowLeft,
    Award,
    BookOpen,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    Download,
    ExternalLink,
    FileText,
    Link as LinkIcon,
    Play,
    Star,
    Target,
    Video
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface TopicLearnPageProps {
  params: Promise<{ id: string; topicId: string }>
}

interface TopicData {
  id: string
  title: string
  description?: string
  order: number
  duration?: number
  videoUrl?: string
  materials: Array<{
    type: 'pdf' | 'video' | 'audio' | 'document' | 'link'
    title: string
    url: string
    description?: string
  }>
  learningObjectives: string[]
}

interface QuestionData {
  id: string
  question: string
  type: 'multiple_choice' | 'true_false' | 'short_essay' | 'fill_blank' | 'long_essay'
  options?: string[]
  correctAnswer: string
  explanation?: string
  marks: number
  difficulty: 'easy' | 'medium' | 'hard'
}

interface WizardStep {
  id: string
  type: 'intro' | 'content' | 'question' | 'summary'
  title: string
  data?: any
}

type AnswerData = {
  questionId: string
  answer: string
  isCorrect?: boolean
  timeSpent: number
}

export default function TopicLearnPage({ params }: TopicLearnPageProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [courseId, setCourseId] = useState<string>('')
  const [topicId, setTopicId] = useState<string>('')
  const [topic, setTopic] = useState<TopicData | null>(null)
  const [questions, setQuestions] = useState<QuestionData[]>([])
  const [wizardSteps, setWizardSteps] = useState<WizardStep[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [answers, setAnswers] = useState<Map<string, AnswerData>>(new Map())
  const [currentAnswer, setCurrentAnswer] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stepStartTime, setStepStartTime] = useState<number>(Date.now())
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setCourseId(resolvedParams.id)
      setTopicId(resolvedParams.topicId)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (courseId && topicId) {
      loadTopicData()
    }
  }, [courseId, topicId, user])

  useEffect(() => {
    setStepStartTime(Date.now())
    setCurrentAnswer('')
  }, [currentStepIndex])

  const loadTopicData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Verify user is enrolled
      const enrollments = await getUserEnrollments()
      const enrollment = enrollments.find(e => e.courseId === courseId)
      if (!enrollment) {
        throw new Error('You are not enrolled in this course')
      }

      // Load topic details
      const topics = await getCourseTopics(courseId)
      const topicData = topics.find(t => t.id === topicId)
      if (!topicData) {
        throw new Error('Topic not found')
      }

      // Transform topic data
      const learningTopic: TopicData = {
        id: topicData.id!,
        title: typeof topicData.title === 'string' 
          ? topicData.title 
          : getCompatibleText(topicData.title, DEFAULT_LANGUAGE),
        description: typeof topicData.description === 'string' 
          ? topicData.description 
          : getCompatibleText(topicData.description, DEFAULT_LANGUAGE),
        order: topicData.order,
        duration: topicData.duration,
        videoUrl: topicData.videoUrl,
        materials: topicData.materials || [],
        learningObjectives: Array.isArray(topicData.learningObjectives) 
          ? topicData.learningObjectives 
          : getCompatibleArray(topicData.learningObjectives, DEFAULT_LANGUAGE) || []
      }
      setTopic(learningTopic)

      // Load questions for this topic
      const questionsData = await getCourseQuestions(courseId)
      const topicQuestions = questionsData
        .filter(q => q.topicId === topicId)
        .map(q => ({
          id: q.id!,
          question: typeof q.question === 'string' 
            ? q.question 
            : getCompatibleText(q.question, DEFAULT_LANGUAGE),
          type: q.type,
          options: q.options ? (Array.isArray(q.options) 
            ? q.options 
            : getCompatibleArray(q.options, DEFAULT_LANGUAGE)) : undefined,
          correctAnswer: Array.isArray(q.correctAnswer)
            ? q.correctAnswer.join(', ')
            : typeof q.correctAnswer === 'string' 
              ? q.correctAnswer 
              : q.correctAnswer 
                ? getCompatibleText(q.correctAnswer, DEFAULT_LANGUAGE)
                : '',
          explanation: q.explanation ? (typeof q.explanation === 'string' 
            ? q.explanation 
            : getCompatibleText(q.explanation, DEFAULT_LANGUAGE)) : undefined,
          marks: q.marks,
          difficulty: q.difficulty
        }))
      
      setQuestions(topicQuestions)

      // Build wizard steps
      const steps: WizardStep[] = [
        // Introduction step
        {
          id: 'intro',
          type: 'intro',
          title: 'Topic Introduction',
          data: learningTopic
        },
        // Content step
        {
          id: 'content',
          type: 'content',
          title: 'Learning Materials',
          data: learningTopic
        },
        // Question steps
        ...topicQuestions.map((question, index) => ({
          id: `question-${question.id}`,
          type: 'question' as const,
          title: `Question ${index + 1}`,
          data: question
        })),
        // Summary step
        {
          id: 'summary',
          type: 'summary',
          title: 'Topic Complete',
          data: { topic: learningTopic, questions: topicQuestions }
        }
      ]

      setWizardSteps(steps)

    } catch (err) {
      console.error('Error loading topic data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load topic')
      toast.error('Failed to load topic data')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (value: string) => {
    setCurrentAnswer(value)
  }

  const handleNextStep = () => {
    const currentStep = wizardSteps[currentStepIndex]
    
    // Save answer if it's a question step
    if (currentStep.type === 'question' && currentAnswer) {
      const question = currentStep.data as QuestionData
      const timeSpent = Date.now() - stepStartTime
      const isCorrect = currentAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()
      
      setAnswers(prev => new Map(prev.set(question.id, {
        questionId: question.id,
        answer: currentAnswer,
        isCorrect,
        timeSpent
      })))
      
      if (isCorrect) {
        toast.success('Correct answer!')
      } else {
        toast.error('Incorrect answer. Check the explanation.')
      }
    }

    if (currentStepIndex < wizardSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1)
    }
  }

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
      // Restore previous answer if going back to a question
      const step = wizardSteps[currentStepIndex - 1]
      if (step.type === 'question') {
        const questionId = step.data.id
        const previousAnswer = answers.get(questionId)
        setCurrentAnswer(previousAnswer?.answer || '')
      }
    }
  }

  const handleFinishTopic = () => {
    // Calculate results
    const totalQuestions = questions.length
    const correctAnswers = Array.from(answers.values()).filter(a => a.isCorrect).length
    const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 100
    
    toast.success(`Topic completed! Score: ${score.toFixed(0)}%`)
    
    // Navigate back to course learning page
    router.push(`/courses/${courseId}/learn`)
  }

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />
      case 'pdf': return <FileText className="h-4 w-4" />
      case 'document': return <FileText className="h-4 w-4" />
      case 'audio': return <Play className="h-4 w-4" />
      case 'link': return <LinkIcon className="h-4 w-4" />
      default: return <Download className="h-4 w-4" />
    }
  }

  const renderStepContent = () => {
    const currentStep = wizardSteps[currentStepIndex]
    if (!currentStep) return null

    switch (currentStep.type) {
      case 'intro':
        return renderIntroStep(currentStep.data)
      case 'content':
        return renderContentStep(currentStep.data)
      case 'question':
        return renderQuestionStep(currentStep.data)
      case 'summary':
        return renderSummaryStep(currentStep.data)
      default:
        return null
    }
  }

  const renderIntroStep = (topicData: TopicData) => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
          <BookOpen className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold">{topicData.title}</h2>
        {topicData.description && (
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {topicData.description}
          </p>
        )}
      </div>

      {topicData.learningObjectives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Learning Objectives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {topicData.learningObjectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        {topicData.duration && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
            <div className="font-medium">{topicData.duration} minutes</div>
            <div className="text-sm text-muted-foreground">Duration</div>
          </div>
        )}
        <div className="p-4 bg-muted/50 rounded-lg">
          <BookOpen className="h-6 w-6 text-primary mx-auto mb-2" />
          <div className="font-medium">{topicData.materials.length}</div>
          <div className="text-sm text-muted-foreground">Materials</div>
        </div>
        <div className="p-4 bg-muted/50 rounded-lg">
          <Target className="h-6 w-6 text-primary mx-auto mb-2" />
          <div className="font-medium">{questions.length}</div>
          <div className="text-sm text-muted-foreground">Questions</div>
        </div>
      </div>
    </div>
  )

  const renderContentStep = (topicData: TopicData) => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Learning Materials</h2>
        <p className="text-muted-foreground">
          Review these materials before answering the questions
        </p>
      </div>

      {topicData.videoUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-red-600" />
              Main Video
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-muted-foreground">Video Player</p>
                <p className="text-sm text-muted-foreground">
                  In a real implementation, this would show the video player
                </p>
              </div>
            </div>
            <Button asChild className="w-full">
              <a href={topicData.videoUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Video in New Tab
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {topicData.materials.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-600" />
              Additional Materials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topicData.materials.map((material, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getMaterialIcon(material.type)}
                    <div>
                      <div className="font-medium">{material.title}</div>
                      {material.description && (
                        <div className="text-sm text-muted-foreground">{material.description}</div>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={material.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Open
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {topicData.materials.length === 0 && !topicData.videoUrl && (
        <Card>
          <CardContent className="text-center py-8">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No Additional Materials</h3>
            <p className="text-muted-foreground">
              This topic doesn't have additional materials. You can proceed to the questions.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderQuestionStep = (questionData: QuestionData) => {
    const savedAnswer = answers.get(questionData.id)
    const showExplanation = savedAnswer && currentAnswer

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Badge variant={questionData.difficulty === 'easy' ? 'secondary' : 
                           questionData.difficulty === 'medium' ? 'default' : 'destructive'}>
              {questionData.difficulty}
            </Badge>
            <Badge variant="outline">{questionData.marks} marks</Badge>
          </div>
          <h2 className="text-xl font-bold mb-4">{questionData.question}</h2>
        </div>

        <Card>
          <CardContent className="p-6">
            {questionData.type === 'multiple_choice' && questionData.options && (
              <RadioGroup value={currentAnswer} onValueChange={handleAnswerChange}>
                <div className="space-y-3">
                  {questionData.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}

            {questionData.type === 'true_false' && (
              <RadioGroup value={currentAnswer} onValueChange={handleAnswerChange}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="true" />
                    <Label htmlFor="true" className="cursor-pointer">True</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="false" />
                    <Label htmlFor="false" className="cursor-pointer">False</Label>
                  </div>
                </div>
              </RadioGroup>
            )}

            {questionData.type === 'short_essay' && (
              <div className="space-y-2">
                <Label htmlFor="essay-answer">Your Answer:</Label>
                <Textarea
                  id="essay-answer"
                  value={currentAnswer}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Type your answer here..."
                  rows={4}
                />
              </div>
            )}

            {questionData.type === 'fill_blank' && (
              <div className="space-y-2">
                <Label htmlFor="blank-answer">Fill in the blank:</Label>
                <input
                  id="blank-answer"
                  type="text"
                  value={currentAnswer}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Your answer..."
                  className="w-full px-3 py-2 border border-input rounded-md"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Show explanation after answering */}
        {showExplanation && questionData.explanation && (
          <Card className={`border-2 ${savedAnswer?.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <CardHeader>
              <CardTitle className={`text-lg flex items-center gap-2 ${savedAnswer?.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                {savedAnswer?.isCorrect ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Correct!
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-5 w-5" />
                    Incorrect
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={savedAnswer?.isCorrect ? 'text-green-700' : 'text-red-700'}>
                <strong>Correct Answer:</strong> {questionData.correctAnswer}
              </p>
              <p className={`mt-2 ${savedAnswer?.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                <strong>Explanation:</strong> {questionData.explanation}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  const renderSummaryStep = (data: { topic: TopicData; questions: QuestionData[] }) => {
    const totalQuestions = data.questions.length
    const answeredQuestions = answers.size
    const correctAnswers = Array.from(answers.values()).filter(a => a.isCorrect).length
    const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 100

    return (
      <div className="space-y-6 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Award className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold">Topic Completed!</h2>
          <p className="text-muted-foreground text-lg">
            Great job completing "{data.topic.title}"
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{score.toFixed(0)}%</div>
                <div className="text-sm text-muted-foreground">Final Score</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{correctAnswers}</div>
                <div className="text-sm text-muted-foreground">Correct Answers</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{totalQuestions}</div>
                <div className="text-sm text-muted-foreground">Total Questions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {score >= 80 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-6 text-center">
              <Star className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="font-semibold text-yellow-800 mb-2">Excellent Work!</h3>
              <p className="text-yellow-700">
                You achieved an excellent score! You've mastered this topic.
              </p>
            </CardContent>
          </Card>
        )}

        <Button onClick={handleFinishTopic} size="lg" className="w-full sm:w-auto">
          Continue to Next Topic
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <AuthGuard requiredRole={UserRole.STUDENT}>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading topic...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (error || !topic) {
    return (
      <AuthGuard requiredRole={UserRole.STUDENT}>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Topic</h3>
                <p className="text-red-600 mb-4">{error || 'Topic not found'}</p>
                <Button variant="outline" onClick={() => router.back()}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AuthGuard>
    )
  }

  const currentStep = wizardSteps[currentStepIndex]
  const progress = ((currentStepIndex + 1) / wizardSteps.length) * 100
  const canProceed = currentStep?.type !== 'question' || currentAnswer.trim() !== ''

  return (
    <AuthGuard requiredRole={UserRole.STUDENT}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/courses/${courseId}/learn`)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Course
                </Button>
                <div>
                  <h1 className="font-semibold">{topic.title}</h1>
                  <p className="text-sm text-muted-foreground">
                    {currentStep?.title} • Step {currentStepIndex + 1} of {wizardSteps.length}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{progress.toFixed(0)}% Complete</div>
                <Progress value={progress} className="w-48 mt-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="min-h-[600px]">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePreviousStep}
              disabled={currentStepIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {wizardSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index <= currentStepIndex ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {currentStepIndex < wizardSteps.length - 1 ? (
              <Button
                onClick={handleNextStep}
                disabled={!canProceed}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleFinishTopic}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Topic
              </Button>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
