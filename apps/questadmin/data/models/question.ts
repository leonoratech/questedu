import { BaseEntity } from './basemodel';

// Question data models and interfaces

export interface Question extends BaseEntity {
  courseId: string
  topicId?: string
  questionText: string
  questionRichText?: string
  questionType: 'multiple_choice' | 'true_false' | 'short_essay' | 'long_essay' | 'fill_blank'
  options?: {
    text: string
    isCorrect: boolean
    explanation?: string
  }[]
  correctAnswer?: string
  correctAnswerRichText?: string
  explanation?: string // Now always plain text
  difficulty: 'easy' | 'medium' | 'hard'
  marks: number
  tags: string[]
  flags: QuestionFlags
  isPublished: boolean
  order: number
}


export interface QuestionFlags {
  important: boolean
  frequently_asked: boolean
  previous_year: boolean    
  marked_for_test: boolean  
}