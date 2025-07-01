// Input validation schemas for API endpoints
import { z } from 'zod'
import { UserRole } from '../config/firebase-auth'

/**
 * User validation schemas
 */
export const CreateUserSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  role: z.nativeEnum(UserRole).default(UserRole.STUDENT)
})

export const UpdateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  displayName: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  department: z.string().max(100).optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional()
})

export const SignInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

/**
 * Course validation schemas
 */
export const CreateCourseSchema = z.object({
  title: z.string().min(1, 'Course title is required').max(200),
  description: z.string().max(2000).optional(),
  instructorId: z.string().min(1, 'Instructor ID is required'),
  category: z.string().max(50).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  price: z.number().min(0).max(10000).optional(),
  duration: z.number().min(1).max(1000).optional(), // hours
  maxEnrollments: z.number().min(1).max(10000).optional(),
  prerequisites: z.array(z.string().max(100)).max(10).optional(),
  learningObjectives: z.array(z.string().max(200)).max(20).optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  isPublished: z.boolean().default(false),
  
  // Language Configuration Fields
  primaryLanguage: z.string().min(2).max(5).optional(), // Language code (e.g., 'en', 'te')
  supportedLanguages: z.array(z.string().min(2).max(5)).min(1).max(10).optional(), // Array of language codes
  enableTranslation: z.boolean().default(false),
  
  // Multilingual Content Fields (optional - for future use)
  multilingualTitle: z.record(z.string().min(2).max(5), z.string().min(1).max(200)).optional(),
  multilingualDescription: z.record(z.string().min(2).max(5), z.string().max(2000)).optional(),
  multilingualTags: z.record(z.string().min(2).max(5), z.array(z.string().max(50))).optional(),
  multilingualSkills: z.record(z.string().min(2).max(5), z.array(z.string().max(100))).optional(),
  multilingualPrerequisites: z.record(z.string().min(2).max(5), z.array(z.string().max(100))).optional(),
  multilingualWhatYouWillLearn: z.record(z.string().min(2).max(5), z.array(z.string().max(200))).optional(),
  multilingualTargetAudience: z.record(z.string().min(2).max(5), z.array(z.string().max(100))).optional(),
})

export const UpdateCourseSchema = CreateCourseSchema.partial().omit({
  instructorId: true // Cannot change instructor via update
})

/**
 * Course topic validation schemas
 */
export const CreateTopicSchema = z.object({
  title: z.string().min(1, 'Topic title is required').max(200),
  description: z.string().max(2000).optional(),
  order: z.number().min(1).max(100).default(1),
  duration: z.number().min(1).max(600).optional(), // minutes
  videoUrl: z.string().url().or(z.literal('')).optional(),
  materials: z.array(z.object({
    type: z.enum(['pdf', 'video', 'audio', 'document', 'link']),
    title: z.string().min(1).max(100),
    url: z.string().url(),
    description: z.string().max(500).optional(),
    // Multilingual material fields
    multilingualTitle: z.record(z.string().min(2).max(5), z.string().min(1).max(100)).optional(),
    multilingualDescription: z.record(z.string().min(2).max(5), z.string().max(500)).optional(),
  })).max(10).optional(),
  isPublished: z.boolean().default(false),
  prerequisites: z.array(z.string().uuid()).max(5).optional(),
  learningObjectives: z.array(z.string().max(200)).max(10).optional(),
  
  // Multilingual Content Fields (optional - for future use)
  multilingualTitle: z.record(z.string().min(2).max(5), z.string().min(1).max(200)).optional(),
  multilingualDescription: z.record(z.string().min(2).max(5), z.string().max(2000)).optional(),
  multilingualLearningObjectives: z.record(z.string().min(2).max(5), z.array(z.string().max(200))).optional(),
  multilingualSummary: z.record(z.string().min(2).max(5), z.string().max(1000)).optional(),
  multilingualNotes: z.record(z.string().min(2).max(5), z.string().max(2000)).optional(),
})

export const UpdateTopicSchema = CreateTopicSchema.partial()

/**
 * Course review validation schemas
 */
export const CreateCourseReviewSchema = z.object({
  courseId: z.string().uuid('Invalid course ID'),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  feedback: z.string().max(250, 'Feedback cannot exceed 250 characters').optional(),
  isPublished: z.boolean().default(true)
})

export const UpdateCourseReviewSchema = z.object({
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5').optional(),
  feedback: z.string().max(250, 'Feedback cannot exceed 250 characters').optional(),
  isPublished: z.boolean().optional()
})

/**
 * Activity validation schemas
 */
export const CreateActivitySchema = z.object({
  type: z.enum([
    'course_created', 
    'course_published', 
    'course_updated',
    'course_deleted',
    'course_rated', 
    'course_enrolled',
    'topic_created',
    'topic_updated',
    'topic_deleted',
    'question_created',
    'question_updated',
    'question_deleted'
  ]),
  courseId: z.string().min(1, 'Course ID is required'),
  courseName: z.string().min(1, 'Course name is required').max(200),
  topicId: z.string().optional(),
  topicName: z.string().max(200).optional(),
  questionId: z.string().optional(),
  description: z.string().min(1, 'Description is required').max(500),
  metadata: z.record(z.any()).optional()
  // Note: instructorId is not included as it comes from the authenticated user
})

export const ActivityListOptionsSchema = z.object({
  limit: z.string().optional().transform((val) => {
    if (!val) return 10 // default value
    const num = parseInt(val, 10)
    if (isNaN(num)) return 10 // default if not a valid number
    return Math.min(Math.max(num, 1), 100) // clamp between 1 and 100
  })
})

/**
 * Course Questions validation schemas
 */
export const CreateCourseQuestionSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  topicId: z.string().optional(),
  question: z.string().max(1000).optional(), // Made optional since essay questions can use questionRichText instead
  questionRichText: z.string().max(5000).optional(), // For rich text content in essay questions
  type: z.enum(['multiple_choice', 'true_false', 'fill_blank', 'short_essay', 'long_essay']),
  options: z.array(z.string().max(200)).optional(),
  correctAnswer: z.union([z.string(), z.array(z.string())]).optional(),
  explanation: z.string().max(1000).optional(),
  explanationRichText: z.string().max(5000).optional(), // For rich text explanations in essay questions
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  marks: z.number().min(1).max(100).default(1),
  timeLimit: z.number().min(30).max(3600).optional(), // seconds
  order: z.number().min(0).default(0),
  isPublished: z.boolean().default(false),
  tags: z.array(z.string().max(50)).default([]),
  flags: z.object({
    important: z.boolean(),
    frequently_asked: z.boolean(),
    practical: z.boolean(),
    conceptual: z.boolean()
  }).default({
    important: false,
    frequently_asked: false,
    practical: false,
    conceptual: false
  }),
  category: z.string().max(100).optional(),
  createdBy: z.string().min(1, 'Created by is required')
}).refine((data) => {
  // For essay questions, require either question or questionRichText
  if (data.type === 'short_essay' || data.type === 'long_essay') {
    const hasQuestion = data.question && data.question.trim().length > 0;
    const hasQuestionRichText = data.questionRichText && data.questionRichText.trim().length > 0;
    return hasQuestion || hasQuestionRichText;
  }
  // For non-essay questions, require question field
  if (data.type === 'multiple_choice' || data.type === 'true_false' || data.type === 'fill_blank') {
    if (!data.question || data.question.trim().length === 0) {
      return false;
    }
  }
  // For multiple choice questions, require options
  if (data.type === 'multiple_choice') {
    return data.options && data.options.length >= 2;
  }
  // For true/false questions, require correctAnswer
  if (data.type === 'true_false') {
    return data.correctAnswer && (data.correctAnswer === 'true' || data.correctAnswer === 'false');
  }
  return true;
}, {
  message: "Invalid question configuration for the selected type",
})

// Create UpdateCourseQuestionSchema without the refine validation since updates are partial
export const UpdateCourseQuestionSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required').optional(),
  topicId: z.string().optional(),
  question: z.string().max(1000).optional(), // Made properly optional for updates
  questionRichText: z.string().max(5000).optional(),
  type: z.enum(['multiple_choice', 'true_false', 'fill_blank', 'short_essay', 'long_essay']).optional(),
  options: z.array(z.string().max(200)).optional(),
  correctAnswer: z.union([z.string(), z.array(z.string())]).optional(),
  explanation: z.string().max(2000).optional(),
  explanationRichText: z.string().max(5000).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  marks: z.number().min(0.5).max(100).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  flags: z.object({
    important: z.boolean(),
    frequently_asked: z.boolean(),
    practical: z.boolean(),
    conceptual: z.boolean()
  }).optional(),
  category: z.string().max(100).optional(),
  isPublished: z.boolean().optional(),
  order: z.number().min(0).optional(),
})

export const BulkUpdateQuestionsSchema = z.object({
  questions: z.array(z.object({
    id: z.string().min(1),
    order: z.number().min(0)
  })).min(1).max(100)
})

/**
 * Subject validation schemas
 */
export const CreateSubjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required').max(100),
  code: z.string().min(1, 'Subject code is required').max(20),
  description: z.string().max(500).optional(),
  instructorId: z.string().min(1, 'Instructor ID is required'),
  yearOrSemester: z.number().min(1).max(10),
  credits: z.number().min(1).max(10),
  isCore: z.boolean().default(false),
  prerequisites: z.array(z.string()).max(10).optional()
})

export const UpdateSubjectSchema = CreateSubjectSchema.partial().extend({
  id: z.string().min(1, 'Subject ID is required')
})

export const BulkUpdateSubjectsSchema = z.object({
  subjects: z.array(UpdateSubjectSchema).min(1).max(50)
})

/**
 * Query parameter validation schemas
 */
export const PaginationSchema = z.object({
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(1).max(100)).optional(),
  offset: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(0)).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(1)).optional()
})

export const SearchSchema = z.object({
  search: z.string().max(100).optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  category: z.string().max(50).optional()
})

export const CourseQuerySchema = PaginationSchema.merge(SearchSchema).extend({
  instructorId: z.string().uuid().optional(),
  stats: z.string().regex(/^(true|false)$/).transform(val => val === 'true').optional()
})

export const UserQuerySchema = PaginationSchema.extend({
  search: z.string().max(100).optional(),
  role: z.nativeEnum(UserRole).optional(),
  stats: z.string().regex(/^(true|false)$/).transform((val: string) => val === 'true').optional()
})

/**
 * Validation helper functions
 */
export function validateRequestBody<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((err: any) => `${err.path.join('.')}: ${err.message}`)
      return { success: false, error: messages.join(', ') }
    }
    return { success: false, error: 'Invalid request data' }
  }
}

export function validateQueryParams<T>(schema: z.ZodType<T, any, any>, params: URLSearchParams): { success: true; data: T } | { success: false; error: string } {
  try {
    const data: Record<string, string> = {}
    params.forEach((value, key) => {
      data[key] = value
    })
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((err: any) => `${err.path.join('.')}: ${err.message}`)
      return { success: false, error: messages.join(', ') }
    }
    return { success: false, error: 'Invalid query parameters' }
  }
}

/**
 * Sanitization functions
 */
export function sanitizeHtml(input: string): string {
  // Basic HTML sanitization - replace with proper library like DOMPurify in production
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

export function sanitizeFileName(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 255)
}

export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}
