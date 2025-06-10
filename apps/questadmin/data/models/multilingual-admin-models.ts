/**
 * Multilingual Admin Course Interfaces
 * 
 * This file extends the existing AdminCourse and AdminCourseTopic interfaces
 * to support multilingual content while maintaining backward compatibility
 */

import {
    MultilingualArray,
    MultilingualText,
    RequiredMultilingualArray,
    RequiredMultilingualText,
    SupportedLanguage
} from '../../lib/multilingual-types';

// Re-export original interfaces for backward compatibility
export type {
    AdminCourse as LegacyAdminCourse,
    AdminCourseTopic as LegacyAdminCourseTopic,
    CreateCourseData as LegacyCreateCourseData,
    CreateCourseTopicData as LegacyCreateCourseTopicData
} from '../services/admin-course-service';

// ================================
// MULTILINGUAL ADMIN COURSE
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

// ================================
// MULTILINGUAL ADMIN COURSE TOPIC
// ================================

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

// ================================
// CREATION DATA INTERFACES
// ================================

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
// HYBRID INTERFACES (FOR MIGRATION PERIOD)
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
