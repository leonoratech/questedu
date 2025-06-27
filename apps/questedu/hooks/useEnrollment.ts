/**
 * Custom hook for managing course enrollment state and operations
 */

import { useCallback, useEffect, useState } from 'react';
import {
    CourseEnrollment,
    enrollInCourse,
    getUserEnrollments,
    isEnrolledInCourse
} from '../lib/enrollment-service';

export interface UseEnrollmentReturn {
  // State
  enrollments: CourseEnrollment[];
  loading: boolean;
  error: string | null;
  enrolling: boolean;
  
  // Enrollment status checks
  isEnrolled: (courseId: string) => boolean;
  getEnrollmentProgress: (courseId: string) => number;
  
  // Actions
  handleEnrollment: (courseId: string) => Promise<{ success: boolean; error?: string }>;
  refreshEnrollments: () => Promise<void>;
  checkEnrollmentStatus: (courseId: string) => Promise<boolean>;
}

export const useEnrollment = (): UseEnrollmentReturn => {
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);

  // Load user enrollments
  const loadEnrollments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userEnrollments = await getUserEnrollments();
      setEnrollments(userEnrollments);
    } catch (err) {
      console.error('Failed to load enrollments:', err);
      setError('Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if user is enrolled in a specific course
  const isEnrolled = useCallback((courseId: string): boolean => {
    return enrollments.some(enrollment => enrollment.courseId === courseId);
  }, [enrollments]);

  // Get enrollment progress for a course
  const getEnrollmentProgress = useCallback((courseId: string): number => {
    const enrollment = enrollments.find(e => e.courseId === courseId);
    return enrollment?.progress?.completionPercentage || 0;
  }, [enrollments]);

  // Handle course enrollment
  const handleEnrollment = useCallback(async (courseId: string): Promise<{ success: boolean; error?: string }> => {
    console.log('handleEnrollment called with courseId:', courseId);
    
    if (enrolling) {
      console.log('Enrollment already in progress');
      return { success: false, error: 'Enrollment already in progress' };
    }

    if (isEnrolled(courseId)) {
      console.log('User already enrolled in course');
      return { success: false, error: 'Already enrolled in this course' };
    }

    try {
      console.log('Starting enrollment process...');
      setEnrolling(true);
      setError(null);
      
      const result = await enrollInCourse(courseId);
      console.log('Enrollment result:', result);
      
      if (result.success) {
        console.log('Enrollment successful, refreshing enrollments...');
        // Refresh enrollments to include the new enrollment
        await loadEnrollments();
        console.log('Enrollments refreshed');
      }
      
      return result;
    } catch (err) {
      console.error('Error enrolling in course:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to enroll in course';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setEnrolling(false);
    }
  }, [enrolling, isEnrolled, loadEnrollments]);

  // Refresh enrollments
  const refreshEnrollments = useCallback(async () => {
    await loadEnrollments();
  }, [loadEnrollments]);

  // Check enrollment status for a specific course
  const checkEnrollmentStatus = useCallback(async (courseId: string): Promise<boolean> => {
    try {
      return await isEnrolledInCourse(courseId);
    } catch (err) {
      console.error('Error checking enrollment status:', err);
      return false;
    }
  }, []);

  // Load enrollments on hook initialization
  useEffect(() => {
    loadEnrollments();
  }, [loadEnrollments]);

  return {
    enrollments,
    loading,
    error,
    enrolling,
    isEnrolled,
    getEnrollmentProgress,
    handleEnrollment,
    refreshEnrollments,
    checkEnrollmentStatus,
  };
};
