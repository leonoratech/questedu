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
  credits?: number // Optional: credit hours for the subject
  prerequisites?: string[] // Optional: prerequisite subject IDs  
}

export interface CreateSubjectRequest {
  name: string
  year: number
  medium: 'English' | 'Telugu'
  instructorId: string
  description?: string
  credits?: number
  prerequisites?: string[]
}

export interface UpdateSubjectRequest extends Partial<CreateSubjectRequest> {
  id: string
}