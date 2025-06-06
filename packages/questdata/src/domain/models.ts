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
