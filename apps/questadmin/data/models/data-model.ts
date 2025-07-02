/**
 * Unified Data Models for QuestEdu Admin Application
 * 
 * This file contains all TypeScript interfaces and types for the Firebase collections
 * Used by the questadmin app for strong typing and data validation
 * 
 * Merged from: data-models.ts, multilingual-admin-models.ts, multilingual-question-models.ts
 */


import * as admin from 'firebase-admin';
//import { Timestamp } from 'firebase-admin/firestore';

//import { Timestamp } from 'firebase/firestore';
import {
  MultilingualArray,
  MultilingualText,
  RequiredMultilingualArray,
  RequiredMultilingualText,
  SupportedLanguage
} from '../../lib/multilingual-types';
import {
  isMultilingualContent
} from '../../lib/multilingual-utils';

// Re-export original interfaces for backward compatibility
export type {
  AdminCourse as LegacyAdminCourse,
  AdminCourseTopic as LegacyAdminCourseTopic,
  CreateCourseData as LegacyCreateCourseData,
  CreateCourseTopicData as LegacyCreateCourseTopicData
} from '../services/admin-course-service';

// ================================
// CORE ENUMS
// ================================

export enum UserRole {
  INSTRUCTOR = 'instructor',
  STUDENT = 'student'
}

export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  UNDER_REVIEW = 'under_review'
}

export enum CourseLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced'
}

export enum MaterialType {
  PDF = 'pdf',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  LINK = 'link',
  PRESENTATION = 'presentation'
}

export enum AssignmentType {
  QUIZ = 'quiz',
  ESSAY = 'essay',
  PROJECT = 'project',
  DISCUSSION = 'discussion'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  TRIAL = 'trial'
}

export enum EnrollmentStatus {
  ENROLLED = 'enrolled',
  COMPLETED = 'completed',
  DROPPED = 'dropped',
  PENDING = 'pending'
}

export enum NotificationType {
  COURSE_UPDATE = 'course_update',
  ASSIGNMENT_DUE = 'assignment_due',
  GRADE_AVAILABLE = 'grade_available',
  ANNOUNCEMENT = 'announcement',
  SYSTEM = 'system'
}

// ================================
// QUESTION & QUIZ ENUMS
// ================================

/**
 * Question types enumeration
 */
export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
  ESSAY = 'essay',
  FILL_IN_BLANK = 'fill_in_blank',
  MATCHING = 'matching',
  ORDERING = 'ordering'
}

/**
 * Question difficulty levels
 */
export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

/**
 * Rich text format types for essay answers
 */
export enum RichTextFormat {
  PLAIN_TEXT = 'plain_text',
  HTML = 'html',
  MARKDOWN = 'markdown',
  DELTA = 'delta' // Quill.js Delta format
}

// ================================
// BASE INTERFACES
// ================================

export interface BaseTimestamps {
  createdAt?: admin.firestore.Timestamp | Date
  updatedAt?: admin.firestore.Timestamp | Date
  createdBy?: string // User ID of the creator
  updatedBy?: string // User ID of the last updater
}

export interface BaseEntity extends BaseTimestamps {
  id?: string
}

// ================================
// USER MODELS
// ================================

export interface User extends BaseEntity {
  email: string
  firstName: string
  lastName: string
  displayName?: string
  role: UserRole
  profilePicture?: string
  bio?: string
  department?: string
  phoneNumber?: string
  dateOfBirth?: Date
  isActive: boolean
  isEmailVerified: boolean
  lastLoginAt?: Date
  preferences: UserPreferences
  socialLinks?: SocialLinks
  expertise?: string[]
  location?: string
  timezone?: string
}

export interface UserPreferences {
  language: string
  theme: 'light' | 'dark' | 'auto'
  notifications: NotificationPreferences
  privacy: PrivacySettings
}

export interface NotificationPreferences {
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  courseUpdates: boolean
  assignments: boolean
  grades: boolean
  announcements: boolean
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'instructors_only'
  showEmail: boolean
  showPhoneNumber: boolean
  allowMessaging: boolean
}

export interface SocialLinks {
  linkedin?: string
  twitter?: string
  github?: string
  website?: string
}

// ================================
// LEGACY COURSE MODELS
// ================================

export interface Course extends BaseEntity {
  title: string
  description: string
  instructor: string
  instructorId: string
  category: string
  subcategory?: string
  level: CourseLevel
  price: number
  currency: string
  originalPrice?: number
  duration: string // e.g., "12 hours", "8 weeks"
  status: CourseStatus
  isPublished: boolean
  featured: boolean
  rating: number
  ratingCount: number
  enrollmentCount: number
  completionCount: number
  tags: string[]
  skills: string[]
  prerequisites: string[]
  whatYouWillLearn: string[]
  targetAudience: string[]
  courseImage?: string
  promoVideo?: string
  language: string
  subtitles: string[]
  certificates: boolean
  lifetimeAccess: boolean
  mobileAccess: boolean
  downloadableResources: boolean
  assignmentsCount: number
  articlesCount: number
  videosCount: number
  totalVideoLength: number // in minutes
  lastContentUpdate?: Date
  publishedAt?: Date
  archivedAt?: Date
  lastModifiedBy: string
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  
  // Multilingual Support & Language Configuration
  primaryLanguage?: string // Primary language for the course (e.g., 'en', 'te')
  supportedLanguages?: string[] // All supported languages for this course
  enableTranslation?: boolean // Whether to enable auto-translation features
  
  // Multilingual Content Fields (optional - for future multilingual content)
  multilingualTitle?: Record<string, string> // Language code -> title
  multilingualDescription?: Record<string, string> // Language code -> description
  multilingualTags?: Record<string, string[]> // Language code -> tags array
  multilingualSkills?: Record<string, string[]> // Language code -> skills array
  multilingualPrerequisites?: Record<string, string[]> // Language code -> prerequisites array
  multilingualWhatYouWillLearn?: Record<string, string[]> // Language code -> learning outcomes array
  multilingualTargetAudience?: Record<string, string[]> // Language code -> target audience array
}

export interface CourseTopic extends BaseEntity {
  courseId: string
  title: string
  description?: string
  order: number
  duration?: number // in minutes
  videoUrl?: string
  videoLength?: number // in minutes
  materials: TopicMaterial[]
  isPublished: boolean
  isFree: boolean
  prerequisites: string[] // topic IDs
  learningObjectives: string[]
  summary?: string
  transcription?: string
  notes?: string
  quizId?: string
  assignmentId?: string
  completionRate: number
  averageWatchTime?: number // in minutes
  viewCount: number
  
  // Multilingual Content Fields (optional - for future multilingual content)
  multilingualTitle?: Record<string, string> // Language code -> title
  multilingualDescription?: Record<string, string> // Language code -> description
  multilingualLearningObjectives?: Record<string, string[]> // Language code -> learning objectives array
  multilingualSummary?: Record<string, string> // Language code -> summary
  multilingualNotes?: Record<string, string> // Language code -> notes
}

export interface TopicMaterial {
  id: string
  type: MaterialType
  title: string
  url: string
  description?: string
  size?: number // in bytes
  duration?: number // for video/audio in minutes
  downloadable: boolean
  order: number
  
  // Multilingual Content Fields (optional - for future multilingual content)
  multilingualTitle?: Record<string, string> // Language code -> title
  multilingualDescription?: Record<string, string> // Language code -> description
}

// ================================
// MULTILINGUAL ADMIN COURSE MODELS
// ================================

/**
 * Multilingual Admin Course interface
 * Extends the original AdminCourse with multilingual support for content fields
 */
export interface MultilingualAdminCourse {
  id?: string
  
  // Multilingual content fields
  title: RequiredMultilingualText
  description: RequiredMultilingualText
  whatYouWillLearn?: RequiredMultilingualArray
  prerequisites?: RequiredMultilingualArray
  targetAudience?: RequiredMultilingualArray
  tags?: RequiredMultilingualArray
  skills?: RequiredMultilingualArray
  
  // Non-multilingual fields (remain as-is)
  instructor: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  price: number
  duration: number // Duration in hours as a number
  status: 'draft' | 'published' | 'archived'
  rating?: number
  enrollmentCount?: number
  createdAt?: Date
  updatedAt?: Date
  instructorId: string
  isPublished?: boolean
  
  // Language configuration
  primaryLanguage: SupportedLanguage // Primary language for the course
  supportedLanguages: SupportedLanguage[] // All supported languages
  enableTranslation?: boolean // Whether to enable auto-translation features
  
  // Legacy language fields (for backward compatibility)
  language?: string // Deprecated: use primaryLanguage instead
  subtitles?: string[] // Available subtitle languages
  
  // Additional course features
  certificates?: boolean
  lifetimeAccess?: boolean
  mobileAccess?: boolean
  downloadableResources?: boolean
  courseImage?: string
  ratingCount?: number
  videosCount?: number
  articlesCount?: number
  assignmentsCount?: number
}

/**
 * Multilingual Admin Course Topic interface
 * Extends the original AdminCourseTopic with multilingual support for content fields
 */
export interface MultilingualAdminCourseTopic {
  id?: string
  courseId: string
  
  // Multilingual content fields
  title: RequiredMultilingualText
  description?: MultilingualText
  learningObjectives?: MultilingualArray
  
  // Non-multilingual fields (remain as-is)
  order: number
  duration?: number // in minutes
  videoUrl?: string
  materials?: {
    type: 'pdf' | 'video' | 'audio' | 'document' | 'link'
    title: MultilingualText // Make material titles multilingual too
    url: string
    description?: MultilingualText
  }[]
  isPublished: boolean
  prerequisites?: string[] // topic IDs (remain as IDs)
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Multilingual Course creation data
 */
export interface MultilingualCreateCourseData {
  title: RequiredMultilingualText
  description: RequiredMultilingualText
  instructor: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  price: number
  duration: number
  instructorId: string
  status?: 'draft' | 'published'
  whatYouWillLearn?: RequiredMultilingualArray
  prerequisites?: RequiredMultilingualArray
  targetAudience?: RequiredMultilingualArray
  tags?: RequiredMultilingualArray
  skills?: RequiredMultilingualArray
  // Language configuration
  primaryLanguage: SupportedLanguage
  supportedLanguages: SupportedLanguage[]
  enableTranslation?: boolean
}

/**
 * Multilingual Course Topic creation data
 */
export interface MultilingualCreateCourseTopicData {
  title: RequiredMultilingualText
  description?: MultilingualText
  order: number
  duration?: number
  videoUrl?: string
  materials?: {
    type: 'pdf' | 'video' | 'audio' | 'document' | 'link'
    title: MultilingualText
    url: string
    description?: MultilingualText
  }[]
  isPublished?: boolean
  prerequisites?: string[]
  learningObjectives?: MultilingualArray
}

// ================================
// HYBRID COURSE INTERFACES (FOR MIGRATION PERIOD)
// ================================

/**
 * Hybrid Admin Course interface that supports both legacy and multilingual content
 * Useful during migration period where some content might still be in legacy format
 */
export interface HybridAdminCourse {
  id?: string
  
  // Fields that can be either legacy string or multilingual
  title: string | RequiredMultilingualText
  description: string | RequiredMultilingualText
  whatYouWillLearn?: string[] | RequiredMultilingualArray
  prerequisites?: string[] | RequiredMultilingualArray
  targetAudience?: string[] | RequiredMultilingualArray
  tags?: string[] | RequiredMultilingualArray
  skills?: string[] | RequiredMultilingualArray
  
  // Non-multilingual fields (remain as-is)
  instructor: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  price: number
  duration: number
  status: 'draft' | 'published' | 'archived'
  rating?: number
  enrollmentCount?: number
  createdAt?: Date
  updatedAt?: Date
  instructorId: string
  isPublished?: boolean
  
  // Language configuration (optional for backward compatibility)
  primaryLanguage?: string
  supportedLanguages?: string[]
  enableTranslation?: boolean
  
  // Legacy language fields
  language?: string
  subtitles?: string[]
  
  // Additional course features
  certificates?: boolean
  lifetimeAccess?: boolean
  mobileAccess?: boolean
  downloadableResources?: boolean
  courseImage?: string
  ratingCount?: number
  videosCount?: number
  articlesCount?: number
  assignmentsCount?: number
}

/**
 * Hybrid Admin Course Topic interface that supports both legacy and multilingual content
 */
export interface HybridAdminCourseTopic {
  id?: string
  courseId: string
  
  // Fields that can be either legacy string or multilingual
  title: string | RequiredMultilingualText
  description?: string | MultilingualText
  learningObjectives?: string[] | MultilingualArray
  
  // Non-multilingual fields (remain as-is)
  order: number
  duration?: number
  videoUrl?: string
  materials?: {
    type: 'pdf' | 'video' | 'audio' | 'document' | 'link'
    title: string | MultilingualText
    url: string
    description?: string | MultilingualText
  }[]
  isPublished: boolean
  prerequisites?: string[]
  createdAt?: Date
  updatedAt?: Date
}

// ================================
// QUESTION & ANSWER MODELS
// ================================

/**
 * Answer option for multiple choice questions
 */
export interface AnswerOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

/**
 * Question flags interface (from admin data models)
 */
export interface QuestionFlags {
  important: boolean;
  frequently_asked: boolean;
  practical: boolean;
  conceptual: boolean;
  custom_flags?: string[];
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
// LEGACY QUIZ & QUESTION MODELS
// ================================

export interface Quiz extends BaseEntity {
  courseId: string
  topicId?: string
  title: string
  description?: string
  instructions: string
  questions: QuizQuestion[]
  timeLimit?: number // in minutes
  attemptsAllowed: number
  passingScore: number
  showCorrectAnswers: boolean
  randomizeQuestions: boolean
  randomizeAnswers: boolean
  isPublished: boolean
  dueDate?: Date
}

export interface QuizQuestion {
  id: string
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'short_essay' | 'long_essay'
  question: string
  questionRichText?: string // For rich text questions
  options?: string[] // for multiple choice
  correctAnswer: string | string[]
  explanation?: string
  explanationRichText?: string // For rich text explanations
  marks: number // Changed from points to marks for clarity
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
  topicId?: string // Optional reference to course topic
  flags: QuestionFlags
  createdBy: string
  courseId: string
}

// Enhanced standalone Question model for Q&A section
export interface CourseQuestion extends BaseEntity {
  courseId: string
  topicId?: string // Optional reference to course topic
  question: string
  questionRichText?: string // For rich text questions
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'short_essay' | 'long_essay'
  marks: number
  difficulty: 'easy' | 'medium' | 'hard'
  options?: string[] // For multiple choice questions
  correctAnswer?: string | string[] // Optional for essay questions
  correctAnswerRichText?: string
  explanation?: string
  tags: string[]
  flags: QuestionFlags
  isPublished: boolean
  order: number // For organizing questions within a course
  createdBy: string
  lastModifiedBy?: string
  category?: string // Additional categorization
}

export interface QuizScore {
  attemptNumber: number
  score: number
  maxScore: number
  percentage: number
  timeSpent: number // in minutes
  submittedAt: Date
  answers: { [questionId: string]: string }
  feedback?: string
}

// ================================
// MULTILINGUAL QUESTION MODELS
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
  flags: QuestionFlags
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
  
  flags: QuestionFlags
  isPublished: boolean
  order: number // For organizing questions within a course
  createdBy: string
  lastModifiedBy?: string
  category?: string // Additional categorization
  createdAt?: Date
  updatedAt?: Date
}

// ================================
// ENROLLMENT & PROGRESS MODELS
// ================================

export interface CourseEnrollment extends BaseEntity {
  userId: string
  courseId: string
  status: EnrollmentStatus
  enrolledAt: Date
  completedAt?: Date
  lastAccessedAt?: Date
  progress: CourseProgress
  paymentId?: string
  discountApplied?: number
  finalPrice: number
  refundRequested?: boolean
  refundedAt?: Date
  certificate?: CourseCertificate
}

export interface CourseProgress {
  completedTopics: string[]
  totalTopics: number
  completionPercentage: number
  timeSpent: number // in minutes
  lastTopicId?: string
  quizScores: { [topicId: string]: QuizScore }
  assignmentSubmissions: { [assignmentId: string]: AssignmentSubmission }
  bookmarks: string[] // topic IDs
  notes: { [topicId: string]: string }
}

export interface CourseCertificate {
  id: string
  issuedAt: Date
  certificateUrl: string
  verificationCode: string
  grade?: string
  finalScore?: number
}

// ================================
// ASSIGNMENT MODELS
// ================================

export interface Assignment extends BaseEntity {
  courseId: string
  topicId?: string
  title: string
  description: string
  instructions: string
  type: AssignmentType
  maxPoints: number
  dueDate?: Date
  allowLateSubmission: boolean
  latePenalty?: number // percentage
  rubric?: AssignmentRubric[]
  resources: TopicMaterial[]
  isPublished: boolean
  submissionFormat: string[] // e.g., ['pdf', 'docx', 'txt']
  maxFileSize: number // in MB
}

export interface AssignmentRubric {
  criteria: string
  description: string
  maxPoints: number
  levels: {
    name: string
    description: string
    points: number
  }[]
}

export interface AssignmentSubmission extends BaseEntity {
  assignmentId: string
  studentId: string
  courseId: string
  submissionText?: string
  attachments: SubmissionFile[]
  submittedAt: Date
  isLate: boolean
  grade?: AssignmentGrade
  feedback?: string
  attemptNumber: number
}

export interface SubmissionFile {
  id: string
  fileName: string
  fileUrl: string
  fileSize: number
  fileType: string
  uploadedAt: Date
}

export interface AssignmentGrade {
  score: number
  maxScore: number
  percentage: number
  letterGrade?: string
  gradedBy: string
  gradedAt: Date
  rubricScores?: { [criteria: string]: number }
  comments?: string
}

// ================================
// NOTIFICATION MODELS
// ================================

export interface Notification extends BaseEntity {
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: { [key: string]: any }
  isRead: boolean
  readAt?: Date
  actionUrl?: string
  expiresAt?: Date
  priority: 'low' | 'medium' | 'high'
}

// ================================
// ANALYTICS & REPORTING MODELS
// ================================

export interface CourseAnalytics extends BaseEntity {
  courseId: string
  date: Date
  metrics: {
    enrollments: number
    completions: number
    dropouts: number
    revenue: number
    averageRating: number
    totalViews: number
    uniqueViews: number
    averageTimeSpent: number
    engagementRate: number
  }
}

export interface UserAnalytics extends BaseEntity {
  userId: string
  date: Date
  metrics: {
    coursesEnrolled: number
    coursesCompleted: number
    totalTimeSpent: number
    averageScore: number
    loginCount: number
    lastActive: Date
  }
}

// ================================
// PAYMENT & SUBSCRIPTION MODELS
// ================================

export interface Payment extends BaseEntity {
  userId: string
  courseId?: string
  subscriptionId?: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  paymentMethod: string
  transactionId: string
  gatewayResponse?: any
  refundReason?: string
  refundedAt?: Date
}

export interface Subscription extends BaseEntity {
  userId: string
  planId: string
  status: SubscriptionStatus
  startDate: Date
  endDate: Date
  autoRenew: boolean
  cancelledAt?: Date
  cancelReason?: string
  paymentId: string
}

// ================================
// SYSTEM MODELS
// ================================

export interface SystemSetting extends BaseEntity {
  key: string
  value: any
  description?: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  category: string
  isPublic: boolean
  lastModifiedBy: string
}

export interface AuditLog extends BaseEntity {
  userId: string
  action: string
  resource: string
  resourceId: string
  details?: any
  ipAddress?: string
  userAgent?: string
  timestamp: Date
}

// ================================
// CREATE/UPDATE DATA TYPES
// ================================

export type CreateUserData = Omit<User, keyof BaseEntity>
export type UpdateUserData = Partial<Omit<User, keyof BaseEntity>>

export type CreateCourseData = Omit<Course, keyof BaseEntity | 'rating' | 'ratingCount' | 'enrollmentCount' | 'completionCount'>
export type UpdateCourseData = Partial<Omit<Course, keyof BaseEntity>>

export type CreateCourseTopicData = Omit<CourseTopic, keyof BaseEntity | 'completionRate' | 'averageWatchTime' | 'viewCount'>
export type UpdateCourseTopicData = Partial<Omit<CourseTopic, keyof BaseEntity>>

export type CreateQuizData = Omit<Quiz, keyof BaseEntity>
export type UpdateQuizData = Partial<Omit<Quiz, keyof BaseEntity>>

export type CreateAssignmentData = Omit<Assignment, keyof BaseEntity>
export type UpdateAssignmentData = Partial<Omit<Assignment, keyof BaseEntity>>

export type CreateCourseQuestionData = Omit<CourseQuestion, keyof BaseEntity>
export type UpdateCourseQuestionData = Partial<Omit<CourseQuestion, keyof BaseEntity>>

/**
 * Creation data for hybrid course questions
 */
export type CreateHybridCourseQuestionData = Omit<HybridAdminCourseQuestion, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'lastModifiedBy'>

/**
 * Update data for hybrid course questions
 */
export type UpdateHybridCourseQuestionData = Partial<CreateHybridCourseQuestionData>

// ================================
// QUERY & FILTER TYPES
// ================================

export interface CourseFilters {
  category?: string
  subcategory?: string
  level?: CourseLevel
  priceMin?: number
  priceMax?: number
  rating?: number
  duration?: string
  language?: string
  instructor?: string
  featured?: boolean
  status?: CourseStatus
}

export interface UserFilters {
  role?: UserRole
  department?: string
  isActive?: boolean
  registeredAfter?: Date
  registeredBefore?: Date
}

export interface QueryOptions {
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  searchTerm?: string
}

// ================================
// API REQUEST/RESPONSE TYPES
// ================================

export interface ValidationError {
  field: string
  message: string
  value?: any
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  validationErrors?: ValidationError[]
  timestamp?: string
  warnings?: string[]
}

// Course Management Request Types
export interface CreateCourseRequest {
  title: string
  description: string
  instructor_id: string
  category: string
  level: CourseLevel
  price: number
  currency?: string
  tags?: string[]
  objectives?: string[]
  prerequisites?: string[]
  language?: string
  estimatedDuration?: number
  maxStudents?: number
  isPublic?: boolean
  isFeatured?: boolean
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {
  id: string
}

// User Management Request Types
export interface CreateUserRequest {
  email: string
  displayName: string
  role: UserRole
  profilePicture?: string
  bio?: string
  preferences?: UserPreferences
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  id: string
}

// ================================
// DASHBOARD STATISTICS
// ================================

export interface DashboardStats {
  users: {
    total: number
    active: number
    new: number
    byRole: Record<UserRole, number>
  }
  courses: {
    total: number
    published: number
    draft: number
    archived: number
    featured: number
  }
  enrollments: {
    total: number
    active: number
    completed: number
    thisMonth: number
  }
  revenue: {
    total: number
    thisMonth: number
    lastMonth: number
    growth: number
  }
  engagement: {
    averageCompletion: number
    averageRating: number
    totalTimeSpent: number
    activeUsers: number
  }
}

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
// TYPE GUARDS
// ================================

/**
 * Type guard to check if a course is using multilingual format
 */
export function isMultilingualCourse(course: HybridAdminCourse): course is MultilingualAdminCourse {
  return typeof course.title === 'object' && course.title !== null;
}

/**
 * Type guard to check if a course topic is using multilingual format
 */
export function isMultilingualTopic(topic: HybridAdminCourseTopic): topic is MultilingualAdminCourseTopic {
  return typeof topic.title === 'object' && topic.title !== null;
}

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
 * Fields that should be multilingual in courses
 */
export const COURSE_MULTILINGUAL_TEXT_FIELDS = [
  'title',
  'description'
] as const;

export const COURSE_MULTILINGUAL_ARRAY_FIELDS = [
  'whatYouWillLearn',
  'prerequisites', 
  'targetAudience',
  'tags',
  'skills'
] as const;

/**
 * Fields that should be multilingual in course topics
 */
export const TOPIC_MULTILINGUAL_TEXT_FIELDS = [
  'title',
  'description'
] as const;

export const TOPIC_MULTILINGUAL_ARRAY_FIELDS = [
  'learningObjectives'
] as const;

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
// COURSE REVIEW MODELS
// ================================

export interface CourseReview extends BaseEntity {
  userId: string
  courseId: string
  rating: number // 1-5 stars
  feedback?: string // Optional text feedback, max 250 characters
  isPublished: boolean // Allow hiding reviews if needed
  helpfulVotes?: number // For future enhancement
  reportedCount?: number // For moderation
}

export interface CourseReviewSummary {
  courseId: string
  averageRating: number
  totalReviews: number
  ratingDistribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  lastUpdated: Date
}

// ================================
// COURSE REVIEW DATA TYPES
// ================================

export type CreateCourseReviewData = Omit<CourseReview, keyof BaseEntity | 'helpfulVotes' | 'reportedCount'>
export type UpdateCourseReviewData = Partial<Pick<CourseReview, 'rating' | 'feedback' | 'isPublished'>>

// ================================
// INSTRUCTOR ACTIVITY MODELS
// ================================

export enum ActivityType {
  COURSE_CREATED = 'course_created',
  COURSE_PUBLISHED = 'course_published', 
  COURSE_RATED = 'course_rated',
  COURSE_ENROLLED = 'course_enrolled'
}

export interface InstructorActivity extends BaseEntity {
  instructorId: string
  type: ActivityType
  courseId: string
  courseName: string
  description: string // Human-readable activity description
  metadata?: Record<string, any> // Additional context (e.g., rating value, student info)
}

export interface ActivitySummary {
  id: string
  action: string
  user: string
  time: string
  type: 'activity'
  courseId?: string
}

// ================================
// ACTIVITY DATA TYPES
// ================================

export type CreateActivityData = Omit<InstructorActivity, keyof BaseEntity>
export type ActivityListOptions = {
  instructorId: string
  limit?: number
  offset?: number
}
