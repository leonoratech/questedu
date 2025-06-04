import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { db } from './config';

export interface Course {
  id?: string;
  title: string;
  instructor: string;
  progress: number;
  image: string;
  category?: string;
  description?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const COLLECTION_NAME = 'courses';

// Get all courses
export const getCourses = async (): Promise<Course[]> => {
  try {
    const coursesRef = collection(db, COLLECTION_NAME);
    const q = query(coursesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Course));
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
};

// Listen to courses changes in real-time
export const subscribeToCoursesChanges = (callback: (courses: Course[]) => void) => {
  const coursesRef = collection(db, COLLECTION_NAME);
  const q = query(coursesRef, orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (querySnapshot) => {
    const courses = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Course));
    callback(courses);
  }, (error) => {
    console.error('Error listening to courses changes:', error);
    callback([]);
  });
};

// Add a new course
export const addCourse = async (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
  try {
    console.log('📝 Adding course to Firestore:', course.title);
    console.log('🔗 Database instance:', db ? 'Connected' : 'Not connected');
    
    const coursesRef = collection(db, COLLECTION_NAME);
    console.log('📁 Collection reference created:', COLLECTION_NAME);
    
    const newCourse = {
      ...course,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    console.log('📄 Course data prepared:', newCourse);
    
    const docRef = await addDoc(coursesRef, newCourse);
    console.log('✅ Course added successfully with ID:', docRef.id);
    
    return docRef.id;
  } catch (error: any) {
    console.error('❌ Error adding course:', error);
    console.error('Error code:', error?.code);
    console.error('Error message:', error?.message);
    throw error; // Re-throw to let the caller handle it
  }
};

// Update a course
export const updateCourse = async (courseId: string, updates: Partial<Course>): Promise<boolean> => {
  try {
    const courseRef = doc(db, COLLECTION_NAME, courseId);
    await updateDoc(courseRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    return true;
  } catch (error) {
    console.error('Error updating course:', error);
    return false;
  }
};

// Delete a course
export const deleteCourse = async (courseId: string): Promise<boolean> => {
  try {
    const courseRef = doc(db, COLLECTION_NAME, courseId);
    await deleteDoc(courseRef);
    return true;
  } catch (error) {
    console.error('Error deleting course:', error);
    return false;
  }
};

// Search courses by title or instructor
export const searchCourses = async (searchTerm: string): Promise<Course[]> => {
  try {
    const coursesRef = collection(db, COLLECTION_NAME);
    const querySnapshot = await getDocs(coursesRef);
    
    // Filter on client side for simplicity (Firestore doesn't support full-text search natively)
    const courses = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Course));
    
    return courses.filter(course => 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching courses:', error);
    return [];
  }
};

// Get courses by category
export const getCoursesByCategory = async (category: string): Promise<Course[]> => {
  try {
    const coursesRef = collection(db, COLLECTION_NAME);
    const q = query(
      coursesRef, 
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Course));
  } catch (error) {
    console.error('Error fetching courses by category:', error);
    return [];
  }
};
