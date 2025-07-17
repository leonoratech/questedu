import { Timestamp } from 'firebase-admin/firestore'

// Course data model interface
export interface Course {
  id?: string
  title: string
  description: string
  instructor: string
  instructorId: string
  categoryId: string // Reference to courseCategories collection
  subcategory?: string
  difficultyId: string // Reference to courseDifficulties collection
  duration?: number // Duration in hours
  status: 'draft' | 'published' | 'archived'
  isPublished: boolean
  featured?: boolean
  rating?: number
  ratingCount?: number
  enrollmentCount?: number
  tags?: string[]
  skills?: string[]
  prerequisites?: string[]
  objectives?: string[]
  syllabus?: string
  // Image and media fields
  image?: string // Main course image URL
  imageFileName?: string // Original filename for storage reference
  imageStoragePath?: string // Firebase Storage path
  thumbnailUrl?: string // Thumbnail version of the image
  videoUrl?: string
  resources?: CourseResource[]
  // Association fields (optional, now supports multiple associations)
  associations?: CourseAssociation[]
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
  categoryId: string
  subcategory?: string
  difficultyId: string
  duration?: number
  status?: 'draft' | 'published'
  featured?: boolean
  tags?: string[]
  skills?: string[]
  prerequisites?: string[]
  objectives?: string[]
  syllabus?: string
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
  isPublished?: boolean
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
