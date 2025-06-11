import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import type { Course, CourseTopic, User } from '../models/data-model';
import { getFirestoreDb } from './questdata-config';

/**
 * Firebase service for course operations
 */
export class CourseService {
  private db = getFirestoreDb();
  private collection = 'courses';

  async getCourse(id: string): Promise<Course | null> {
    try {
      const docRef = doc(this.db, this.collection, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data
        } as Course;
      }
      return null;
    } catch (error) {
      console.error('Error getting course:', error);
      throw error;
    }
  }

  async getCourses(options?: {
    instructorId?: string;
    status?: string;
    level?: string;
    limit?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
  }): Promise<Course[]> {
    try {
      let baseQuery = collection(this.db, this.collection);
      let queryConstraints: any[] = [];
      
      // Apply filters
      if (options?.instructorId) {
        queryConstraints.push(where('instructorId', '==', options.instructorId));
      }
      if (options?.status) {
        queryConstraints.push(where('status', '==', options.status));
      }
      if (options?.level) {
        queryConstraints.push(where('level', '==', options.level));
      }
      
      // Apply ordering
      if (options?.orderBy) {
        queryConstraints.push(orderBy(options.orderBy, options.orderDirection || 'asc'));
      }
      
      // Apply limit
      if (options?.limit) {
        queryConstraints.push(limit(options.limit));
      }

      const q = queryConstraints.length > 0 ? query(baseQuery, ...queryConstraints) : baseQuery;
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data
        } as Course;
      });
    } catch (error) {
      console.error('Error getting courses:', error);
      throw error;
    }
  }

  async createCourse(course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = doc(collection(this.db, this.collection));
      const now = Timestamp.now();
      
      const courseData = {
        ...course,
        createdAt: now,
        updatedAt: now
      };

      await setDoc(docRef, courseData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }

  async updateCourse(id: string, updates: Partial<Omit<Course, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const docRef = doc(this.db, this.collection, id);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      };

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  }

  async deleteCourse(id: string): Promise<void> {
    try {
      const docRef = doc(this.db, this.collection, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  }
}

/**
 * Firebase service for user operations
 */
export class UserService {
  private db = getFirestoreDb();
  private collection = 'users';

  async getUser(id: string): Promise<User | null> {
    try {
      const docRef = doc(this.db, this.collection, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data
        } as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const q = query(collection(this.db, this.collection), where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0];
        const data = docData.data();
        return {
          id: docData.id,
          ...data
        } as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  async getUsers(options?: {
    role?: string;
    isActive?: boolean;
    limit?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
  }): Promise<User[]> {
    try {
      let baseQuery = collection(this.db, this.collection);
      let queryConstraints: any[] = [];
      
      // Apply filters
      if (options?.role) {
        queryConstraints.push(where('role', '==', options.role));
      }
      if (options?.isActive !== undefined) {
        queryConstraints.push(where('isActive', '==', options.isActive));
      }
      
      // Apply ordering
      if (options?.orderBy) {
        queryConstraints.push(orderBy(options.orderBy, options.orderDirection || 'asc'));
      }
      
      // Apply limit
      if (options?.limit) {
        queryConstraints.push(limit(options.limit));
      }

      const q = queryConstraints.length > 0 ? query(baseQuery, ...queryConstraints) : baseQuery;
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data
        } as User;
      });
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  }

  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = doc(collection(this.db, this.collection));
      const now = Timestamp.now();
      
      const userData = {
        ...user,
        createdAt: now,
        updatedAt: now
      };

      await setDoc(docRef, userData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const docRef = doc(this.db, this.collection, id);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      };

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      const docRef = doc(this.db, this.collection, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}

/**
 * Firebase service for course topic operations
 */
export class CourseTopicService {
  private db = getFirestoreDb();
  private collection = 'course_topics';

  async getCourseTopic(id: string): Promise<CourseTopic | null> {
    try {
      const docRef = doc(this.db, this.collection, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data
        } as CourseTopic;
      }
      return null;
    } catch (error) {
      console.error('Error getting course topic:', error);
      throw error;
    }
  }

  async getCourseTopics(courseId?: string): Promise<CourseTopic[]> {
    try {
      let baseQuery = collection(this.db, this.collection);
      let queryConstraints: any[] = [];
      
      if (courseId) {
        queryConstraints.push(where('courseId', '==', courseId));
      }
      
      queryConstraints.push(orderBy('order', 'asc'));

      const q = queryConstraints.length > 0 ? query(baseQuery, ...queryConstraints) : baseQuery;
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data
        } as CourseTopic;
      });
    } catch (error) {
      console.error('Error getting course topics:', error);
      throw error;
    }
  }

  async createCourseTopic(topic: Omit<CourseTopic, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = doc(collection(this.db, this.collection));
      const now = Timestamp.now();
      
      const topicData = {
        ...topic,
        createdAt: now,
        updatedAt: now
      };

      await setDoc(docRef, topicData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating course topic:', error);
      throw error;
    }
  }

  async updateCourseTopic(id: string, updates: Partial<Omit<CourseTopic, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const docRef = doc(this.db, this.collection, id);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      };

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating course topic:', error);
      throw error;
    }
  }

  async deleteCourseTopic(id: string): Promise<void> {
    try {
      const docRef = doc(this.db, this.collection, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting course topic:', error);
      throw error;
    }
  }
}

// Service instances
let courseService: CourseService | null = null;
let userService: UserService | null = null;
let courseTopicService: CourseTopicService | null = null;

/**
 * Get course service instance
 */
export function getCourseService(): CourseService {
  if (!courseService) {
    courseService = new CourseService();
  }
  return courseService;
}

/**
 * Get user service instance
 */
export function getUserService(): UserService {
  if (!userService) {
    userService = new UserService();
  }
  return userService;
}

/**
 * Get course topic service instance
 */
export function getCourseTopicService(): CourseTopicService {
  if (!courseTopicService) {
    courseTopicService = new CourseTopicService();
  }
  return courseTopicService;
}
