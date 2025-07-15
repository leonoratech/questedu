import { CourseDifficulty, CourseDifficultyInput } from '../models/course-difficulty';
import { BaseRepository } from './base-service';

export class CourseDifficultyRepository extends BaseRepository<CourseDifficulty> {
  constructor() {
    super('courseDifficulties');
  }

  async createDifficulty(input: CourseDifficultyInput): Promise<CourseDifficulty> {
    const difficultyData: Omit<CourseDifficulty, 'id' | 'createdAt' | 'updatedAt'> = {
      ...input,
      isActive: input.isActive ?? true,
      order: input.order ?? input.level
    };

    return await this.create(difficultyData as CourseDifficulty);
  }

  async updateDifficulty(id: string, input: Partial<CourseDifficultyInput>): Promise<CourseDifficulty> {
    return await this.update(id, input as Partial<CourseDifficulty>);
  }

  async getActiveDifficulties(): Promise<CourseDifficulty[]> {
    const difficulties = await this.firestore
      .collection(this.collectionName)
      .where('isActive', '==', true)
      .get();

    return difficulties.docs
      .map((doc: any) => ({ id: doc.id, ...doc.data() } as CourseDifficulty))
      .sort((a, b) => a.order - b.order);
  }

  async getDifficultyByName(name: string): Promise<CourseDifficulty | null> {
    const difficulties = await this.firestore
      .collection(this.collectionName)
      .where('name', '==', name)
      .limit(1)
      .get();

    if (difficulties.empty) {
      return null;
    }

    const doc = difficulties.docs[0];
    return { id: doc.id, ...doc.data() } as CourseDifficulty;
  }

  async getDifficultyByLevel(level: number): Promise<CourseDifficulty | null> {
    const difficulties = await this.firestore
      .collection(this.collectionName)
      .where('level', '==', level)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (difficulties.empty) {
      return null;
    }

    const doc = difficulties.docs[0];
    return { id: doc.id, ...doc.data() } as CourseDifficulty;
  }

  async toggleDifficultyStatus(id: string): Promise<CourseDifficulty> {
    const difficulty = await this.getById(id);
    
    return await this.update(id, {
      isActive: !difficulty.isActive
    } as Partial<CourseDifficulty>);
  }
}
