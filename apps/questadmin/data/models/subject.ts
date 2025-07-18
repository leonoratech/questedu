// Subject data model interface for program subjects
export interface Subject {
  id?: string
  name: string
  programId: string
  collegeId: string
  year: number // Which year this subject belongs to
  medium: 'English' | 'Telugu' // NEW: medium of instruction
  instructorId: string // UID of the instructor who owns this subject
  instructorName?: string
  description?: string
  credits?: number // Optional: credit hours for the subject
  prerequisites?: string[] // Optional: prerequisite subject IDs
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string // UID of the user who created the subject
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

// Enhanced program interface that includes subjects
export interface ProgramWithSubjects {
  id?: string
  name: string
  yearsOrSemesters: number
  semesterType: 'years' | 'semesters'
  description: string
  collegeId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
  subjects?: Subject[] // Associated subjects grouped by year/semester
}

// Helper type for organizing subjects by year/semester
export interface SubjectsByPeriod {
  [yearOrSemester: number]: Subject[]
}

// Instructor selection interface for dropdowns
export interface InstructorOption {
  id: string
  name: string
  email: string
  department?: string
}

// No batch-related types present, but ensure no batch references remain
