import { BaseEntity } from './basemodel'

// Course data model interface
export interface Course extends BaseEntity{
  title: string
  description: string
  instructorId: string // Instructor assigned to this course
  programId: string // Program association
  subjectId: string // Subject association
  year: number // Year association
  medium: 'English' | 'Telugu' // Medium of instruction
  collegeId: string
  // Image and media fields
  image?: string // Main course image URL
  imageFileName?: string // Original filename for storage reference
  imageStoragePath?: string // Firebase Storage path
  thumbnailUrl?: string // Thumbnail version of the image
  videoUrl?: string
  resources?: CourseResource[]
  // Association fields (simplified for single college)
  associations?: CourseAssociation[]
  // Publication status fields
  status?: 'draft' | 'published' | 'archived'
  isPublished?: boolean // For backward compatibility  
}

export interface CourseResource {
  id: string
  title: string
  type: 'pdf' | 'video' | 'link' | 'document'
  url: string
  description?: string
}

export interface CourseAssociation {
  collegeId: string
  collegeName?: string // Cached for display
  programId: string
  programName?: string // Cached for display
  yearOrSemester: number
  subjectId: string
  subjectName?: string // Cached for display
}

export interface CreateCourseRequest {
  title: string
  description: string
  instructorId: string
  programId: string
  subjectId: string
  year: number
  medium: 'English' | 'Telugu'
  collegeId: string
  // Image and media fields
  image?: string
  imageFileName?: string
  imageStoragePath?: string
  thumbnailUrl?: string
  videoUrl?: string
  // Association fields (optional, now supports multiple associations)
  associations?: CourseAssociation[]
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {
  id: string
}

export interface CourseSearchFilters {
  search?: string
  instructorId?: string
  difficultyId?: string
  status?: string
  featured?: boolean
  limit?: number
  browsing?: boolean
}
