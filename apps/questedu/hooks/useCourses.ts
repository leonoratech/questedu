import { useEffect, useState } from 'react';
import { getCoursesByCategory, searchCourses, subscribeToCoursesChanges } from '../lib/course-service';
import type { Course } from '../types/course';

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToCoursesChanges((newCourses) => {
      setCourses(newCourses);
      setLoading(false);
      setError(null);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const refreshCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      // Note: Since we're using a subscription, the data will be updated automatically
      // We don't need to manually fetch and set courses here as it could cause duplicates
      // The subscription will handle updates automatically
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
    refreshCourses
  };
};

export const useCoursesSearch = () => {
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [searching, setSearching] = useState(false);

  const searchCoursesByQuery = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const results = await searchCourses(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching courses:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  return {
    searchResults,
    searching,
    searchCoursesByQuery
  };
};

export const useCoursesByCategory = (category: string) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!category || category === 'All') {
      setCourses([]);
      return;
    }

    const fetchCoursesByCategory = async () => {
      try {
        setLoading(true);
        const filteredCourses = await getCoursesByCategory(category);
        setCourses(filteredCourses);
      } catch (error) {
        console.error('Error fetching courses by category:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesByCategory();
  }, [category]);

  return {
    courses,
    loading
  };
};
