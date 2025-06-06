import type { Course, CourseSearchCriteria, CreateCourseData, UpdateCourseData } from '@questedu/questdata';
import { getCourseRepository } from './questdata-config';

// Re-export types for compatibility
export type { Course };

/**
 * Get all courses
 */
export const getCourses = async (): Promise<Course[]> => {
  const repository = getCourseRepository();
  const result = await repository.getAll();
  return result.data;
};

/**
 * Get a single course by ID
 */
export const getCourseById = async (id: string): Promise<Course | null> => {
  const repository = getCourseRepository();
  return await repository.getById(id);
};

/**
 * Search courses
 */
export const searchCourses = async (searchTerm: string): Promise<Course[]> => {
  const repository = getCourseRepository();
  const searchCriteria: CourseSearchCriteria = {
    query: searchTerm
  };
  const result = await repository.search(searchCriteria);
  return result.data;
};

/**
 * Get courses by category
 */
export const getCoursesByCategory = async (category: string): Promise<Course[]> => {
  const repository = getCourseRepository();
  const result = await repository.getByCategory(category);
  return result.data;
};

/**
 * Add a new course
 */
export const addCourse = async (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
  const repository = getCourseRepository();
  const courseData: CreateCourseData = {
    title: course.title,
    instructor: course.instructor,
    progress: course.progress,
    image: course.image,
    category: course.category || '',
    description: course.description || ''
  };
  
  const result = await repository.create(courseData);
  return result.success ? result.data! : null;
};

/**
 * Update a course
 */
export const updateCourse = async (courseId: string, updates: Partial<Course>): Promise<boolean> => {
  const repository = getCourseRepository();
  const updateData: UpdateCourseData = {};
  
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.instructor !== undefined) updateData.instructor = updates.instructor;
  if (updates.progress !== undefined) updateData.progress = updates.progress;
  if (updates.image !== undefined) updateData.image = updates.image;
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.description !== undefined) updateData.description = updates.description;
  
  const result = await repository.update(courseId, updateData);
  return result.success;
};

/**
 * Delete a course
 */
export const deleteCourse = async (courseId: string): Promise<boolean> => {
  const repository = getCourseRepository();
  const result = await repository.delete(courseId);
  return result.success;
};

/**
 * Subscribe to courses changes in real-time
 */
export const subscribeToCoursesChanges = (callback: (courses: Course[]) => void): (() => void) => {
  const repository = getCourseRepository();
  return repository.subscribeToChanges(callback);
};

/**
 * Subscribe to a single course changes
 */
export const subscribeToSingleCourse = (id: string, callback: (course: Course | null) => void): (() => void) => {
  const repository = getCourseRepository();
  return repository.subscribeToSingle(id, callback);
};
