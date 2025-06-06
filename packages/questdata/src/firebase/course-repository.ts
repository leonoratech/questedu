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
    QueryDocumentSnapshot,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import {
    Course,
    CourseQueryOptions,
    CourseSearchCriteria,
    CreateCourseData,
    OperationResult,
    QueryResult,
    UpdateCourseData
} from '../domain';
import { ICourseRepository } from '../repositories';
import { FirebaseAppManager } from './app-manager';

const COLLECTION_NAME = 'courses';

/**
 * Firebase implementation of the course repository
 */
export class FirebaseCourseRepository implements ICourseRepository {
  private appManager = FirebaseAppManager.getInstance();

  private get db() {
    return this.appManager.getDb();
  }

  private get enableLogging() {
    return this.appManager.getConfig().environment.enableDebugLogging;
  }

  private log(message: string, ...args: any[]) {
    if (this.enableLogging) {
      console.log(`[FirebaseCourseRepository] ${message}`, ...args);
    }
  }

  private error(message: string, error: any) {
    console.error(`[FirebaseCourseRepository] ${message}`, error);
  }

  /**
   * Convert Firestore document to Course model
   */
  private documentToCourse(doc: QueryDocumentSnapshot): Course {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      instructor: data.instructor,
      progress: data.progress,
      image: data.image,
      category: data.category,
      description: data.description,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }

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
      const courses = querySnapshot.docs.map(doc => this.documentToCourse(doc));

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

  async getById(id: string): Promise<Course | null> {
    try {
      this.log('Fetching course by ID:', id);
      
      const courseRef = doc(this.db, COLLECTION_NAME, id);
      const docSnapshot = await getDoc(courseRef);

      if (!docSnapshot.exists()) {
        this.log('Course not found:', id);
        return null;
      }

      const course = this.documentToCourse(docSnapshot as QueryDocumentSnapshot);
      this.log('Successfully fetched course:', course.title);
      
      return course;
    } catch (error) {
      this.error('Error fetching course by ID:', error);
      return null;
    }
  }

  async search(criteria: CourseSearchCriteria, options?: CourseQueryOptions): Promise<QueryResult<Course>> {
    try {
      this.log('Searching courses with criteria:', criteria);

      const coursesRef = collection(this.db, COLLECTION_NAME);
      let q = query(coursesRef);

      // Apply category filter if specified
      if (criteria.category) {
        q = query(q, where('category', '==', criteria.category));
      }

      // Apply instructor filter if specified
      if (criteria.instructor) {
        q = query(q, where('instructor', '==', criteria.instructor));
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
          (course.description && course.description.toLowerCase().includes(searchTerm))
        );
      }

      // Apply progress filters
      if (criteria.minProgress !== undefined) {
        courses = courses.filter(course => course.progress >= criteria.minProgress!);
      }
      if (criteria.maxProgress !== undefined) {
        courses = courses.filter(course => course.progress <= criteria.maxProgress!);
      }

      this.log(`Search returned ${courses.length} courses`);

      return {
        data: courses,
        total: courses.length,
        hasMore: false // Client-side filtering makes this hard to determine
      };
    } catch (error) {
      this.error('Error searching courses:', error);
      return { data: [], total: 0, hasMore: false };
    }
  }

  async getByCategory(category: string, options?: CourseQueryOptions): Promise<QueryResult<Course>> {
    try {
      this.log('Fetching courses by category:', category);

      const coursesRef = collection(this.db, COLLECTION_NAME);
      let q = query(
        coursesRef,
        where('category', '==', category)
      );

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

      this.log(`Found ${courses.length} courses in category: ${category}`);

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

  async create(courseData: CreateCourseData): Promise<OperationResult<string>> {
    try {
      this.log('Creating new course:', courseData.title);

      const coursesRef = collection(this.db, COLLECTION_NAME);
      const newCourse = {
        ...courseData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(coursesRef, newCourse);
      
      this.log('Course created successfully with ID:', docRef.id);
      
      return {
        success: true,
        data: docRef.id
      };
    } catch (error: any) {
      this.error('Error creating course:', error);
      
      return {
        success: false,
        error: error?.message || 'Failed to create course',
        code: error?.code
      };
    }
  }

  async update(id: string, updateData: UpdateCourseData): Promise<OperationResult<void>> {
    try {
      this.log('Updating course:', id, updateData);

      const courseRef = doc(this.db, COLLECTION_NAME, id);
      await updateDoc(courseRef, {
        ...updateData,
        updatedAt: Timestamp.now()
      });

      this.log('Course updated successfully:', id);
      
      return { success: true };
    } catch (error: any) {
      this.error('Error updating course:', error);
      
      return {
        success: false,
        error: error?.message || 'Failed to update course',
        code: error?.code
      };
    }
  }

  async delete(id: string): Promise<OperationResult<void>> {
    try {
      this.log('Deleting course:', id);

      const courseRef = doc(this.db, COLLECTION_NAME, id);
      await deleteDoc(courseRef);

      this.log('Course deleted successfully:', id);
      
      return { success: true };
    } catch (error: any) {
      this.error('Error deleting course:', error);
      
      return {
        success: false,
        error: error?.message || 'Failed to delete course',
        code: error?.code
      };
    }
  }

  subscribeToChanges(callback: (courses: Course[]) => void): () => void {
    this.log('Subscribing to course changes');

    const coursesRef = collection(this.db, COLLECTION_NAME);
    const q = query(coursesRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (querySnapshot) => {
      try {
        const courses = querySnapshot.docs.map(doc => this.documentToCourse(doc));
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

  subscribeToSingle(id: string, callback: (course: Course | null) => void): () => void {
    this.log('Subscribing to single course changes:', id);

    const courseRef = doc(this.db, COLLECTION_NAME, id);

    return onSnapshot(courseRef, (doc) => {
      try {
        if (doc.exists()) {
          const course = this.documentToCourse(doc as QueryDocumentSnapshot);
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
}
