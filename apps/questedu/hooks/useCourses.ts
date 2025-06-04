import { useEffect, useState } from 'react';
import { Course, getCourses, getCoursesByCategory, searchCourses, subscribeToCoursesChanges } from '../firebase/courseService';

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
      const fetchedCourses = await getCourses();
      setCourses(fetchedCourses);
      setError(null);
    } catch (err) {
      setError('Failed to fetch courses');
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
