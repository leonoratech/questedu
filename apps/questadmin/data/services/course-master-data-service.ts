import { getAuthHeaders } from '@/data/config/firebase-auth';
import { CourseCategory } from '@/data/models/course-category';
import { CourseDifficulty } from '@/data/models/course-difficulty';


export async function getCategoryName(categoryId: string): Promise<string> {
  try {
    const response = await fetch('/api/master-data', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    })
    if (!response.ok) {
      return 'Unknown Category'
    }
    const data = await response.json()
    const category = data.categories.find((c: any) => c.id === categoryId)
    return category?.name || 'Unknown Category'
  } catch (error) {
    console.error('Error fetching category name:', error)
    return 'Unknown Category'
  }
}

export async function getDifficultyName(difficultyId: string): Promise<string> {
  try {
    const response = await fetch('/api/master-data', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    })
    if (!response.ok) {
      return 'Unknown Difficulty'
    }
    const data = await response.json()
    const difficulty = data.difficulties.find((d: any) => d.id === difficultyId)
    return difficulty?.name || 'Unknown Difficulty'
  } catch (error) {
    console.error('Error fetching difficulty name:', error)
    return 'Unknown Difficulty'
  }
}

// Client-side functions for fetching master data via API
export async function getMasterData(): Promise<{ categories: CourseCategory[], difficulties: CourseDifficulty[] }> {
  try {
    const response = await fetch('/api/master-data', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch master data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching master data:', error);
    return { categories: [], difficulties: [] };
  }
}

// Backward compatibility exports for existing components
export async function getCourseCategories(): Promise<CourseCategory[]> {
  try {
    const { categories } = await getMasterData();
    return categories;
  } catch (error) {
    console.error('Error fetching course categories:', error);
    return [];
  }
}

export async function getCourseDifficulties(): Promise<CourseDifficulty[]> {
  try {
    const { difficulties } = await getMasterData();
    return difficulties;
  } catch (error) {
    console.error('Error fetching course difficulties:', error);
    return [];
  }
}

export async function fetchCategoriesAndDifficulties(): Promise<{
  categories: CourseCategory[],
  difficulties: CourseDifficulty[]
}> {
  return await getMasterData();
}
