import { CourseCategory, CourseCategoryInput } from '../models/course-category';
import { BaseRepository } from './base-service';

export class CourseCategoryRepository extends BaseRepository<CourseCategory> {
  constructor() {
    super('courseCategories');
  }

  async createCategory(input: CourseCategoryInput): Promise<CourseCategory> {
    const categoryData: Omit<CourseCategory, 'id' | 'createdAt' | 'updatedAt'> = {
      ...input,
      isActive: input.isActive ?? true,
      order: input.order ?? 0
    };

    return await this.create(categoryData as CourseCategory);
  }

  async updateCategory(id: string, input: Partial<CourseCategoryInput>): Promise<CourseCategory> {
    return await this.update(id, input as Partial<CourseCategory>);
  }

  async getActiveCategories(): Promise<CourseCategory[]> {
    const categories = await this.firestore
      .collection(this.collectionName)
      .where('isActive', '==', true)
      .get();

    return categories.docs
      .map((doc: any) => ({ id: doc.id, ...doc.data() } as CourseCategory))
      .sort((a, b) => a.order - b.order);
  }

  async getCategoryByName(name: string): Promise<CourseCategory | null> {
    const categories = await this.firestore
      .collection(this.collectionName)
      .where('name', '==', name)
      .limit(1)
      .get();

    if (categories.empty) {
      return null;
    }

    const doc = categories.docs[0];
    return { id: doc.id, ...doc.data() } as CourseCategory;
  }

  async toggleCategoryStatus(id: string): Promise<CourseCategory> {
    const category = await this.getById(id);
    
    return await this.update(id, {
      isActive: !category.isActive
    } as Partial<CourseCategory>);
  }
}
