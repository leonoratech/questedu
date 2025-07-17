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
    if (__DEV__) {
      console.log('🔍 [useCollegeCourses] Hook triggered with:', {
        userCollegeId: userProfile?.collegeId,
        userProgramId: userProfile?.programId,
        explicitFilters: filters,
        userProfile: userProfile ? {
          uid: userProfile.uid,
          email: userProfile.email,
          collegeId: userProfile.collegeId,
          programId: userProfile.programId,
          role: userProfile.role
        } : null
      });
    }

    // If user doesn't have a college ID, return empty array
    if (!userProfile?.collegeId) {
      if (__DEV__) {
        console.log('❌ [useCollegeCourses] No college association found');
      }
      setCourses([]);
      setLoading(false);
      setError('No college association found');
      return;
    }

    // Auto-apply user's programId if they have one and no explicit programId filter is provided
    const effectiveFilters = { ...filters };
    if (userProfile.programId && !effectiveFilters.programId) {
      if (__DEV__) {
        console.log('🎯 [useCollegeCourses] Auto-applying user programId filter:', userProfile.programId);
      }
      effectiveFilters.programId = userProfile.programId;
    }

    let unsubscribe: (() => void) | undefined;

    const setupSubscription = () => {
      if (effectiveFilters?.programId || effectiveFilters?.yearOrSemester || effectiveFilters?.subjectId) {
        if (__DEV__) {
          console.log('📋 [useCollegeCourses] Using filtered query mode with effective filters:', effectiveFilters);
        }
        // Use filtered query for specific filters
        fetchFilteredCourses();
      } else {
        if (__DEV__) {
          console.log('🔄 [useCollegeCourses] Using subscription mode for all college courses');
        }
        // Use subscription for all college courses
        unsubscribe = subscribeToCollegeCourses(userProfile.collegeId!, (newCourses) => {
          if (__DEV__) {
            console.log('📥 [useCollegeCourses] Received courses from subscription:', newCourses.length);
          }
          
          // If no college-specific courses, fallback to general courses
          if (newCourses.length === 0) {
            if (__DEV__) {
              console.log('📋 [useCollegeCourses] No college courses in subscription, fetching general courses');
            }
            fetchGeneralCoursesFallback();
          } else {
            setCourses(newCourses);
            setLoading(false);
            setError(null);
          }
        });
      }
    };

    const fetchFilteredCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const filterQuery = {
          collegeId: userProfile.collegeId!,
          ...effectiveFilters
        };

        if (__DEV__) {
          console.log('🎯 [useCollegeCourses] Fetching with filter query:', filterQuery);
        }
        
        const filteredCourses = await getCoursesWithFilters(filterQuery);
        
        if (__DEV__) {
          console.log('✅ [useCollegeCourses] Filtered courses result:', {
            count: filteredCourses.length,
            courses: filteredCourses.map(c => ({ 
              id: c.id, 
              title: c.title, 
              association: (c as any).association,
              collegeId: (c as any).collegeId,
              programId: (c as any).programId
            }))
          });
        }

        // If no courses found with filters, fallback to general courses but only if no explicit program filter was applied
        if (filteredCourses.length === 0 && !filters?.programId && !effectiveFilters?.yearOrSemester && !effectiveFilters?.subjectId) {
          if (__DEV__) {
            console.log('📋 [useCollegeCourses] No filtered courses found, falling back to general courses');
          }
          const { getCourses } = await import('../lib/course-service');
          const generalCourses = await getCourses();
          if (__DEV__) {
            console.log('📋 [useCollegeCourses] General courses fallback:', generalCourses.length);
          }
          setCourses(generalCourses);
        } else {
          setCourses(filteredCourses);
        }
      } catch (err) {
        console.error('❌ [useCollegeCourses] Error fetching filtered courses:', err);
        setError('Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    };

    const fetchGeneralCoursesFallback = async () => {
      try {
        if (__DEV__) {
          console.log('📋 [useCollegeCourses] Fetching general courses as fallback');
        }
        const { getCourses } = await import('../lib/course-service');
        const generalCourses = await getCourses();
        if (__DEV__) {
          console.log('📋 [useCollegeCourses] General courses fallback loaded:', generalCourses.length);
        }
        setCourses(generalCourses);
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('❌ [useCollegeCourses] Error fetching general courses fallback:', err);
        setError('Failed to fetch courses');
        setLoading(false);
      }
    };

    setupSubscription();

    // Cleanup subscription on unmount or dependency change
    return () => {
      if (unsubscribe) {
        if (__DEV__) {
          console.log('🧹 [useCollegeCourses] Cleaning up subscription');
        }
        unsubscribe();
      }
    };
  }, [userProfile?.collegeId, userProfile?.programId, filters?.programId, filters?.yearOrSemester, filters?.subjectId]);    const refreshCourses = async () => {
      if (!userProfile?.collegeId) {
        setError('No college association found');
        return;
      }

      // Auto-apply user's programId if they have one and no explicit programId filter is provided
      const effectiveFilters = { ...filters };
      if (userProfile.programId && !effectiveFilters.programId) {
        if (__DEV__) {
          console.log('🎯 [useCollegeCourses] Auto-applying user programId filter on refresh:', userProfile.programId);
        }
        effectiveFilters.programId = userProfile.programId;
      }

      try {
        setLoading(true);
        setError(null);
        
        const filterQuery = {
          collegeId: userProfile.collegeId,
          ...effectiveFilters
        };
        
        if (__DEV__) {
          console.log('🔄 [useCollegeCourses] Refreshing with filter query:', filterQuery);
        }
        
        const refreshedCourses = await getCoursesWithFilters(filterQuery);
        
        if (__DEV__) {
          console.log('🔄 [useCollegeCourses] Refresh result:', refreshedCourses.length, 'courses');
        }

        // If no courses found with filters, fallback to general courses but only if no explicit program filter was applied
        if (refreshedCourses.length === 0 && !filters?.programId && !effectiveFilters?.yearOrSemester && !effectiveFilters?.subjectId) {
          if (__DEV__) {
            console.log('📋 [useCollegeCourses] No filtered courses found on refresh, falling back to general courses');
          }
          const { getCourses } = await import('../lib/course-service');
          const generalCourses = await getCourses();
          if (__DEV__) {
            console.log('📋 [useCollegeCourses] General courses fallback on refresh:', generalCourses.length);
          }
          setCourses(generalCourses);
        } else {
          setCourses(refreshedCourses);
        }
      } catch (err) {
        console.error('❌ [useCollegeCourses] Error refreshing courses:', err);
        setError('Failed to refresh courses');
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
