import { Department } from '@/data/models/department'
import { BaseService } from './base-service'

class DepartmentService extends BaseService<Department> {
  constructor() {
    super('departments')
  }

  async getDepartments(): Promise<Department[]> {
    return this.getAll()
  }
}

export const departmentService = new DepartmentService()
