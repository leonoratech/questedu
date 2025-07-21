import { z } from 'zod'

// User Role validation
export const UserRoleSchema = z.enum(['superadmin', 'instructor', 'student'])

// Authentication schemas
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const SignupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: UserRoleSchema,
  departmentId: z.string().optional(),
  programId: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const ResetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// User Profile schemas
export const UserProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  displayName: z.string().optional(),
  bio: z.string().optional(),
  description: z.string().optional(),
  departmentId: z.string().optional(),
  programId: z.string().optional(),
  mainSubjects: z.array(z.string()).optional(),
  profilePicture: z.string().optional(),
})

// College management schemas
export const CollegeSchema = z.object({
  name: z.string().min(1, 'College name is required'),
  accreditation: z.string().min(1, 'Accreditation is required'),
  affiliation: z.string().min(1, 'Affiliation is required'),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
  }),
  contact: z.object({
    phone: z.string().min(1, 'Phone number is required'),
    email: z.string().email('Invalid email address'),
    website: z.string().url('Invalid website URL'),
  }),
  website: z.string().url('Invalid website URL'),
  principalName: z.string().min(1, 'Principal name is required'),
  description: z.string().min(1, 'Description is required'),
})

// Department schema
export const DepartmentSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  description: z.string().optional(),
})

// Program schema
export const ProgramSchema = z.object({
  name: z.string().min(1, 'Program name is required'),
  departmentId: z.string().min(1, 'Department is required'),
  years: z.number().int().min(1).max(10),
  description: z.string().min(1, 'Description is required'),
  medium: z.enum(['English', 'Telugu']),
})

// Subject schema
export const SubjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required'),
  programId: z.string().min(1, 'Program is required'),
  year: z.number().int().min(1),
  medium: z.enum(['English', 'Telugu']),
  instructorId: z.string().min(1, 'Instructor is required'),
  instructorName: z.string().optional(),
  description: z.string().optional(),
})

// Export types
export type LoginData = z.infer<typeof LoginSchema>
export type SignupData = z.infer<typeof SignupSchema>
export type ForgotPasswordData = z.infer<typeof ForgotPasswordSchema>
export type UserProfileData = z.infer<typeof UserProfileSchema>
export type CollegeData = z.infer<typeof CollegeSchema>
export type DepartmentData = z.infer<typeof DepartmentSchema>
export type ProgramData = z.infer<typeof ProgramSchema>
export type SubjectData = z.infer<typeof SubjectSchema>
