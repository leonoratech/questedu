// Simple version without any questdata imports

type Course = {
  id?: string
  title: string
  instructor: string
  progress: number
  image: string
  category?: string
  description?: string
  createdAt?: Date
  updatedAt?: Date
}

// Get all courses
export const getCourses = async (): Promise<Course[]> => {
  return []
}

export const addCourse = async (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
  return null
}

export const updateCourse = async (courseId: string, updates: Partial<Course>): Promise<boolean> => {
  return false
}

export const deleteCourse = async (courseId: string): Promise<boolean> => {
  return false
}

export const searchCourses = async (searchTerm: string): Promise<Course[]> => {
  return []
}
