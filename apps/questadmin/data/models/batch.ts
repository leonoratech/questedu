import { Timestamp } from 'firebase-admin/firestore'

// Batch data model interface for program batches
export interface Batch {
  id?: string
  name: string
  programId: string
  collegeId: string
  startDate: Date | Timestamp
  endDate: Date | Timestamp
  ownerId: string // Instructor who owns this batch
  description?: string
  maxStudents?: number
  currentStudentCount?: number
  status: 'upcoming' | 'active' | 'completed'
  isActive: boolean
  createdAt: Date | Timestamp
  updatedAt: Date | Timestamp
  createdBy: string
}

export interface CreateBatchRequest {
  name: string
  programId: string
  startDate: string
  endDate: string
  ownerId: string
  description?: string
  maxStudents?: number
}

export interface UpdateBatchRequest extends Partial<CreateBatchRequest> {
  id: string
  isActive?: boolean
}

export interface BatchStats {
  totalBatches: number
  activeBatches: number
  upcomingBatches: number
  completedBatches: number
  totalStudents: number
  averageStudentsPerBatch: number
}
