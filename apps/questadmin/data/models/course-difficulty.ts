export interface CourseDifficulty {
  id: string;
  name: string;
  description?: string;
  level: number; // 1 = Beginner, 2 = Intermediate, 3 = Advanced, 4 = Expert
  color?: string; // For UI display
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseDifficultyInput {
  name: string;
  description?: string;
  level: number;
  color?: string;
  isActive?: boolean;
  order?: number;
}
