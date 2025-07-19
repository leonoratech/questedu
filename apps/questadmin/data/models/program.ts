import { BaseEntity } from './basemodel'

// Program data model interface
export interface Program extends BaseEntity {
  name: string // e.g., "MPC", "HEC", "CEC"
  departmentId: string // Reference to department
  years: number // Duration in years (1, 2, 3, etc.)
  description: string
  medium: 'English' | 'Telugu' // Medium of instruction
}
