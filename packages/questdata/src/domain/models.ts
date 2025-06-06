import { Timestamp } from 'firebase/firestore';

/**
 * Core Course domain model
 */
export interface Course {
  id?: string;
  title: string;
  instructor: string;
  progress: number;
  image: string;
  category?: string;
  description?: string;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

/**
 * Course creation data (without system-generated fields)
 */
export type CreateCourseData = Omit<Course, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Course update data (partial course without system fields)
 */
export type UpdateCourseData = Partial<Omit<Course, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Course search criteria
 */
export interface CourseSearchCriteria {
  query?: string;
  category?: string;
  instructor?: string;
  minProgress?: number;
  maxProgress?: number;
}

/**
 * Course query options
 */
export interface CourseQueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'title' | 'instructor' | 'createdAt' | 'updatedAt' | 'progress';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Repository query result
 */
export interface QueryResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
}

/**
 * Repository operation result
 */
export interface OperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

/**
 * User role enumeration
 */
export enum UserRole {
  STUDENT = 'student',
  COURSE_OWNER = 'course_owner',
  ADMIN = 'admin'
}

/**
 * User subscription status
 */
export enum SubscriptionStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

/**
 * Core User domain model
 */
export interface User {
  id?: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  isActive: boolean;
  profileComplete: boolean;
  bio?: string;
  expertise?: string[];
  location?: string;
  socialLinks?: {
    website?: string;
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
  lastLoginAt?: Timestamp | Date;
}

/**
 * Course ownership model for course owners
 */
export interface CourseOwnership {
  id?: string;
  userId: string;
  courseId: string;
  isOwner: boolean;
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canPublish: boolean;
    canViewAnalytics: boolean;
  };
  createdAt?: Timestamp | Date;
}

/**
 * Course subscription model for students
 */
export interface CourseSubscription {
  id?: string;
  userId: string;
  courseId: string;
  status: SubscriptionStatus;
  enrolledAt?: Timestamp | Date;
  completedAt?: Timestamp | Date;
  progress: number;
  lastAccessedAt?: Timestamp | Date;
  certificateIssued?: boolean;
  certificateId?: string;
}

/**
 * User statistics model
 */
export interface UserStats {
  userId: string;
  // For students
  coursesEnrolled?: number;
  coursesCompleted?: number;
  totalLearningHours?: number;
  certificatesEarned?: number;
  // For course owners
  coursesCreated?: number;
  totalStudents?: number;
  totalRevenue?: number;
  averageRating?: number;
  updatedAt?: Timestamp | Date;
}

/**
 * User creation data (without system-generated fields)
 */
export type CreateUserData = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastLoginAt'>;

/**
 * User update data (partial user without system fields)
 */
export type UpdateUserData = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastLoginAt'>>;

/**
 * User search criteria
 */
export interface UserSearchCriteria {
  query?: string;
  role?: UserRole;
  isActive?: boolean;
  expertise?: string[];
  location?: string;
}

/**
 * User query options
 */
export interface UserQueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'displayName' | 'email' | 'createdAt' | 'lastLoginAt' | 'role';
  sortOrder?: 'asc' | 'desc';
}

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
 * Course topic model
 */
export interface CourseTopic {
  id?: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  duration?: number; // in minutes
  videoUrl?: string;
  materials?: {
    type: 'pdf' | 'video' | 'audio' | 'document' | 'link';
    title: string;
    url: string;
    description?: string;
  }[];
  isPublished: boolean;
  prerequisites?: string[]; // topic IDs
  learningObjectives?: string[];
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
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

/**
 * Media attachment for rich answers
 */
export interface MediaAttachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'link';
  url: string;
  filename?: string;
  mimeType?: string;
  size?: number; // in bytes
  caption?: string;
  altText?: string;
}

/**
 * Rich text content for essay answers
 */
export interface RichTextContent {
  format: RichTextFormat;
  content: string; // The actual text content in the specified format
  plainText?: string; // Plain text version for search/indexing
  wordCount?: number;
  characterCount?: number;
  attachments?: MediaAttachment[];
}

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
 * Essay answer model for rich format responses
 */
export interface EssayAnswer {
  id?: string;
  questionId: string;
  userId: string;
  content: RichTextContent;
  isSubmitted: boolean;
  isDraft: boolean;
  submittedAt?: Timestamp | Date;
  lastEditedAt?: Timestamp | Date;
  
  // Scoring and feedback
  score?: number;
  maxScore?: number;
  feedback?: RichTextContent;
  rubricScores?: {
    criteriaId: string;
    score: number;
    feedback?: string;
  }[];
  
  // Grading status
  gradingStatus: 'pending' | 'in_progress' | 'graded' | 'returned';
  gradedBy?: string; // user ID of grader
  gradedAt?: Timestamp | Date;
  
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

/**
 * Question model
 */
export interface Question {
  id?: string;
  courseId: string;
  topicId?: string;
  questionBankId?: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  title: string;
  description?: string;
  question: string;
  points: number;
  timeLimit?: number; // in seconds
  
  // For multiple choice, true/false, matching
  options?: AnswerOption[];
  
  // For short answer, essay, fill in blank
  correctAnswer?: string;
  sampleAnswers?: string[];
  
  // For essay questions - enhanced rich format support
  essayConfig?: {
    allowRichText: boolean;
    allowedFormats: RichTextFormat[];
    allowAttachments: boolean;
    allowedAttachmentTypes: ('image' | 'video' | 'audio' | 'document' | 'link')[];
    maxWordCount?: number;
    minWordCount?: number;
    maxFileSize?: number; // in bytes
    maxAttachments?: number;
    gradingRubric?: {
      id: string;
      name: string;
      criteria: {
        id: string;
        name: string;
        description: string;
        maxPoints: number;
        levels: {
          score: number;
          description: string;
        }[];
      }[];
    };
  };
  
  // For matching questions
  matchingPairs?: {
    left: string;
    right: string;
  }[];
  
  // For ordering questions
  correctOrder?: string[];
  
  hints?: string[];
  explanation?: string;
  tags?: string[];
  
  // Usage statistics
  timesUsed?: number;
  averageScore?: number;
  
  isActive: boolean;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

/**
 * Question bank model for organizing questions
 */
export interface QuestionBank {
  id?: string;
  courseId: string;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  isPublic: boolean;
  
  // Question distribution
  totalQuestions?: number;
  questionsByType?: {
    [key in QuestionType]?: number;
  };
  questionsByDifficulty?: {
    [key in DifficultyLevel]?: number;
  };
  
  createdBy: string; // user ID
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

/**
 * Quiz/Assessment model
 */
export interface Quiz {
  id?: string;
  courseId: string;
  topicId?: string;
  title: string;
  description?: string;
  instructions?: string;
  
  // Quiz configuration
  totalQuestions: number;
  timeLimit?: number; // in minutes
  attemptsAllowed: number;
  passingScore: number; // percentage
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  showResultsImmediately: boolean;
  
  // Question selection
  questionIds?: string[]; // specific questions
  questionBankId?: string; // or from question bank
  questionSelection?: {
    [key in DifficultyLevel]?: number; // number of questions per difficulty
  };
  
  isPublished: boolean;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

/**
 * Student quiz attempt model
 */
export interface QuizAttempt {
  id?: string;
  quizId: string;
  userId: string;
  courseId: string;
  
  // Attempt details
  attemptNumber: number;
  startedAt: Timestamp | Date;
  completedAt?: Timestamp | Date;
  timeSpent?: number; // in seconds
  
  // Scoring
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  score: number; // percentage
  passed: boolean;
  
  // Detailed answers
  answers: {
    questionId: string;
    selectedAnswer?: string | string[]; // can be array for multiple selection
    essayAnswerId?: string; // reference to EssayAnswer for essay questions
    isCorrect: boolean;
    pointsEarned: number;
    timeSpent?: number;
  }[];
  
  // Essay grading status (if attempt contains essay questions)
  hasEssayQuestions?: boolean;
  essayGradingStatus?: 'pending' | 'in_progress' | 'completed';
  autoGradableScore?: number; // score from non-essay questions
  finalScore?: number; // final score after essay grading
  
  createdAt?: Timestamp | Date;
}
