import { Timestamp } from 'firebase-admin/firestore'

// Course data model interface
export interface Course {
  id?: string
  title: string
  description: string
  instructorId: string // NEW: instructor assigned to this course
  programId: string // NEW: program association
  subjectId: string // NEW: subject association
  year: number // NEW: year association
  medium: 'English' | 'Telugu' // NEW: medium of instruction
  collegeId: string
  // Image and media fields
  image?: string // Main course image URL
  imageFileName?: string // Original filename for storage reference
  imageStoragePath?: string // Firebase Storage path
  thumbnailUrl?: string // Thumbnail version of the image
  videoUrl?: string
  resources?: CourseResource[]
  // Association fields (optional, now supports multiple associations)
  associations?: CourseAssociation[]
  // Publication status fields
  status?: 'draft' | 'published' | 'archived'
  isPublished?: boolean // For backward compatibility
  createdAt: Date | Timestamp
  updatedAt: Date | Timestamp
  createdBy?: string
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

export interface CourseStats {
  totalCourses: number
  publishedCourses: number
  draftCourses: number
  archivedCourses: number
  totalEnrollments: number
  averageRating: number
  coursesByCategory: Record<string, number>
  coursesByDifficulty: Record<string, number>
}

export interface CourseSearchFilters {
  search?: string
  instructorId?: string
  categoryId?: string
  difficultyId?: string
  status?: string
  featured?: boolean
  limit?: number
  browsing?: boolean
}
