// Program data model interface
export interface Program {
  id?: string
  name: string
  yearsOrSemesters: number
  semesterType: 'years' | 'semesters'
  description: string
  collegeId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
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
  department?: string
  language?: string
  programCode?: string
  category?: string
}

export interface UpdateProgramRequest extends Partial<CreateProgramRequest> {
  id: string
}
