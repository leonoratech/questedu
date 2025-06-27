/**
 * Enrollment Service for QuestEdu React Native App
 * Performs Firebase operations directly for course enrollment
 */

import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { getFirebaseAuth, getFirestoreDb } from './firebase-config';

// Data models matching questadmin
export const EnrollmentStatus = {
  ENROLLED: 'enrolled',
  COMPLETED: 'completed',
  DROPPED: 'dropped',
  PENDING: 'pending'
} as const;

export type EnrollmentStatusType = typeof EnrollmentStatus[keyof typeof EnrollmentStatus];

export interface CourseProgress {
  completedTopics: string[];
  totalTopics: number;
  completionPercentage: number;
  timeSpent: number; // in minutes
  lastTopicId?: string;
  quizScores: { [topicId: string]: any };
  assignmentSubmissions: { [assignmentId: string]: any };
  bookmarks: string[]; // topic IDs
  notes: { [topicId: string]: string };
}

export interface CourseEnrollment {
  id: string;
  userId: string;
  courseId: string;
  status: EnrollmentStatusType;
  enrolledAt: Date;
  completedAt?: Date;
  lastAccessedAt?: Date;
  progress: CourseProgress;
  paymentId?: string;
  discountApplied?: number;
  finalPrice: number;
  refundRequested?: boolean;
  refundedAt?: Date;
  course?: any; // Course details when populated
}

/**
 * Convert Firestore timestamp to Date
 */
const convertTimestamp = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
  return new Date(timestamp);
};

/**
 * Enroll a student in a course directly via Firebase
 */
export const enrollInCourse = async (courseId: string): Promise<{ success: boolean; error?: string; enrollmentId?: string }> => {
  try {
    console.log('Starting enrollment for course:', courseId);
    
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.error('User not authenticated');
      return { success: false, error: 'User not authenticated. Please log in.' };
    }

    const db = getFirestoreDb();
    
    // Check if course exists and is published
    console.log('Checking course existence and status...');
    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    
    if (!courseSnap.exists()) {
      console.error('Course not found:', courseId);
      return { success: false, error: 'Course not found' };
    }
    
    const courseData = courseSnap.data();
    if (courseData.status !== 'published') {
      console.error('Course not available for enrollment:', courseData.status);
      return { success: false, error: 'Course is not available for enrollment' };
    }

    // Check if user is already enrolled
    console.log('Checking existing enrollment...');
    const enrollmentsRef = collection(db, 'enrollments');
    const existingEnrollmentQuery = query(
      enrollmentsRef,
      where('userId', '==', user.uid),
      where('courseId', '==', courseId)
    );
    const existingEnrollments = await getDocs(existingEnrollmentQuery);

    if (!existingEnrollments.empty) {
      console.log('User already enrolled in course');
      return { success: false, error: 'You are already enrolled in this course' };
    }

    // Create enrollment record
    console.log('Creating enrollment record...');
    const enrollmentData = {
      userId: user.uid,
      courseId: courseId,
      status: EnrollmentStatus.ENROLLED,
      enrolledAt: serverTimestamp(),
      progress: {
        completedTopics: [],
        totalTopics: 0,
        completionPercentage: 0,
        timeSpent: 0,
        quizScores: {},
        assignmentSubmissions: {},
        bookmarks: [],
        notes: {}
      },
      finalPrice: courseData.price || 0,
      discountApplied: 0
    };

    const enrollmentRef = await addDoc(enrollmentsRef, enrollmentData);
    console.log('Enrollment created successfully:', enrollmentRef.id);

    return { 
      success: true, 
      enrollmentId: enrollmentRef.id,
    };
  } catch (error) {
    console.error('Error enrolling in course:', error);
    return { 
      success: false, 
      error: `Enrollment failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
};

/**
 * Get all enrollments for the current user directly from Firebase
 */
export const getUserEnrollments = async (): Promise<CourseEnrollment[]> => {
  try {
    console.log('Fetching user enrollments...');
    
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.error('User not authenticated');
      return [];
    }

    const db = getFirestoreDb();
    const enrollmentsRef = collection(db, 'enrollments');
    const userEnrollmentsQuery = query(
      enrollmentsRef,
      where('userId', '==', user.uid),
      orderBy('enrolledAt', 'desc')
    );
    
    const enrollmentsSnapshot = await getDocs(userEnrollmentsQuery);
    const enrollments: CourseEnrollment[] = [];

    for (const enrollmentDoc of enrollmentsSnapshot.docs) {
      const enrollmentData = enrollmentDoc.data();
      
      // Get course details
      const courseRef = doc(db, 'courses', enrollmentData.courseId);
      const courseSnap = await getDoc(courseRef);
      
      const enrollment: CourseEnrollment = {
        id: enrollmentDoc.id,
        userId: enrollmentData.userId,
        courseId: enrollmentData.courseId,
        status: enrollmentData.status,
        enrolledAt: convertTimestamp(enrollmentData.enrolledAt),
        completedAt: enrollmentData.completedAt ? convertTimestamp(enrollmentData.completedAt) : undefined,
        lastAccessedAt: enrollmentData.lastAccessedAt ? convertTimestamp(enrollmentData.lastAccessedAt) : undefined,
        progress: enrollmentData.progress || {
          completedTopics: [],
          totalTopics: 0,
          completionPercentage: 0,
          timeSpent: 0,
          quizScores: {},
          assignmentSubmissions: {},
          bookmarks: [],
          notes: {}
        },
        paymentId: enrollmentData.paymentId,
        discountApplied: enrollmentData.discountApplied || 0,
        finalPrice: enrollmentData.finalPrice || 0,
        refundRequested: enrollmentData.refundRequested || false,
        refundedAt: enrollmentData.refundedAt ? convertTimestamp(enrollmentData.refundedAt) : undefined,
        course: courseSnap.exists() ? { id: courseSnap.id, ...courseSnap.data() } : null
      };
      
      enrollments.push(enrollment);
    }

    console.log('Fetched', enrollments.length, 'enrollments');
    return enrollments;
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return [];
  }
};

/**
 * Check if user is enrolled in a specific course
 */
export const isEnrolledInCourse = async (courseId: string): Promise<boolean> => {
  try {
    const enrollments = await getUserEnrollments();
    return enrollments.some(enrollment => enrollment.courseId === courseId);
  } catch (error) {
    console.error('Error checking enrollment status:', error);
    return false;
  }
};

/**
 * Get specific enrollment for a course
 */
export const getCourseEnrollment = async (courseId: string): Promise<CourseEnrollment | null> => {
  try {
    const enrollments = await getUserEnrollments();
    return enrollments.find(enrollment => enrollment.courseId === courseId) || null;
  } catch (error) {
    console.error('Error getting course enrollment:', error);
    return null;
  }
};

/**
 * Update enrollment progress directly in Firebase
 */
export const updateEnrollmentProgress = async (
  enrollmentId: string, 
  progress: Partial<CourseProgress>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const db = getFirestoreDb();
    const enrollmentRef = doc(db, 'enrollments', enrollmentId);
    
    // Update the enrollment progress
    await updateDoc(enrollmentRef, {
      progress: progress,
      lastAccessedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating enrollment progress:', error);
    return { success: false, error: 'Failed to update progress' };
  }
};
