// Question data models and interfaces

export interface Question {
  id: string
  courseId: string
  topicId?: string
  questionText: string
  questionType: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'fill_blank'
  options?: {
    text: string
    isCorrect: boolean
    explanation?: string
  }[]
  correctAnswer?: string
  explanation?: string
  difficulty: 'easy' | 'medium' | 'hard'
  marks: number
  tags: string[]
  flags: {
    important: boolean
    frequently_asked: boolean
    practical: boolean
    conceptual: boolean
  }
  isPublished: boolean
  order: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateQuestionRequest {
  courseId: string
  topicId?: string
  questionText: string
  questionType: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'fill_blank'
  options?: {
    text: string
    isCorrect: boolean
    explanation?: string
  }[]
  correctAnswer?: string
  explanation?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  marks?: number
  tags?: string[]
  flags?: {
    important?: boolean
    frequently_asked?: boolean
    practical?: boolean
    conceptual?: boolean
  }
  isPublished?: boolean
  order?: number
}

export interface UpdateQuestionRequest {
  questionText?: string
  questionType?: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'fill_blank'
  options?: {
    text: string
    isCorrect: boolean
    explanation?: string
  }[]
  correctAnswer?: string
  explanation?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  marks?: number
  tags?: string[]
  flags?: {
    important?: boolean
    frequently_asked?: boolean
    practical?: boolean
    conceptual?: boolean
  }
  isPublished?: boolean
  order?: number
}

export interface QuestionStats {
  totalQuestions: number
  publishedQuestions: number
  draftQuestions: number
  questionsByDifficulty: {
    easy: number
    medium: number
    hard: number
  }
  questionsByType: {
    multiple_choice: number
    true_false: number
    short_answer: number
    essay: number
    fill_blank: number
  }
  totalMarks: number
  averageMarks: number
  flaggedQuestions: {
    important: number
    frequently_asked: number
    practical: number
    conceptual: number
  }
}
