// Department data model interface
export interface Department {
  id: string
  name: string // e.g., "Arts", "Science", "Vocational"
  collegeId: string
  description?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface CreateDepartmentRequest {
  name: string
  collegeId: string
  description?: string
}

export interface UpdateDepartmentRequest extends Partial<CreateDepartmentRequest> {
  id: string
  isActive?: boolean
}
