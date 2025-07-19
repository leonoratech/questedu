import { BaseEntity } from './basemodel'

export enum UserRole {
  SUPERADMIN = 'superadmin',
  INSTRUCTOR = 'instructor',
  STUDENT = 'student'
}

export interface UserProfile extends BaseEntity {
  uid: string
  email: string
  firstName: string
  lastName: string
  displayName: string | null
  role: UserRole
  isActive: boolean
  createdAt: Date
  lastLoginAt: Date
  profilePicture?: string
  
  department?: string
  bio?: string  
  description?: string
  
  // Instructor-specific fields
  coreTeachingSkills?: string[]
  additionalTeachingSkills?: string[]
  
  // link to department and program
  departmentId?: string
  programId?: string
  
  // Profile completion status
  profileCompleted?: boolean
}