/**
 * Course data types for QuestEdu React Native App
 * Simplified version focused on mobile app needs
 */

import { Timestamp } from 'firebase/firestore';

// ================================
// CORE ENUMS
// ================================

export enum CourseLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced'
}

export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

// ================================
// BASE INTERFACES
// ================================

export interface BaseTimestamps {
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export interface BaseEntity extends BaseTimestamps {
  id?: string;
}

// ================================
// COURSE MODELS
// ================================

/**
 * Main Course interface for mobile app
 */
export interface Course extends BaseEntity {
  title: string;
  description?: string;
  instructor: string;
  instructorId?: string;
  category: string;
  level?: CourseLevel;
  price?: number;
  currency?: string;
  duration?: string; // e.g., "12 hours", "8 weeks"
  status?: CourseStatus;
  isPublished?: boolean;
  featured?: boolean;
  rating?: number;
  ratingCount?: number;
  enrollmentCount?: number;
  tags?: string[];
  skills?: string[];
  prerequisites?: string[];
  courseImage?: string;
  image?: string; // Legacy support
  progress: number; // User's progress in the course (0-100)
  language?: string;
  certificates?: boolean;
  
  // Mobile-specific fields
  downloadableResources?: boolean;
  mobileAccess?: boolean;
  lastAccessed?: Date;
  bookmarked?: boolean;
}

/**
 * Course search criteria
 */
export interface CourseSearchCriteria {
  query?: string;
  category?: string;
  level?: CourseLevel;
  minPrice?: number;
  maxPrice?: number;
  minProgress?: number;
  maxProgress?: number;
  featured?: boolean;
  tags?: string[];
}

/**
 * Course query options
 */
export interface CourseQueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Course creation data (excludes system fields)
 */
export interface CreateCourseData {
  title: string;
  description?: string;
  instructor: string;
  instructorId?: string;
  category: string;
  level?: CourseLevel;
  price?: number;
  currency?: string;
  duration?: string;
  status?: CourseStatus;
  isPublished?: boolean;
  featured?: boolean;
  tags?: string[];
  skills?: string[];
  prerequisites?: string[];
  courseImage?: string;
  image?: string;
  progress: number;
  language?: string;
  certificates?: boolean;
  downloadableResources?: boolean;
  mobileAccess?: boolean;
}

/**
 * Course update data (partial course data)
 */
export interface UpdateCourseData {
  title?: string;
  description?: string;
  instructor?: string;
  instructorId?: string;
  category?: string;
  level?: CourseLevel;
  price?: number;
  currency?: string;
  duration?: string;
  status?: CourseStatus;
  isPublished?: boolean;
  featured?: boolean;
  tags?: string[];
  skills?: string[];
  prerequisites?: string[];
  courseImage?: string;
  image?: string;
  progress?: number;
  language?: string;
  certificates?: boolean;
  downloadableResources?: boolean;
  mobileAccess?: boolean;
  lastAccessed?: Date;
  bookmarked?: boolean;
}

// ================================
// OPERATION RESULT TYPES
// ================================

/**
 * Generic operation result
 */
export interface OperationResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Query result with pagination
 */
export interface QueryResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
  nextPageToken?: string;
}

// ================================
// UTILITY TYPES
// ================================

/**
 * Course category mapping
 */
export const COURSE_CATEGORIES = {
  PROGRAMMING: 'Programming',
  DESIGN: 'Design',
  DATA_SCIENCE: 'Data Science',
  BUSINESS: 'Business',
  MARKETING: 'Marketing',
  LANGUAGE: 'Language',
  PERSONAL_DEVELOPMENT: 'Personal Development',
  TECHNOLOGY: 'Technology',
  HEALTH: 'Health & Fitness',
  MUSIC: 'Music',
  ART: 'Art',
  OTHER: 'Other'
} as const;

export type CourseCategory = typeof COURSE_CATEGORIES[keyof typeof COURSE_CATEGORIES];

/**
 * Course progress status
 */
export enum ProgressStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

/**
 * Get progress status from progress percentage
 */
export function getProgressStatus(progress: number): ProgressStatus {
  if (progress === 0) return ProgressStatus.NOT_STARTED;
  if (progress >= 100) return ProgressStatus.COMPLETED;
  return ProgressStatus.IN_PROGRESS;
}

/**
 * Format progress as percentage string
 */
export function formatProgress(progress: number): string {
  return `${Math.round(progress)}%`;
}

/**
 * Check if course is free
 */
export function isFree(course: Course): boolean {
  return !course.price || course.price === 0;
}

/**
 * Get course display image
 */
export function getCourseImage(course: Course): string | undefined {
  return course.courseImage || course.image;
}

/**
 * Get course duration in minutes (if numeric)
 */
export function getCourseDurationMinutes(course: Course): number | null {
  if (!course.duration) return null;
  
  // Try to extract minutes from duration string
  const match = course.duration.match(/(\d+)\s*(hour|hr|h|minute|min|m)/i);
  if (match) {
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    if (unit.startsWith('h')) {
      return value * 60; // Convert hours to minutes
    } else if (unit.startsWith('m')) {
      return value;
    }
  }
  
  return null;
}
