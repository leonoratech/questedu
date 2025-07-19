import { Department } from "@/data/models/department"

export interface CreateDepartmentRequest extends Omit<Department, 'id' | 'createdAt' | 'updatedAt'> {
  name: string
  description?: string
}

export interface UpdateDepartmentRequest extends Partial<CreateDepartmentRequest> {
  id?: string
  isActive?: boolean
}

export interface DepartmentResponse extends Department {}
