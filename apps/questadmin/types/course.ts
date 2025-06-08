import { Timestamp } from 'firebase/firestore';

export interface BaseCourse {
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
 * Extended Course interface for admin app with additional fields
 */
export interface AdminCourse extends BaseCourse {
  // Course status for publishing workflow
  status?: 'draft' | 'published' | 'archived'
  
  // Course metrics
  rating?: number
  subscriberCount?: number
  duration?: string // e.g., "12 hours", "3 weeks"
  
  // Course structure
  modules?: CourseModule[]
  
  // Additional admin fields
  lastModifiedBy?: string
  publishedAt?: Date
  archivedAt?: Date
}

/**
 * Course module structure
 */
export interface CourseModule {
  id: string
  title: string
  description?: string
  duration?: string
  lessons: Lesson[]
  order: number
}

/**
 * Course lesson structure
 */
export interface Lesson {
  id: string
  title: string
  description?: string
  content?: string
  videoUrl?: string
  duration?: string
  order: number
  type: 'video' | 'text' | 'quiz' | 'assignment'
}

/**
 * Course statistics for dashboard
 */
export interface CourseStats {
  totalCourses: number
  publishedCourses: number
  draftCourses: number
  totalStudents: number
  averageRating: number
  totalRevenue?: number
}
