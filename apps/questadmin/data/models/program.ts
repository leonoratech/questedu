import { Timestamp } from 'firebase-admin/firestore'

// Program data model interface
export interface Program {
  id?: string
  name: string // e.g., "MPC", "HEC", "CEC"
  departmentId: string // Reference to department
  years: number // Duration in years (1, 2, 3, etc.)
  description: string
  collegeId: string
  isActive: boolean
  createdAt: Date | Timestamp
  updatedAt: Date | Timestamp
  createdBy: string
  medium: 'English' | 'Telugu' // Medium of instruction
}

export interface CreateProgramRequest {
  name: string
  departmentId: string
  years: number
  description: string
  collegeId: string
  medium: 'English' | 'Telugu'
}

export interface UpdateProgramRequest extends Partial<CreateProgramRequest> {
  id: string
  isActive?: boolean
}
