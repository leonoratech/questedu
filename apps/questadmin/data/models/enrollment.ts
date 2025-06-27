// Enrollment data models and interfaces

export interface Enrollment {
  id: string
  studentId: string
  courseId: string
  batchId?: string
  status: 'active' | 'completed' | 'dropped' | 'suspended'
  enrollmentDate: Date
  completionDate?: Date
  progress: {
    totalTopics: number
    completedTopics: number
    percentage: number
  }
  grades?: {
    quizzes: number[]
    assignments: number[]
    midterm?: number
    final?: number
    overall?: number
  }
  lastAccessedAt?: Date
  certificateIssued?: boolean
  certificateUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateEnrollmentRequest {
  studentId: string
  courseId: string
  batchId?: string
  status?: 'active' | 'completed' | 'dropped' | 'suspended'
}

export interface UpdateEnrollmentRequest {
  status?: 'active' | 'completed' | 'dropped' | 'suspended'
  batchId?: string
  progress?: {
    totalTopics: number
    completedTopics: number
    percentage: number
  }
  grades?: {
    quizzes?: number[]
    assignments?: number[]
    midterm?: number
    final?: number
    overall?: number
  }
  completionDate?: Date
  certificateIssued?: boolean
  certificateUrl?: string
}

export interface EnrollmentStats {
  totalEnrollments: number
  activeEnrollments: number
  completedEnrollments: number
  droppedEnrollments: number
  suspendedEnrollments: number
  enrollmentsByMonth: {
    [month: string]: number
  }
  averageProgress: number
  averageGrade: number
  certificatesIssued: number
  completionRate: number
}
