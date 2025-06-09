/**
 * Comprehensive Data Models for QuestEdu Admin Application
 * 
 * This file contains all the TypeScript interfaces and types for the Firebase collections
 * Used by the questadmin app for strong typing and data validation
 */

import { Timestamp } from 'firebase/firestore'

// ================================
// CORE ENUMS
// ================================

export enum UserRole {
  ADMIN = 'admin',
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
// BASE INTERFACES
// ================================

export interface BaseTimestamps {
  createdAt?: Timestamp | Date
  updatedAt?: Timestamp | Date
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
// COURSE MODELS
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
// QUIZ & ASSIGNMENT MODELS
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
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'essay'
  question: string
  options?: string[] // for multiple choice
  correctAnswer: string | string[]
  explanation?: string
  points: number
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
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
