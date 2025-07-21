import { College } from '@/data/models/college'
import { BaseService } from './base-service'

class CollegeService extends BaseService<College> {
  constructor() {
    super('colleges')
  }
}

export const collegeService = new CollegeService()
