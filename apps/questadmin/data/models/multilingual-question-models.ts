/**
 * Multilingual Question and Quiz Interfaces
 * 
 * This file extends the existing Question and Quiz interfaces from both
 * admin models and domain models to support multilingual content
 */

import {
    MultilingualArray,
    MultilingualText,
    RequiredMultilingualText,
    SupportedLanguage
} from '../../lib/multilingual-types';

import {
    isMultilingualContent
} from '../../lib/multilingual-utils';

// Import types from domain models
import {
    AnswerOption,
    DifficultyLevel,
    QuestionType,
    RichTextFormat
} from '../../../../packages/questdata/src/domain/models';

// Import types from admin data models  
import {
    QuestionFlags as AdminQuestionFlags
} from './data-models';

// ================================
// MULTILINGUAL DOMAIN QUESTION
// ================================

/**
 * Multilingual version of the domain Question interface
 */
export interface MultilingualQuestion {
  id?: string
  courseId: string
  topicId?: string
  questionBankId?: string
  type: QuestionType
  difficulty: DifficultyLevel
  
  // Multilingual content fields
  title: RequiredMultilingualText
  description?: MultilingualText
  question: RequiredMultilingualText
  correctAnswer?: MultilingualText
  explanation?: MultilingualText
  hints?: MultilingualArray
  
  // Non-multilingual fields
  points: number
  timeLimit?: number // in seconds
  
  // For multiple choice, true/false, matching - options can have multilingual text
  options?: MultilingualAnswerOption[]
  
  // For short answer, essay, fill in blank
  sampleAnswers?: MultilingualArray
  
  // For essay questions - enhanced rich format support
  essayConfig?: {
    allowRichText: boolean
    allowedFormats: RichTextFormat[]
    allowAttachments: boolean
    allowedAttachmentTypes: ('image' | 'video' | 'audio' | 'document' | 'link')[]
    maxWordCount?: number
    minWordCount?: number
    maxFileSize?: number // in bytes
    maxAttachments?: number
    gradingRubric?: {
      id: string
      name: RequiredMultilingualText
      criteria: {
        id: string
        name: RequiredMultilingualText
        description: RequiredMultilingualText
        maxPoints: number
        levels: {
          score: number
          description: RequiredMultilingualText
        }[]
      }[]
    }
  }
  
  // For matching questions
  matchingPairs?: {
    left: RequiredMultilingualText
    right: RequiredMultilingualText
  }[]
  
  // For ordering questions
  correctOrder?: string[] // Keep as IDs, but display names would be multilingual
  
  tags?: string[] // Keep tags as language-neutral IDs
  
  // Usage statistics
  timesUsed?: number
  averageScore?: number
  
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Multilingual Answer Option for multiple choice questions
 */
export interface MultilingualAnswerOption {
  id: string
  text: RequiredMultilingualText
  isCorrect: boolean
  explanation?: MultilingualText
}

// ================================
// MULTILINGUAL ADMIN QUIZ QUESTION
// ================================

/**
 * Multilingual version of the admin QuizQuestion interface
 */
export interface MultilingualAdminQuizQuestion {
  id: string
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'short_essay' | 'long_essay'
  
  // Multilingual content fields
  question: RequiredMultilingualText
  questionRichText?: MultilingualText // For rich text questions
  explanation?: MultilingualText
  explanationRichText?: MultilingualText // For rich text explanations
  
  // Options for multiple choice (multilingual)
  options?: RequiredMultilingualText[] // for multiple choice
  
  // Correct answer can be multilingual for some question types
  correctAnswer: string | string[] // Keep as-is for now, might need multilingual support later
  
  // Non-multilingual fields
  marks: number // Changed from points to marks for clarity
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
  topicId?: string // Optional reference to course topic
  flags: QuestionFlags
  createdBy: string
  courseId: string
}

// ================================
// MULTILINGUAL ADMIN COURSE QUESTION
// ================================

/**
 * Multilingual version of the admin CourseQuestion interface
 */
export interface MultilingualAdminCourseQuestion {
  id?: string
  courseId: string
  topicId?: string // Optional reference to course topic
  
  // Multilingual content fields
  question: RequiredMultilingualText
  questionRichText?: MultilingualText // For rich text questions
  explanation?: MultilingualText
  explanationRichText?: MultilingualText // For rich text explanations
  
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'short_essay' | 'long_essay'
  marks: number
  difficulty: 'easy' | 'medium' | 'hard'
  
  // Options for multiple choice questions (multilingual)
  options?: RequiredMultilingualText[] // For multiple choice questions
  
  correctAnswer?: string | string[] // Optional for essay questions
  tags: string[]
  flags: AdminQuestionFlags
  isPublished: boolean
  order: number // For organizing questions within a course
  createdBy: string
  lastModifiedBy?: string
  category?: string // Additional categorization
  createdAt?: Date
  updatedAt?: Date
}

// ================================
// MULTILINGUAL QUIZ INTERFACES
// ================================

/**
 * Multilingual version of the admin Quiz interface
 */
export interface MultilingualAdminQuiz {
  id?: string
  courseId: string
  topicId?: string
  
  // Multilingual content fields
  title: RequiredMultilingualText
  description?: MultilingualText
  instructions: RequiredMultilingualText
  
  // Questions can be multilingual
  questions: MultilingualAdminQuizQuestion[]
  
  // Non-multilingual fields
  timeLimit?: number // in minutes
  attemptsAllowed: number
  passingScore: number
  showCorrectAnswers: boolean
  randomizeQuestions: boolean
  randomizeAnswers: boolean
  isPublished: boolean
  dueDate?: Date
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Multilingual version of the domain Quiz interface
 */
export interface MultilingualDomainQuiz {
  id?: string
  courseId: string
  topicId?: string
  
  // Multilingual content fields
  title: RequiredMultilingualText
  description?: MultilingualText
  instructions?: MultilingualText
  
  // Quiz configuration (non-multilingual)
  totalQuestions: number
  timeLimit?: number // in minutes
  attemptsAllowed: number
  passingScore: number // percentage
  shuffleQuestions: boolean
  shuffleAnswers: boolean
  showResultsImmediately: boolean
  
  // Question selection (non-multilingual)
  questionIds?: string[] // specific questions
  questionBankId?: string // or from question bank
  questionSelection?: {
    [key in DifficultyLevel]?: number // number of questions per difficulty
  }
  
  isPublished: boolean
  createdAt?: Date
  updatedAt?: Date
}

// ================================
// HYBRID INTERFACES (FOR MIGRATION)
// ================================

/**
 * Hybrid Question interface that supports both legacy and multilingual content
 */
export interface HybridQuestion {
  id?: string
  courseId: string
  topicId?: string
  questionBankId?: string
  type: QuestionType
  difficulty: DifficultyLevel
  
  // Fields that can be either legacy string or multilingual
  title: string | RequiredMultilingualText
  description?: string | MultilingualText
  question: string | RequiredMultilingualText
  correctAnswer?: string | MultilingualText
  explanation?: string | MultilingualText
  hints?: string[] | MultilingualArray
  
  // Rest of the fields remain the same...
  points: number
  timeLimit?: number
  options?: (AnswerOption | MultilingualAnswerOption)[]
  sampleAnswers?: string[] | MultilingualArray
  tags?: string[]
  timesUsed?: number
  averageScore?: number
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Hybrid Quiz interface that supports both legacy and multilingual content
 */
export interface HybridQuiz {
  id?: string
  courseId: string
  topicId?: string
  
  // Fields that can be either legacy string or multilingual
  title: string | RequiredMultilingualText
  description?: string | MultilingualText
  instructions?: string | MultilingualText
  
  // Rest of the fields remain the same...
  totalQuestions: number
  timeLimit?: number
  attemptsAllowed: number
  passingScore: number
  shuffleQuestions: boolean
  shuffleAnswers: boolean
  showResultsImmediately: boolean
  questionIds?: string[]
  questionBankId?: string
  questionSelection?: {
    [key in DifficultyLevel]?: number
  }
  isPublished: boolean
  createdAt?: Date
  updatedAt?: Date
}

// ================================
// HYBRID QUESTION INTERFACES
// ================================

/**
 * Hybrid CourseQuestion interface that supports both legacy string and multilingual content
 * This ensures backward compatibility while enabling multilingual features
 */
export interface HybridAdminCourseQuestion {
  id?: string
  courseId: string
  topicId?: string // Optional reference to course topic
  
  // Hybrid content fields that can be either string or multilingual
  question: RequiredMultilingualText | string
  questionRichText?: MultilingualText | string // For rich text questions
  explanation?: MultilingualText | string
  explanationRichText?: MultilingualText | string // For rich text explanations
  
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'short_essay' | 'long_essay'
  marks: number
  difficulty: 'easy' | 'medium' | 'hard'
  
  // Hybrid options that can be either string array or multilingual array
  options?: MultilingualArray | string[] // For multiple choice questions
  
  // Hybrid correct answer
  correctAnswer?: MultilingualText | string | string[] // Optional for essay questions
  
  // Hybrid tags
  tags: MultilingualArray | string[]
  
  flags: AdminQuestionFlags
  isPublished: boolean
  order: number // For organizing questions within a course
  createdBy: string
  lastModifiedBy?: string
  category?: string // Additional categorization
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Creation data for hybrid course questions
 */
export type CreateHybridCourseQuestionData = Omit<HybridAdminCourseQuestion, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'lastModifiedBy'>

/**
 * Update data for hybrid course questions
 */
export type UpdateHybridCourseQuestionData = Partial<CreateHybridCourseQuestionData>

// ================================
// UTILITY FUNCTIONS
// ================================

/**
 * Get all available languages from a question object
 */
export function getQuestionLanguages(question: HybridAdminCourseQuestion): SupportedLanguage[] {
  const languages = new Set<SupportedLanguage>();
  
  // Check question text
  if (isMultilingualContent(question.question)) {
    Object.keys(question.question as Record<string, string>).forEach(lang => {
      languages.add(lang as SupportedLanguage);
    });
  } else {
    languages.add('en' as SupportedLanguage);
  }
  
  // Check explanation text
  if (question.explanation && isMultilingualContent(question.explanation)) {
    Object.keys(question.explanation as Record<string, string>).forEach(lang => {
      languages.add(lang as SupportedLanguage);
    });
  }
  
  // Check options
  if (question.options && isMultilingualContent(question.options)) {
    Object.keys(question.options as Record<string, string[]>).forEach(lang => {
      languages.add(lang as SupportedLanguage);
    });
  }
  
  // Check correct answer
  if (question.correctAnswer && isMultilingualContent(question.correctAnswer)) {
    Object.keys(question.correctAnswer as Record<string, string>).forEach(lang => {
      languages.add(lang as SupportedLanguage);
    });
  }
  
  // Check tags
  if (question.tags && isMultilingualContent(question.tags)) {
    Object.keys(question.tags as Record<string, string[]>).forEach(lang => {
      languages.add(lang as SupportedLanguage);
    });
  }
  
  return Array.from(languages);
}

/**
 * Analyze the multilingual content of a question
 */
export interface QuestionMultilingualAnalysis {
  isMultilingual: boolean;
  availableLanguages: SupportedLanguage[];
  completeness: Partial<Record<SupportedLanguage, {
    hasQuestion: boolean;
    hasExplanation: boolean;
    hasOptions: boolean;
    hasCorrectAnswer: boolean;
    hasTags: boolean;
    completionPercentage: number;
  }>>;
  translationGaps: {
    language: SupportedLanguage;
    missingFields: string[];
  }[];
}

/**
 * Analyze multilingual content completeness for a question
 */
export function analyzeQuestionMultilingualContent(question: HybridAdminCourseQuestion): QuestionMultilingualAnalysis {
  const languages = getQuestionLanguages(question);
  const isMultilingual = languages.length > 1;
  
  const completeness: Partial<Record<SupportedLanguage, any>> = {};
  const translationGaps: { language: SupportedLanguage; missingFields: string[] }[] = [];
  
  languages.forEach(lang => {
    const analysis = {
      hasQuestion: false,
      hasExplanation: false,
      hasOptions: false,
      hasCorrectAnswer: false,
      hasTags: false,
      completionPercentage: 0
    };
    
    // Check question text
    if (isMultilingualContent(question.question)) {
      analysis.hasQuestion = !!(question.question as Record<string, string>)[lang];
    } else {
      analysis.hasQuestion = lang === 'en';
    }
    
    // Check explanation
    if (question.explanation) {
      if (isMultilingualContent(question.explanation)) {
        analysis.hasExplanation = !!(question.explanation as Record<string, string>)[lang];
      } else {
        analysis.hasExplanation = lang === 'en';
      }
    } else {
      analysis.hasExplanation = true; // Optional field
    }
    
    // Check options
    if (question.options) {
      if (isMultilingualContent(question.options)) {
        analysis.hasOptions = !!(question.options as Record<string, string[]>)[lang];
      } else {
        analysis.hasOptions = lang === 'en';
      }
    } else {
      analysis.hasOptions = true; // Optional field
    }
    
    // Check correct answer
    if (question.correctAnswer) {
      if (isMultilingualContent(question.correctAnswer)) {
        analysis.hasCorrectAnswer = !!(question.correctAnswer as Record<string, string>)[lang];
      } else {
        analysis.hasCorrectAnswer = lang === 'en';
      }
    } else {
      analysis.hasCorrectAnswer = true; // Optional field
    }
    
    // Check tags
    if (isMultilingualContent(question.tags)) {
      analysis.hasTags = !!(question.tags as Record<string, string[]>)[lang];
    } else {
      analysis.hasTags = lang === 'en';
    }
    
    // Calculate completion percentage
    const fields = [analysis.hasQuestion, analysis.hasExplanation, analysis.hasOptions, analysis.hasCorrectAnswer, analysis.hasTags];
    analysis.completionPercentage = Math.round((fields.filter(Boolean).length / fields.length) * 100);
    
    completeness[lang] = analysis;
    
    // Track translation gaps
    const missingFields: string[] = [];
    if (!analysis.hasQuestion) missingFields.push('question');
    if (!analysis.hasExplanation && question.explanation) missingFields.push('explanation');
    if (!analysis.hasOptions && question.options) missingFields.push('options');
    if (!analysis.hasCorrectAnswer && question.correctAnswer) missingFields.push('correctAnswer');
    if (!analysis.hasTags) missingFields.push('tags');
    
    if (missingFields.length > 0) {
      translationGaps.push({ language: lang, missingFields });
    }
  });
  
  return {
    isMultilingual,
    availableLanguages: languages,
    completeness,
    translationGaps
  };
}

// ================================
// IMPORT QUESTION FLAGS
// ================================

// Re-use the QuestionFlags interface from the existing models
interface QuestionFlags {
  important: boolean
  frequently_asked: boolean
  practical: boolean
  conceptual: boolean
  custom_flags?: string[]
}

// ================================
// TYPE GUARDS
// ================================

/**
 * Type guard to check if an admin course question is using multilingual format
 */
export function isMultilingualAdminCourseQuestion(question: HybridAdminCourseQuestion): boolean {
  return typeof question.question === 'object' && question.question !== null;
}

/**
 * Type guard to check if a question is using multilingual format
 */
export function isMultilingualQuestion(question: HybridQuestion): question is MultilingualQuestion {
  return typeof question.title === 'object' && question.title !== null;
}

/**
 * Type guard to check if a quiz is using multilingual format
 */
export function isMultilingualQuiz(quiz: HybridQuiz): quiz is MultilingualDomainQuiz {
  return typeof quiz.title === 'object' && quiz.title !== null;
}

/**
 * Type guard to check if an answer option is using multilingual format
 */
export function isMultilingualAnswerOption(option: AnswerOption | MultilingualAnswerOption): option is MultilingualAnswerOption {
  return typeof (option as MultilingualAnswerOption).text === 'object';
}

// ================================
// FIELD DEFINITIONS FOR VALIDATION
// ================================

/**
 * Fields that should be multilingual in questions
 */
export const QUESTION_MULTILINGUAL_TEXT_FIELDS = [
  'title',
  'description',
  'question',
  'correctAnswer',
  'explanation'
] as const;

export const QUESTION_MULTILINGUAL_ARRAY_FIELDS = [
  'hints',
  'sampleAnswers'
] as const;

/**
 * Fields that should be multilingual in quizzes
 */
export const QUIZ_MULTILINGUAL_TEXT_FIELDS = [
  'title',
  'description',
  'instructions'
] as const;

// ================================
