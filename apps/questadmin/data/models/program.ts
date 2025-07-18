import { Timestamp } from 'firebase-admin/firestore'

// Program data model interface
export interface Program {
  id?: string
  name: string
  departmentId: string // NEW: reference to department
  years: number // duration in years
  description: string
  collegeId: string
  isActive: boolean
  createdAt: Date | Timestamp
  updatedAt: Date | Timestamp
  createdBy: string
  medium: 'English' | 'Telugu' // NEW: medium of instruction
}

export interface CreateProgramRequest {
  name: string
  departmentId: string // NEW
  years: number
  description: string
  collegeId: string
  medium: 'English' | 'Telugu'
}

export interface UpdateProgramRequest extends Partial<CreateProgramRequest> {
  id: string
  isActive?: boolean
}
