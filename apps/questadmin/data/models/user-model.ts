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
  
  // link to department and program
  department?: string
  departmentId?: string
  programId?: string // Reference to program document ID
  programName?: string // Cached for display

  bio?: string  
  description?: string
  // Instructor-specific fields
  mainSubjects?: string[]
  
  // Profile completion status
  profileCompleted?: boolean
}