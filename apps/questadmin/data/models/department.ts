import { BaseEntity } from "./basemodel"

// Department data model interface
export interface Department extends BaseEntity{
  name: 'Arts' | 'Science' | 'Vocational' // Restricted to specific departments
  description?: string  
}

export interface CreateDepartmentRequest {
  name: 'Arts' | 'Science' | 'Vocational'
  description?: string
}

export interface UpdateDepartmentRequest extends Partial<CreateDepartmentRequest> {
  id?: string
  isActive?: boolean
}
