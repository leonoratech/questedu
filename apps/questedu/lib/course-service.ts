import type { Course, CourseSearchCriteria, CreateCourseData, UpdateCourseData } from '../types/course';
import { firebaseCourseService } from './firebase-course-service';

// Re-export types for compatibility
export type {
    Course, CourseLevel, CourseQueryOptions, CourseSearchCriteria, CourseStatus, CreateCourseData, OperationResult,
    QueryResult, UpdateCourseData
} from '../types/course';

/**
 * Get all courses
 */
export const getCourses = async (): Promise<Course[]> => {
  const result = await firebaseCourseService.getAll();
  return result.data;
};

/**
 * Get a single course by ID
 */
export const getCourseById = async (id: string): Promise<Course | null> => {
  return await firebaseCourseService.getById(id);
};

/**
 * Search courses
 */
export const searchCourses = async (searchTerm: string): Promise<Course[]> => {
  const searchCriteria: CourseSearchCriteria = {
    query: searchTerm
  };
  const result = await firebaseCourseService.search(searchCriteria);
  return result.data;
};

/**
 * Get courses by category
 */
export const getCoursesByCategory = async (category: string): Promise<Course[]> => {
  const result = await firebaseCourseService.getByCategory(category);
  return result.data;
};

/**
 * Add a new course
 */
export const addCourse = async (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
  const courseData: CreateCourseData = {
    title: course.title,
    instructor: course.instructor,
    progress: course.progress,
    image: course.image,
    category: course.category || '',
    description: course.description || ''
  };
  
  const result = await firebaseCourseService.create(courseData);
  return result.success ? result.data! : null;
};

/**
 * Update a course
 */
export const updateCourse = async (courseId: string, updates: Partial<Course>): Promise<boolean> => {
  const updateData: UpdateCourseData = {};
  
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.instructor !== undefined) updateData.instructor = updates.instructor;
  if (updates.progress !== undefined) updateData.progress = updates.progress;
  if (updates.image !== undefined) updateData.image = updates.image;
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.description !== undefined) updateData.description = updates.description;
  
  const result = await firebaseCourseService.update(courseId, updateData);
  return result.success;
};

/**
 * Delete a course
 */
export const deleteCourse = async (courseId: string): Promise<boolean> => {
  const result = await firebaseCourseService.delete(courseId);
  return result.success;
};

/**
 * Subscribe to courses changes in real-time
 */
export const subscribeToCoursesChanges = (callback: (courses: Course[]) => void): (() => void) => {
  return firebaseCourseService.subscribeToChanges(callback);
};

/**
 * Subscribe to a single course changes
 */
export const subscribeToSingleCourse = (id: string, callback: (course: Course | null) => void): (() => void) => {
  return firebaseCourseService.subscribeToSingle(id, callback);
};

/**
 * Get courses by college ID
 */
export const getCoursesByCollege = async (collegeId: string): Promise<Course[]> => {
  const result = await firebaseCourseService.getCoursesByCollege(collegeId);
  return result.data;
};

/**
 * Get courses with association filters
 */
export const getCoursesWithFilters = async (filters: {
  collegeId?: string;
  programId?: string;
  yearOrSemester?: number;
  subjectId?: string;
}): Promise<Course[]> => {
  const result = await firebaseCourseService.getCoursesWithFilters(filters);
  return result.data;
};

/**
 * Subscribe to courses changes with college filter
 */
export const subscribeToCollegeCourses = (collegeId: string, callback: (courses: Course[]) => void): (() => void) => {
  return firebaseCourseService.subscribeToCollegeCourses(collegeId, callback);
};
