import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getCoursesWithFilters, subscribeToCollegeCourses } from '../lib/course-service';
import type { Course } from '../types/course';

interface CourseFilters {
  programId?: string;
  yearOrSemester?: number;
  subjectId?: string;
}

export const useCollegeCourses = (filters?: CourseFilters) => {
  const { userProfile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If user doesn't have a college ID, return empty array
    if (!userProfile?.collegeId) {
      setCourses([]);
      setLoading(false);
      setError('No college association found');
      return;
    }

    let unsubscribe: (() => void) | undefined;

    const setupSubscription = () => {
      if (filters?.programId || filters?.yearOrSemester || filters?.subjectId) {
        // Use filtered query for specific filters
        fetchFilteredCourses();
      } else {
        // Use subscription for all college courses
        unsubscribe = subscribeToCollegeCourses(userProfile.collegeId!, (newCourses) => {
          setCourses(newCourses);
          setLoading(false);
          setError(null);
        });
      }
    };

    const fetchFilteredCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const filterQuery = {
          collegeId: userProfile.collegeId!,
          ...filters
        };
        
        const filteredCourses = await getCoursesWithFilters(filterQuery);
        setCourses(filteredCourses);
      } catch (err) {
        setError('Failed to fetch courses');
        console.error('Error fetching filtered courses:', err);
      } finally {
        setLoading(false);
      }
    };

    setupSubscription();

    // Cleanup subscription on unmount or dependency change
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userProfile?.collegeId, filters?.programId, filters?.yearOrSemester, filters?.subjectId]);

  const refreshCourses = async () => {
    if (!userProfile?.collegeId) {
      setError('No college association found');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const filterQuery = {
        collegeId: userProfile.collegeId,
        ...filters
      };
      
      const refreshedCourses = await getCoursesWithFilters(filterQuery);
      setCourses(refreshedCourses);
    } catch (err) {
      setError('Failed to refresh courses');
      console.error('Error refreshing courses:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    courses,
    loading,
    error,
    refreshCourses,
    hasCollegeAssociation: !!userProfile?.collegeId
  };
};
