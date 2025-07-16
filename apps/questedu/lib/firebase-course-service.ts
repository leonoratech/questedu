/**
 * Firebase Course Service for QuestEdu React Native App
 * Provides CRUD operations and real-time subscriptions for courses
 */

import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
    writeBatch
} from 'firebase/firestore';

import type {
    Course,
    CourseQueryOptions,
    CourseSearchCriteria,
    CreateCourseData,
    OperationResult,
    QueryResult,
    UpdateCourseData
} from '../types/course';
import { getFirestoreDb } from './firebase-config';

const COLLECTION_NAME = 'courses';

/**
 * Firebase Course Service Class
 */
export class FirebaseCourseService {
  private db = getFirestoreDb();
  private enableLogging = __DEV__;

  private log(message: string, ...args: any[]) {
    if (this.enableLogging) {
      console.log(`[FirebaseCourseService] ${message}`, ...args);
    }
  }

  private error(message: string, error: any) {
    console.error(`[FirebaseCourseService] ${message}`, error);
  }

  /**
   * Convert Firestore document to Course model
   */
  private documentToCourse(docSnapshot: any): Course {
    const data = docSnapshot.data();
    return {
      id: docSnapshot.id,
      title: data.title || '',
      description: data.description || '',
      instructor: data.instructor || '',
      instructorId: data.instructorId,
      category: data.category || data.categoryId || '', // Use category name if available, fallback to categoryId
      categoryId: data.categoryId, // Include the category ID reference
      level: data.level,
      price: data.price,
      currency: data.currency,
      duration: data.duration,
      status: data.status,
      isPublished: data.isPublished !== false, // Default to true if not specified
      featured: data.featured || false,
      rating: data.rating || 0,
      ratingCount: data.ratingCount || 0,
      enrollmentCount: data.enrollmentCount || 0,
      tags: data.tags || [],
      skills: data.skills || [],
      prerequisites: data.prerequisites || [],
      courseImage: data.courseImage,
      image: data.image, // Legacy support
      progress: data.progress || 0,
      language: data.language || 'English',
      certificates: data.certificates || false,
      downloadableResources: data.downloadableResources || false,
      mobileAccess: data.mobileAccess !== false, // Default to true
      lastAccessed: data.lastAccessed?.toDate?.() || data.lastAccessed,
      bookmarked: data.bookmarked || false,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
    };
  }

  /**
   * Get all courses
   */
  async getAll(options?: CourseQueryOptions): Promise<QueryResult<Course>> {
    try {
      this.log('Fetching all courses with options:', options);
      
      const coursesRef = collection(this.db, COLLECTION_NAME);
      let q = query(coursesRef);

      // Apply sorting
      if (options?.sortBy) {
        const direction = options.sortOrder === 'asc' ? 'asc' : 'desc';
        q = query(q, orderBy(options.sortBy, direction));
      } else {
        q = query(q, orderBy('createdAt', 'desc'));
      }

      // Apply limit
      if (options?.limit) {
        q = query(q, limit(options.limit));
      }

      const querySnapshot = await getDocs(q);
      let courses = querySnapshot.docs.map(doc => this.documentToCourse(doc));

      // Enrich with category names
      courses = await this.enrichWithCategoryNames(courses);

      this.log(`Successfully fetched ${courses.length} courses`);

      return {
        data: courses,
        total: courses.length,
        hasMore: options?.limit ? courses.length === options.limit : false
      };
    } catch (error) {
      this.error('Error fetching courses:', error);
      return { data: [], total: 0, hasMore: false };
    }
  }

  /**
   * Get a single course by ID
   */
  async getById(id: string): Promise<Course | null> {
    try {
      this.log('Fetching course by ID:', id);
      
      const docRef = doc(this.db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const course = this.documentToCourse(docSnap);
        this.log('Successfully fetched course:', course.title);
        return course;
      } else {
        this.log('Course not found:', id);
        return null;
      }
    } catch (error) {
      this.error('Error fetching course by ID:', error);
      return null;
    }
  }

  /**
   * Search courses
   */
  async search(criteria: CourseSearchCriteria, options?: CourseQueryOptions): Promise<QueryResult<Course>> {
    try {
      this.log('Searching courses with criteria:', criteria);
      
      const coursesRef = collection(this.db, COLLECTION_NAME);
      let q = query(coursesRef);

      // Apply filters
      if (criteria.category) {
        q = query(q, where('category', '==', criteria.category));
      }

      if (criteria.level) {
        q = query(q, where('level', '==', criteria.level));
      }

      if (criteria.featured !== undefined) {
        q = query(q, where('featured', '==', criteria.featured));
      }

      // Apply sorting
      if (options?.sortBy) {
        const direction = options.sortOrder === 'asc' ? 'asc' : 'desc';
        q = query(q, orderBy(options.sortBy, direction));
      } else {
        q = query(q, orderBy('createdAt', 'desc'));
      }

      // Apply limit
      if (options?.limit) {
        q = query(q, limit(options.limit));
      }

      const querySnapshot = await getDocs(q);
      let courses = querySnapshot.docs.map(doc => this.documentToCourse(doc));

      // Client-side filtering for text search (Firestore doesn't support full-text search natively)
      if (criteria.query) {
        const searchTerm = criteria.query.toLowerCase();
        courses = courses.filter(course => 
          course.title.toLowerCase().includes(searchTerm) ||
          course.instructor.toLowerCase().includes(searchTerm) ||
          (course.description && course.description.toLowerCase().includes(searchTerm)) ||
          (course.tags && course.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        );
      }

      // Apply progress filters
      if (criteria.minProgress !== undefined) {
        courses = courses.filter(course => course.progress >= criteria.minProgress!);
      }
      if (criteria.maxProgress !== undefined) {
        courses = courses.filter(course => course.progress <= criteria.maxProgress!);
      }

      // Apply price filters
      if (criteria.minPrice !== undefined) {
        courses = courses.filter(course => (course.price || 0) >= criteria.minPrice!);
      }
      if (criteria.maxPrice !== undefined) {
        courses = courses.filter(course => (course.price || 0) <= criteria.maxPrice!);
      }

      // Apply tag filters
      if (criteria.tags && criteria.tags.length > 0) {
        courses = courses.filter(course => 
          course.tags && course.tags.some(tag => criteria.tags!.includes(tag))
        );
      }

      this.log(`Successfully searched courses: ${courses.length} results`);

      return {
        data: courses,
        total: courses.length,
        hasMore: false // Client-side filtering doesn't support pagination
      };
    } catch (error) {
      this.error('Error searching courses:', error);
      return { data: [], total: 0, hasMore: false };
    }
  }

  /**
   * Get courses by category
   */
  async getByCategory(category: string, options?: CourseQueryOptions): Promise<QueryResult<Course>> {
    try {
      this.log('Fetching courses by category:', category);
      
      const coursesRef = collection(this.db, COLLECTION_NAME);
      let q = query(coursesRef, where('category', '==', category));

      // Apply sorting
      if (options?.sortBy) {
        const direction = options.sortOrder === 'asc' ? 'asc' : 'desc';
        q = query(q, orderBy(options.sortBy, direction));
      } else {
        q = query(q, orderBy('createdAt', 'desc'));
      }

      // Apply limit
      if (options?.limit) {
        q = query(q, limit(options.limit));
      }

      const querySnapshot = await getDocs(q);
      const courses = querySnapshot.docs.map(doc => this.documentToCourse(doc));

      this.log(`Successfully fetched ${courses.length} courses in category: ${category}`);

      return {
        data: courses,
        total: courses.length,
        hasMore: options?.limit ? courses.length === options.limit : false
      };
    } catch (error) {
      this.error('Error fetching courses by category:', error);
      return { data: [], total: 0, hasMore: false };
    }
  }

  /**
   * Create a new course
   */
  async create(courseData: CreateCourseData): Promise<OperationResult<string>> {
    try {
      this.log('Creating new course:', courseData.title);
      
      const coursesRef = collection(this.db, COLLECTION_NAME);
      const timestamp = serverTimestamp();
      
      const newCourse = {
        ...courseData,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      const docRef = await addDoc(coursesRef, newCourse);
      
      this.log('Successfully created course with ID:', docRef.id);
      
      return {
        success: true,
        data: docRef.id,
        message: 'Course created successfully'
      };
    } catch (error) {
      this.error('Error creating course:', error);
      return {
        success: false,
        error: 'Failed to create course'
      };
    }
  }

  /**
   * Update a course
   */
  async update(id: string, updateData: UpdateCourseData): Promise<OperationResult<void>> {
    try {
      this.log('Updating course:', id);
      
      const docRef = doc(this.db, COLLECTION_NAME, id);
      const timestamp = serverTimestamp();
      
      const updates = {
        ...updateData,
        updatedAt: timestamp
      };

      await updateDoc(docRef, updates);
      
      this.log('Successfully updated course:', id);
      
      return {
        success: true,
        message: 'Course updated successfully'
      };
    } catch (error) {
      this.error('Error updating course:', error);
      return {
        success: false,
        error: 'Failed to update course'
      };
    }
  }

  /**
   * Delete a course
   */
  async delete(id: string): Promise<OperationResult<void>> {
    try {
      this.log('Deleting course:', id);
      
      const docRef = doc(this.db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
      
      this.log('Successfully deleted course:', id);
      
      return {
        success: true,
        message: 'Course deleted successfully'
      };
    } catch (error) {
      this.error('Error deleting course:', error);
      return {
        success: false,
        error: 'Failed to delete course'
      };
    }
  }

  /**
   * Subscribe to courses changes in real-time
   */
  subscribeToChanges(callback: (courses: Course[]) => void): () => void {
    this.log('Subscribing to course changes');

    const coursesRef = collection(this.db, COLLECTION_NAME);
    const q = query(coursesRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, async (querySnapshot) => {
      try {
        let courses = querySnapshot.docs.map(doc => this.documentToCourse(doc));
        
        // Enrich with category names
        courses = await this.enrichWithCategoryNames(courses);
        
        this.log(`Received ${courses.length} courses from subscription`);
        callback(courses);
      } catch (error) {
        this.error('Error in subscription callback:', error);
        callback([]);
      }
    }, (error) => {
      this.error('Error in course subscription:', error);
      callback([]);
    });
  }

  /**
   * Subscribe to a single course changes
   */
  subscribeToSingle(id: string, callback: (course: Course | null) => void): () => void {
    this.log('Subscribing to single course changes:', id);

    const docRef = doc(this.db, COLLECTION_NAME, id);

    return onSnapshot(docRef, (docSnap) => {
      try {
        if (docSnap.exists()) {
          const course = this.documentToCourse(docSnap);
          this.log('Received course update:', course.title);
          callback(course);
        } else {
          this.log('Course not found in subscription:', id);
          callback(null);
        }
      } catch (error) {
        this.error('Error in single course subscription:', error);
        callback(null);
      }
    }, (error) => {
      this.error('Error in single course subscription:', error);
      callback(null);
    });
  }

  /**
   * Get featured courses
   */
  async getFeatured(limitCount?: number): Promise<Course[]> {
    try {
      this.log('Fetching featured courses');
      
      const coursesRef = collection(this.db, COLLECTION_NAME);
      let q = query(
        coursesRef,
        where('featured', '==', true),
        orderBy('createdAt', 'desc')
      );

      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const querySnapshot = await getDocs(q);
      const courses = querySnapshot.docs.map(doc => this.documentToCourse(doc));

      this.log(`Successfully fetched ${courses.length} featured courses`);
      return courses;
    } catch (error) {
      this.error('Error fetching featured courses:', error);
      return [];
    }
  }

  /**
   * Get course categories
   */
  async getCategories(): Promise<string[]> {
    try {
      this.log('Fetching course categories');
      
      const coursesRef = collection(this.db, COLLECTION_NAME);
      const querySnapshot = await getDocs(coursesRef);
      
      const categories = new Set<string>();
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.category) {
          categories.add(data.category);
        }
      });

      const categoryList = Array.from(categories).sort();
      this.log(`Successfully fetched ${categoryList.length} categories`);
      return categoryList;
    } catch (error) {
      this.error('Error fetching categories:', error);
      return [];
    }
  }

  /**
   * Batch update courses
   */
  async batchUpdate(updates: Array<{ id: string; data: UpdateCourseData }>): Promise<OperationResult<void>> {
    try {
      this.log('Performing batch update for', updates.length, 'courses');
      
      const batch = writeBatch(this.db);
      const timestamp = serverTimestamp();

      updates.forEach(({ id, data }) => {
        const docRef = doc(this.db, COLLECTION_NAME, id);
        batch.update(docRef, {
          ...data,
          updatedAt: timestamp
        });
      });

      await batch.commit();
      
      this.log('Successfully completed batch update');
      
      return {
        success: true,
        message: 'Batch update completed successfully'
      };
    } catch (error) {
      this.error('Error in batch update:', error);
      return {
        success: false,
        error: 'Failed to complete batch update'
      };
    }
  }

  /**
   * Enrich courses with category names from courseCategories collection
   */
  private async enrichWithCategoryNames(courses: Course[]): Promise<Course[]> {
    try {
      // Get all unique category IDs from courses
      const categoryIds = [...new Set(courses
        .map(course => course.categoryId)
        .filter(Boolean)
      )];

      if (categoryIds.length === 0) {
        return courses;
      }

      // Fetch category names
      const categoriesRef = collection(this.db, 'courseCategories');
      const categoryMap = new Map<string, string>();

      // Firestore 'in' query limit is 10, so batch if needed
      for (let i = 0; i < categoryIds.length; i += 10) {
        const batch = categoryIds.slice(i, i + 10);
        const q = query(categoriesRef, where('__name__', 'in', batch));
        const snapshot = await getDocs(q);
        
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          categoryMap.set(doc.id, data.name);
        });
      }

      // Enrich courses with category names
      return courses.map(course => ({
        ...course,
        category: course.categoryId ? (categoryMap.get(course.categoryId) || course.category) : course.category
      }));
    } catch (error) {
      this.error('Error enriching courses with category names:', error);
      return courses; // Return original courses if enrichment fails
    }
  }
}

// Create and export a singleton instance
export const firebaseCourseService = new FirebaseCourseService();
