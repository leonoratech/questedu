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
  path: ["confirmPassword"],
})

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const ResetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
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

// Export types
export type LoginData = z.infer<typeof LoginSchema>
export type SignupData = z.infer<typeof SignupSchema>
export type ForgotPasswordData = z.infer<typeof ForgotPasswordSchema>
export type ResetPasswordData = z.infer<typeof ResetPasswordSchema>
export type UserProfileData = z.infer<typeof UserProfileSchema>
export type UserRole = z.infer<typeof UserRoleSchema>
