import { useEffect, useState } from 'react';
import type { CourseCategory } from '../lib/category-service';
import { subscribeToActiveCategoriesChanges, subscribeToAllCategoriesChanges } from '../lib/category-service';

export const useCategories = (includeInactive = false) => {
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = includeInactive 
      ? subscribeToAllCategoriesChanges((newCategories) => {
          setCategories(newCategories);
          setLoading(false);
          setError(null);
        })
      : subscribeToActiveCategoriesChanges((newCategories) => {
          setCategories(newCategories);
          setLoading(false);
          setError(null);
        });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [includeInactive]);

  const refreshCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      // Note: Since we're using a subscription, the data will be updated automatically
      // We don't need to manually fetch and set categories here as it could cause duplicates
      // The subscription will handle updates automatically
    } catch (err) {
      setError('Failed to refresh categories');
      console.error('Error refreshing categories:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    loading,
    error,
    refreshCategories
  };
};

export const useActiveCategories = () => {
  return useCategories(false);
};

export const useAllCategories = () => {
  return useCategories(true);
};
