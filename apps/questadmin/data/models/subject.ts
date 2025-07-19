import { BaseEntity } from './basemodel'
// Subject data model interface for program subjects
export interface Subject extends BaseEntity {
  name: string // e.g., "Math", "English", "Civics"
  programId: string
  year: number // Which year this subject belongs to (1, 2, 3, etc.)
  medium: 'English' | 'Telugu' // Medium of instruction
  instructorId: string // UID of the instructor who owns this subject
  instructorName?: string
  description?: string  
}

