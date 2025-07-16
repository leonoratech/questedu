import type { CourseCategory } from './firebase-category-service';
import { firebaseCategoryService } from './firebase-category-service';

// Re-export types for compatibility
export type { CourseCategory, QueryResult } from './firebase-category-service';

/**
 * Get all active categories
 */
export const getActiveCategories = async (): Promise<CourseCategory[]> => {
  const result = await firebaseCategoryService.getActiveCategories();
  return result.data;
};

/**
 * Get all categories (including inactive)
 */
export const getAllCategories = async (): Promise<CourseCategory[]> => {
  const result = await firebaseCategoryService.getAllCategories();
  return result.data;
};

/**
 * Get a single category by ID
 */
export const getCategoryById = async (id: string): Promise<CourseCategory | null> => {
  return await firebaseCategoryService.getById(id);
};

/**
 * Get category by name
 */
export const getCategoryByName = async (name: string): Promise<CourseCategory | null> => {
  return await firebaseCategoryService.getByName(name);
};

/**
 * Get category names for display
 */
export const getCategoryNames = async (): Promise<string[]> => {
  return await firebaseCategoryService.getCategoryNames();
};

/**
 * Subscribe to active categories changes in real-time
 */
export const subscribeToActiveCategoriesChanges = (callback: (categories: CourseCategory[]) => void): (() => void) => {
  return firebaseCategoryService.subscribeToActiveCategories(callback);
};

/**
 * Subscribe to all categories changes in real-time
 */
export const subscribeToAllCategoriesChanges = (callback: (categories: CourseCategory[]) => void): (() => void) => {
  return firebaseCategoryService.subscribeToAllCategories(callback);
};
