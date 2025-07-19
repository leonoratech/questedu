import { BaseEntity } from './basemodel'

// Course data model interface
export interface Course extends BaseEntity{
  title: string
  description: string
  instructorId: string // Instructor assigned to this course
  departmentId: string // Department association
  programId: string // Program association
  subjectId: string // Subject association
  year: number // Year association
  medium: 'English' | 'Telugu' // Medium of instruction
  
  // Image and media fields
  image?: string // Main course image URL
  imageFileName?: string // Original filename for storage reference
  thumbnailUrl?: string // Thumbnail version of the image
  
  tags?: string[] // Tags for categorization
  skills?: string[] // Skills associated with the course
  prerequisites?: string[] // Prerequisite courses or knowledge
  objectives?: string[] // Learning objectives of the course

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
  programId: string
  programName?: string // Cached for display
  yearOrSemester: number
  subjectId: string
  subjectName?: string // Cached for display
}


