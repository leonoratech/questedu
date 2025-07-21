import Joi from 'joi'

// User Role validation
export const UserRoleSchema = Joi.string().valid('superadmin', 'instructor', 'student')

// Authentication schemas
export const LoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
})

export const SignupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().min(6).required(),
  firstName: Joi.string().min(1).required(),
  lastName: Joi.string().min(1).required(),
  role: UserRoleSchema.required(),
  departmentId: Joi.string().optional(),
  programId: Joi.string().optional(),
}).custom((value, helpers) => {
  if (value.password !== value.confirmPassword) {
    return helpers.error('any.invalid', { message: "Passwords don't match" })
  }
  return value
})

export const ForgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
})

export const ResetPasswordSchema = Joi.object({
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().min(6).required(),
}).custom((value, helpers) => {
  if (value.password !== value.confirmPassword) {
    return helpers.error('any.invalid', { message: "Passwords don't match" })
  }
  return value
})

// User Profile schemas
export const UserProfileSchema = Joi.object({
  firstName: Joi.string().min(1).required(),
  lastName: Joi.string().min(1).required(),
  displayName: Joi.string().optional(),
  bio: Joi.string().optional(),
  description: Joi.string().optional(),
  departmentId: Joi.string().optional(),
  programId: Joi.string().optional(),
  mainSubjects: Joi.array().items(Joi.string()).optional(),
  profilePicture: Joi.string().optional(),
})

// College management schemas
export const CollegeSchema = Joi.object({
  name: Joi.string().required(),
  accreditation: Joi.string().required(),
  affiliation: Joi.string().required(),
  address: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().required(),
    postalCode: Joi.string().required(),
  }).required(),
  contact: Joi.object({
    phone: Joi.string().required(),
    email: Joi.string().email().required(),
    website: Joi.string().uri().required(),
  }).required(),
  website: Joi.string().uri().required(),
  principalName: Joi.string().required(),
  description: Joi.string().required(),
})

// Department schema
export const DepartmentSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
})

// Program schema
export const ProgramSchema = Joi.object({
  name: Joi.string().required(),
  departmentId: Joi.string().required(),
  years: Joi.number().integer().min(1).max(10).required(),
  description: Joi.string().required(),
  medium: Joi.string().valid('English', 'Telugu').required(),
})

// Subject schema
export const SubjectSchema = Joi.object({
  name: Joi.string().required(),
  programId: Joi.string().required(),
  year: Joi.number().integer().min(1).required(),
  medium: Joi.string().valid('English', 'Telugu').required(),
  instructorId: Joi.string().required(),
  instructorName: Joi.string().optional(),
  description: Joi.string().optional(),
})
