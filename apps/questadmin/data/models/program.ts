import { Timestamp } from 'firebase-admin/firestore'

// Program data model interface
export interface Program {
  id?: string
  name: string
  yearsOrSemesters: number
  semesterType: 'years' | 'semesters'
  description: string
  collegeId: string
  isActive: boolean
  createdAt: Date | Timestamp
  updatedAt: Date | Timestamp
  createdBy: string // UID of the user who created the program
  // Extended fields for filtering
  department?: string // Department offering the program
  language?: string // Primary language of instruction
  programCode?: string // Program code/identifier
  category?: string // Program category (e.g., 'Engineering', 'Arts', 'Science')
}

export interface CreateProgramRequest {
  name: string
  yearsOrSemesters: number
  semesterType: 'years' | 'semesters'
  description: string
  collegeId: string
  department?: string
  language?: string
  programCode?: string
  category?: string
}

export interface UpdateProgramRequest extends Partial<CreateProgramRequest> {
  id: string
  isActive?: boolean
}

// Extended program interface that includes batches
export interface ProgramWithBatches extends Program {
  batches?: Array<{
    id: string
    name: string
    startDate: Date
    endDate: Date
    status: string
    currentStudentCount: number
    maxStudents?: number
  }>
}

export interface ProgramStats {
  totalPrograms: number
  activePrograms: number
  inactivePrograms: number
  totalBatches: number
  activeBatches: number
  totalStudents: number
  programsByType: Record<string, number>
}
