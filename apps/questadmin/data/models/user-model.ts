import { BaseEntity } from './data-model';
// User roles
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
  
  // Role-specific fields
  // Common fields for both instructor and student
  collegeId?: string  // Reference to college document ID
  college?: string    // Legacy field for backward compatibility
  description?: string
  
  // Instructor-specific fields
  coreTeachingSkills?: string[]
  additionalTeachingSkills?: string[]
  
  // Student-specific fields
  mainSubjects?: string[]
  class?: string
  
  // Profile completion status
  profileCompleted?: boolean
}