// Department data model interface
export interface Department {
  id: string
  name: 'Arts' | 'Science' | 'Vocational' // Restricted to specific departments
  collegeId: string
  description?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface CreateDepartmentRequest {
  name: 'Arts' | 'Science' | 'Vocational'
  collegeId: string
  description?: string
}

export interface UpdateDepartmentRequest extends Partial<CreateDepartmentRequest> {
  id: string
  isActive?: boolean
}
