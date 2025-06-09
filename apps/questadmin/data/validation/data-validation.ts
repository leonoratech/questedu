/**
 * Data Validation Utilities for QuestEdu Admin
 * 
 * Provides runtime validation for data models and type checking utilities
 */

import {
    Assignment,
    AssignmentType,
    Course,
    CourseLevel,
    CourseStatus,
    CourseTopic,
    MaterialType,
    Quiz,
    User,
    UserRole
} from '../models/data-models'

/**
 * Validation error class
 */
export class ValidationError extends Error {
  public field: string
  public value: any
  
  constructor(field: string, value: any, message: string) {
    super(`Validation error for field '${field}': ${message}`)
    this.field = field
    this.value = value
    this.name = 'ValidationError'
  }
}

/**
 * Base validator class
 */
export abstract class BaseValidator<T> {
  abstract validate(data: T): ValidationResult
  
  protected isRequired(value: any, fieldName: string): void {
    if (value === undefined || value === null || value === '') {
      throw new ValidationError(fieldName, value, 'Field is required')
    }
  }
  
  protected isEmail(value: string, fieldName: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      throw new ValidationError(fieldName, value, 'Invalid email format')
    }
  }
  
  protected isUrl(value: string, fieldName: string): void {
    try {
      new URL(value)
    } catch {
      throw new ValidationError(fieldName, value, 'Invalid URL format')
    }
  }
  
  protected isPositiveNumber(value: number, fieldName: string): void {
    if (typeof value !== 'number' || value < 0) {
      throw new ValidationError(fieldName, value, 'Must be a positive number')
    }
  }
  
  protected isInEnum<T>(value: T, enumObject: any, fieldName: string): void {
    if (!Object.values(enumObject).includes(value)) {
      throw new ValidationError(
        fieldName, 
        value, 
        `Must be one of: ${Object.values(enumObject).join(', ')}`
      )
    }
  }
  
  protected isArray(value: any, fieldName: string): void {
    if (!Array.isArray(value)) {
      throw new ValidationError(fieldName, value, 'Must be an array')
    }
  }
  
  protected hasMinLength(value: string | any[], minLength: number, fieldName: string): void {
    if (value.length < minLength) {
      throw new ValidationError(
        fieldName, 
        value, 
        `Must have at least ${minLength} characters/items`
      )
    }
  }
  
  protected hasMaxLength(value: string | any[], maxLength: number, fieldName: string): void {
    if (value.length > maxLength) {
      throw new ValidationError(
        fieldName, 
        value, 
        `Must have at most ${maxLength} characters/items`
      )
    }
  }
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings?: string[]
}

/**
 * User validator
 */
export class UserValidator extends BaseValidator<User> {
  validate(user: User): ValidationResult {
    const errors: ValidationError[] = []
    
    try {
      // Required fields
      this.isRequired(user.email, 'email')
      this.isRequired(user.firstName, 'firstName')
      this.isRequired(user.lastName, 'lastName')
      this.isRequired(user.role, 'role')
      
      // Format validations
      this.isEmail(user.email, 'email')
      this.isInEnum(user.role, UserRole, 'role')
      
      // Length validations
      this.hasMinLength(user.firstName, 1, 'firstName')
      this.hasMaxLength(user.firstName, 50, 'firstName')
      this.hasMinLength(user.lastName, 1, 'lastName')
      this.hasMaxLength(user.lastName, 50, 'lastName')
      
      // Optional field validations
      if (user.bio) {
        this.hasMaxLength(user.bio, 500, 'bio')
      }
      
      if (user.phoneNumber) {
        const phoneRegex = /^\+?[\d\s\-\(\)]+$/
        if (!phoneRegex.test(user.phoneNumber)) {
          throw new ValidationError('phoneNumber', user.phoneNumber, 'Invalid phone number format')
        }
      }
      
    } catch (error) {
      if (error instanceof ValidationError) {
        errors.push(error)
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

/**
 * Course validator
 */
export class CourseValidator extends BaseValidator<Course> {
  validate(course: Course): ValidationResult {
    const errors: ValidationError[] = []
    
    try {
      // Required fields
      this.isRequired(course.title, 'title')
      this.isRequired(course.description, 'description')
      this.isRequired(course.instructor, 'instructor')
      this.isRequired(course.instructorId, 'instructorId')
      this.isRequired(course.category, 'category')
      this.isRequired(course.level, 'level')
      this.isRequired(course.price, 'price')
      this.isRequired(course.currency, 'currency')
      this.isRequired(course.duration, 'duration')
      this.isRequired(course.status, 'status')
      
      // Format validations
      this.isInEnum(course.level, CourseLevel, 'level')
      this.isInEnum(course.status, CourseStatus, 'status')
      this.isPositiveNumber(course.price, 'price')
      
      // Length validations
      this.hasMinLength(course.title, 3, 'title')
      this.hasMaxLength(course.title, 100, 'title')
      this.hasMinLength(course.description, 10, 'description')
      this.hasMaxLength(course.description, 2000, 'description')
      
      // Array validations
      if (course.tags) {
        this.isArray(course.tags, 'tags')
      }
      
      if (course.skills) {
        this.isArray(course.skills, 'skills')
      }
      
      if (course.prerequisites) {
        this.isArray(course.prerequisites, 'prerequisites')
      }
      
      // URL validations
      if (course.courseImage) {
        this.isUrl(course.courseImage, 'courseImage')
      }
      
      if (course.promoVideo) {
        this.isUrl(course.promoVideo, 'promoVideo')
      }
      
      // Rating validation
      if (course.rating !== undefined) {
        if (course.rating < 0 || course.rating > 5) {
          throw new ValidationError('rating', course.rating, 'Rating must be between 0 and 5')
        }
      }
      
    } catch (error) {
      if (error instanceof ValidationError) {
        errors.push(error)
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate partial course data (for updates)
   */
  validatePartial(partialCourse: Partial<Course>): ValidationResult {
    const errors: ValidationError[] = []
    
    try {
      // Only validate fields that are present
      if (partialCourse.title !== undefined) {
        this.isRequired(partialCourse.title, 'title')
        this.hasMinLength(partialCourse.title, 3, 'title')
        this.hasMaxLength(partialCourse.title, 100, 'title')
      }
      
      if (partialCourse.description !== undefined) {
        this.isRequired(partialCourse.description, 'description')
        this.hasMinLength(partialCourse.description, 10, 'description')
        this.hasMaxLength(partialCourse.description, 2000, 'description')
      }
      
      if (partialCourse.level !== undefined) {
        this.isRequired(partialCourse.level, 'level')
        this.isInEnum(partialCourse.level, CourseLevel, 'level')
      }
      
      if (partialCourse.status !== undefined) {
        this.isRequired(partialCourse.status, 'status')
        this.isInEnum(partialCourse.status, CourseStatus, 'status')
      }
      
      if (partialCourse.price !== undefined) {
        this.isRequired(partialCourse.price, 'price')
        this.isPositiveNumber(partialCourse.price, 'price')
      }
      
      if (partialCourse.courseImage !== undefined && partialCourse.courseImage) {
        this.isUrl(partialCourse.courseImage, 'courseImage')
      }
      
      if (partialCourse.promoVideo !== undefined && partialCourse.promoVideo) {
        this.isUrl(partialCourse.promoVideo, 'promoVideo')
      }
      
      if (partialCourse.rating !== undefined) {
        if (partialCourse.rating < 0 || partialCourse.rating > 5) {
          throw new ValidationError('rating', partialCourse.rating, 'Rating must be between 0 and 5')
        }
      }
      
      if (partialCourse.tags !== undefined) {
        this.isArray(partialCourse.tags, 'tags')
      }
      
      if (partialCourse.skills !== undefined) {
        this.isArray(partialCourse.skills, 'skills')
      }
      
      if (partialCourse.prerequisites !== undefined) {
        this.isArray(partialCourse.prerequisites, 'prerequisites')
      }
      
    } catch (error) {
      if (error instanceof ValidationError) {
        errors.push(error)
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

/**
 * Course topic validator
 */
export class CourseTopicValidator extends BaseValidator<CourseTopic> {
  validate(topic: CourseTopic): ValidationResult {
    const errors: ValidationError[] = []
    
    try {
      // Required fields
      this.isRequired(topic.courseId, 'courseId')
      this.isRequired(topic.title, 'title')
      this.isRequired(topic.order, 'order')
      
      // Length validations
      this.hasMinLength(topic.title, 3, 'title')
      this.hasMaxLength(topic.title, 100, 'title')
      
      if (topic.description) {
        this.hasMaxLength(topic.description, 500, 'description')
      }
      
      // Number validations
      this.isPositiveNumber(topic.order, 'order')
      
      if (topic.duration !== undefined) {
        this.isPositiveNumber(topic.duration, 'duration')
      }
      
      // URL validation
      if (topic.videoUrl) {
        this.isUrl(topic.videoUrl, 'videoUrl')
      }
      
      // Materials validation
      if (topic.materials) {
        this.isArray(topic.materials, 'materials')
        
        topic.materials.forEach((material, index) => {
          if (!material.title) {
            throw new ValidationError(`materials[${index}].title`, material.title, 'Material title is required')
          }
          
          if (!material.url) {
            throw new ValidationError(`materials[${index}].url`, material.url, 'Material URL is required')
          }
          
          this.isUrl(material.url, `materials[${index}].url`)
          this.isInEnum(material.type, MaterialType, `materials[${index}].type`)
        })
      }
      
      // Arrays validation
      if (topic.prerequisites) {
        this.isArray(topic.prerequisites, 'prerequisites')
      }
      
      if (topic.learningObjectives) {
        this.isArray(topic.learningObjectives, 'learningObjectives')
      }
      
    } catch (error) {
      if (error instanceof ValidationError) {
        errors.push(error)
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

/**
 * Quiz validator
 */
export class QuizValidator extends BaseValidator<Quiz> {
  validate(quiz: Quiz): ValidationResult {
    const errors: ValidationError[] = []
    
    try {
      // Required fields
      this.isRequired(quiz.courseId, 'courseId')
      this.isRequired(quiz.title, 'title')
      this.isRequired(quiz.questions, 'questions')
      this.isRequired(quiz.attemptsAllowed, 'attemptsAllowed')
      this.isRequired(quiz.passingScore, 'passingScore')
      
      // Length validations
      this.hasMinLength(quiz.title, 3, 'title')
      this.hasMaxLength(quiz.title, 100, 'title')
      
      // Number validations
      this.isPositiveNumber(quiz.attemptsAllowed, 'attemptsAllowed')
      this.isPositiveNumber(quiz.passingScore, 'passingScore')
      
      if (quiz.passingScore > 100) {
        throw new ValidationError('passingScore', quiz.passingScore, 'Passing score cannot exceed 100%')
      }
      
      // Questions validation
      this.isArray(quiz.questions, 'questions')
      this.hasMinLength(quiz.questions, 1, 'questions')
      
      quiz.questions.forEach((question, index) => {
        if (!question.question) {
          throw new ValidationError(`questions[${index}].question`, question.question, 'Question text is required')
        }
        
        if (!question.correctAnswer) {
          throw new ValidationError(`questions[${index}].correctAnswer`, question.correctAnswer, 'Correct answer is required')
        }
        
        if (question.type === 'multiple_choice' && (!question.options || question.options.length < 2)) {
          throw new ValidationError(`questions[${index}].options`, question.options, 'Multiple choice questions need at least 2 options')
        }
      })
      
    } catch (error) {
      if (error instanceof ValidationError) {
        errors.push(error)
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

/**
 * Assignment validator
 */
export class AssignmentValidator extends BaseValidator<Assignment> {
  validate(assignment: Assignment): ValidationResult {
    const errors: ValidationError[] = []
    
    try {
      // Required fields
      this.isRequired(assignment.courseId, 'courseId')
      this.isRequired(assignment.title, 'title')
      this.isRequired(assignment.description, 'description')
      this.isRequired(assignment.type, 'type')
      this.isRequired(assignment.maxPoints, 'maxPoints')
      
      // Format validations
      this.isInEnum(assignment.type, AssignmentType, 'type')
      
      // Length validations
      this.hasMinLength(assignment.title, 3, 'title')
      this.hasMaxLength(assignment.title, 100, 'title')
      this.hasMinLength(assignment.description, 10, 'description')
      
      // Number validations
      this.isPositiveNumber(assignment.maxPoints, 'maxPoints')
      
      if (assignment.latePenalty !== undefined) {
        if (assignment.latePenalty < 0 || assignment.latePenalty > 100) {
          throw new ValidationError('latePenalty', assignment.latePenalty, 'Late penalty must be between 0 and 100%')
        }
      }
      
      // Date validation
      if (assignment.dueDate && assignment.dueDate < new Date()) {
        throw new ValidationError('dueDate', assignment.dueDate, 'Due date cannot be in the past')
      }
      
    } catch (error) {
      if (error instanceof ValidationError) {
        errors.push(error)
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

/**
 * Validation factory
 */
export class ValidationFactory {
  static getValidator(type: string): BaseValidator<any> {
    switch (type) {
      case 'user':
        return new UserValidator()
      case 'course':
        return new CourseValidator()
      case 'courseTopic':
        return new CourseTopicValidator()
      case 'quiz':
        return new QuizValidator()
      case 'assignment':
        return new AssignmentValidator()
      default:
        throw new Error(`No validator found for type: ${type}`)
    }
  }
  
  static validateData<T>(type: string, data: T): ValidationResult {
    const validator = this.getValidator(type)
    return validator.validate(data)
  }
}

/**
 * Utility functions for validation
 */
export const ValidationUtils = {
  
  /**
   * Validate and throw if invalid
   */
  validateOrThrow<T>(type: string, data: T): void {
    const result = ValidationFactory.validateData(type, data)
    if (!result.isValid) {
      const errorMessages = result.errors.map(e => e.message).join('; ')
      throw new Error(`Validation failed: ${errorMessages}`)
    }
  },
  
  /**
   * Validate multiple items
   */
  validateMany<T>(type: string, items: T[]): ValidationResult {
    const allErrors: ValidationError[] = []
    
    items.forEach((item, index) => {
      const result = ValidationFactory.validateData(type, item)
      if (!result.isValid) {
        result.errors.forEach(error => {
          error.field = `[${index}].${error.field}`
          allErrors.push(error)
        })
      }
    })
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors
    }
  },
  
  /**
   * Sanitize data by removing undefined/null values
   */
  sanitizeData<T>(data: T): T {
    if (typeof data !== 'object' || data === null) return data
    
    const sanitized: any = {}
    Object.entries(data as any).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        sanitized[key] = typeof value === 'object' ? this.sanitizeData(value) : value
      }
    })
    
    return sanitized
  }
}
