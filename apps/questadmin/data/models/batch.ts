// Batch data model interface for program instances
export interface Batch {
  id?: string
  name: string
  programId: string
  programName?: string // Cached program name for display
  collegeId: string
  startDate: Date
  endDate: Date
  ownerId: string // Instructor who owns this batch
  ownerName?: string // Cached owner name for display
  status: BatchStatus
  description?: string
  maxStudents?: number
  currentStudentCount?: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string // UID of the user who created the batch
}

export enum BatchStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active', 
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface CreateBatchRequest {
  name: string
  programId: string
  startDate: Date
  endDate: Date
  ownerId: string
  description?: string
  maxStudents?: number
}

export interface UpdateBatchRequest extends Partial<CreateBatchRequest> {
  id: string
  status?: BatchStatus
}

// Extended program interface that includes batches
export interface ProgramWithBatches {
  id?: string
  name: string
  yearsOrSemesters: number
  semesterType: 'years' | 'semesters'
  description: string
  collegeId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
  batches?: Batch[] // Associated batches
}

// Helper type for organizing batches by status
export interface BatchesByStatus {
  [status: string]: Batch[]
}

// Instructor selection interface for dropdowns
export interface InstructorOption {
  id: string
  name: string
  email: string
  department?: string
}

// Batch statistics interface
export interface BatchStats {
  totalBatches: number
  activeBatches: number
  upcomingBatches: number
  completedBatches: number
  totalStudents: number
}
