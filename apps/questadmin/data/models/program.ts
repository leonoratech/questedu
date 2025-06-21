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
}

export interface CreateProgramRequest {
  name: string
  yearsOrSemesters: number
  semesterType: 'years' | 'semesters'
  description: string
}

export interface UpdateProgramRequest extends Partial<CreateProgramRequest> {
  id: string
}
