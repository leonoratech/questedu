/**
 * Firebase Category Service for QuestEdu React Native App
 * Provides operations for course categories
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    onSnapshot,
    query,
    where
} from 'firebase/firestore';

import { getFirestoreDb } from './firebase-config';

const COLLECTION_NAME = 'courseCategories';

export interface CourseCategory {
  id: string;
  name: string;
  description?: string;
  subcategories?: string[];
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface QueryResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
}

/**
 * Firebase Category Service Class
 */
export class FirebaseCategoryService {
  private db = getFirestoreDb();
  private enableLogging = __DEV__;

  private log(message: string, ...args: any[]) {
    if (this.enableLogging) {
      console.log(`[FirebaseCategoryService] ${message}`, ...args);
    }
  }

  private error(message: string, error: any) {
    console.error(`[FirebaseCategoryService] ${message}`, error);
  }

  /**
   * Convert Firestore document to CourseCategory model
   */
  private documentToCategory(docSnapshot: any): CourseCategory {
    const data = docSnapshot.data();
    return {
      id: docSnapshot.id,
      name: data.name || '',
      description: data.description || '',
      subcategories: data.subcategories || [],
      isActive: data.isActive !== false, // Default to true if not specified
      order: data.order || 0,
      createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt) || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt) || new Date(),
    };
  }

  /**
   * Get all active categories
   */
  async getActiveCategories(options?: { limit?: number }): Promise<QueryResult<CourseCategory>> {
    try {
      this.log('Fetching active categories with options:', options);
      
      const categoriesRef = collection(this.db, COLLECTION_NAME);
      
      // First try to get all documents to see if collection exists
      this.log('Testing collection access...');
      const allDocsSnapshot = await getDocs(categoriesRef);
      this.log(`Total documents in ${COLLECTION_NAME}:`, allDocsSnapshot.docs.length);
      
      if (allDocsSnapshot.docs.length > 0) {
        this.log('Sample document data:', allDocsSnapshot.docs[0].data());
      }
      
      // Use simple where query without orderBy to avoid index requirements
      // Sort in memory instead (same approach as questadmin)
      let q = query(
        categoriesRef,
        where('isActive', '==', true)
      );

      const querySnapshot = await getDocs(q);
      let categories = querySnapshot.docs.map(doc => this.documentToCategory(doc));

      // Sort in memory by order field
      categories.sort((a, b) => a.order - b.order);

      // Apply limit after sorting if specified
      if (options?.limit) {
        categories = categories.slice(0, options.limit);
      }

      this.log(`Successfully fetched ${categories.length} active categories`);
      this.log('Active categories:', categories);

      return {
        data: categories,
        total: categories.length,
        hasMore: options?.limit ? categories.length === options.limit : false
      };
    } catch (error) {
      this.error('Error fetching active categories:', error);
      return { data: [], total: 0, hasMore: false };
    }
  }

  /**
   * Get all categories (including inactive)
   */
  async getAllCategories(options?: { limit?: number }): Promise<QueryResult<CourseCategory>> {
    try {
      this.log('Fetching all categories with options:', options);
      
      const categoriesRef = collection(this.db, COLLECTION_NAME);
      const querySnapshot = await getDocs(categoriesRef);
      let categories = querySnapshot.docs.map(doc => this.documentToCategory(doc));

      // Sort in memory by order field
      categories.sort((a, b) => a.order - b.order);

      // Apply limit after sorting if specified
      if (options?.limit) {
        categories = categories.slice(0, options.limit);
      }

      this.log(`Successfully fetched ${categories.length} categories`);

      return {
        data: categories,
        total: categories.length,
        hasMore: options?.limit ? categories.length === options.limit : false
      };
    } catch (error) {
      this.error('Error fetching all categories:', error);
      return { data: [], total: 0, hasMore: false };
    }
  }

  /**
   * Get a single category by ID
   */
  async getById(id: string): Promise<CourseCategory | null> {
    try {
      this.log('Fetching category by ID:', id);
      
      const docRef = doc(this.db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const category = this.documentToCategory(docSnap);
        this.log('Successfully fetched category:', category.name);
        return category;
      } else {
        this.log('Category not found with ID:', id);
        return null;
      }
    } catch (error) {
      this.error('Error fetching category by ID:', error);
      return null;
    }
  }

  /**
   * Get category by name
   */
  async getByName(name: string): Promise<CourseCategory | null> {
    try {
      this.log('Fetching category by name:', name);
      
      const categoriesRef = collection(this.db, COLLECTION_NAME);
      const q = query(
        categoriesRef,
        where('name', '==', name),
        limit(1)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const category = this.documentToCategory(querySnapshot.docs[0]);
        this.log('Successfully fetched category by name:', category.name);
        return category;
      } else {
        this.log('Category not found with name:', name);
        return null;
      }
    } catch (error) {
      this.error('Error fetching category by name:', error);
      return null;
    }
  }

  /**
   * Subscribe to active categories changes in real-time
   */
  subscribeToActiveCategories(callback: (categories: CourseCategory[]) => void): () => void {
    this.log('Subscribing to active categories changes');

    const categoriesRef = collection(this.db, COLLECTION_NAME);
    // Use simple where query without orderBy to avoid index requirements
    const q = query(
      categoriesRef,
      where('isActive', '==', true)
    );

    return onSnapshot(q, (querySnapshot) => {
      try {
        let categories = querySnapshot.docs.map(doc => this.documentToCategory(doc));
        // Sort in memory by order field
        categories.sort((a, b) => a.order - b.order);
        
        this.log(`Received ${categories.length} active categories from subscription`);
        callback(categories);
      } catch (error) {
        this.error('Error in active categories subscription callback:', error);
        callback([]);
      }
    }, (error) => {
      this.error('Error in active categories subscription:', error);
      callback([]);
    });
  }

  /**
   * Subscribe to all categories changes in real-time
   */
  subscribeToAllCategories(callback: (categories: CourseCategory[]) => void): () => void {
    this.log('Subscribing to all categories changes');

    const categoriesRef = collection(this.db, COLLECTION_NAME);
    // No where clause to get all categories
    const q = query(categoriesRef);

    return onSnapshot(q, (querySnapshot) => {
      try {
        let categories = querySnapshot.docs.map(doc => this.documentToCategory(doc));
        // Sort in memory by order field
        categories.sort((a, b) => a.order - b.order);
        
        this.log(`Received ${categories.length} categories from subscription`);
        callback(categories);
      } catch (error) {
        this.error('Error in all categories subscription callback:', error);
        callback([]);
      }
    }, (error) => {
      this.error('Error in all categories subscription:', error);
      callback([]);
    });
  }

  /**
   * Get category names for easy display
   */
  async getCategoryNames(): Promise<string[]> {
    try {
      this.log('Fetching category names');
      
      const result = await this.getActiveCategories();
      const names = result.data.map(category => category.name).sort();
      
      this.log(`Successfully fetched ${names.length} category names`);
      return names;
    } catch (error) {
      this.error('Error fetching category names:', error);
      return [];
    }
  }
}

// Create and export a singleton instance
export const firebaseCategoryService = new FirebaseCategoryService();
