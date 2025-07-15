export interface CourseCategory {
  id: string;
  name: string;
  description?: string;
  subcategories?: string[];
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseCategoryInput {
  name: string;
  description?: string;
  subcategories?: string[];
  isActive?: boolean;
  order?: number;
}
