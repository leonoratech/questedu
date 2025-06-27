import {
    CreateEnrollmentRequest,
    Enrollment,
    EnrollmentStats,
    UpdateEnrollmentRequest
} from '../models/enrollment'
import { BaseRepository } from './base-service'
import { adminDb } from './firebase-admin'

const ENROLLMENTS_COLLECTION = 'enrollments'

export class EnrollmentRepository extends BaseRepository<Enrollment> {
  constructor() {
    super(ENROLLMENTS_COLLECTION)
  }

  async createEnrollment(data: CreateEnrollmentRequest): Promise<string> {
    const enrollmentData = {
      ...data,
      status: data.status || 'active' as const,
      enrollmentDate: new Date(),
      progress: {
        totalTopics: 0,
        completedTopics: 0,
        percentage: 0
      },
      certificateIssued: false,
    }

    const docRef = await adminDb.collection(ENROLLMENTS_COLLECTION).add({
      ...enrollmentData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return docRef.id
  }

  async updateEnrollment(id: string, data: UpdateEnrollmentRequest): Promise<void> {
    await adminDb.collection(ENROLLMENTS_COLLECTION).doc(id).update({
      ...data,
      updatedAt: new Date(),
    })
  }

  async getEnrollmentsByStudent(studentId: string): Promise<Enrollment[]> {
    const snapshot = await adminDb.collection(ENROLLMENTS_COLLECTION)
      .where('studentId', '==', studentId)
      .get()
    
    const enrollments: Enrollment[] = []
    snapshot.forEach(doc => {
      enrollments.push({
        id: doc.id,
        ...doc.data()
      } as Enrollment)
    })
    
    return enrollments
  }

  async getEnrollmentsByCourse(courseId: string): Promise<Enrollment[]> {
    const snapshot = await adminDb.collection(ENROLLMENTS_COLLECTION)
      .where('courseId', '==', courseId)
      .get()
    
    const enrollments: Enrollment[] = []
    snapshot.forEach(doc => {
      enrollments.push({
        id: doc.id,
        ...doc.data()
      } as Enrollment)
    })
    
    return enrollments
  }

  async getEnrollmentsByBatch(batchId: string): Promise<Enrollment[]> {
    const snapshot = await adminDb.collection(ENROLLMENTS_COLLECTION)
      .where('batchId', '==', batchId)
      .get()
    
    const enrollments: Enrollment[] = []
    snapshot.forEach(doc => {
      enrollments.push({
        id: doc.id,
        ...doc.data()
      } as Enrollment)
    })
    
    return enrollments
  }

  async getEnrollmentByStudentAndCourse(studentId: string, courseId: string): Promise<Enrollment | null> {
    const snapshot = await adminDb.collection(ENROLLMENTS_COLLECTION)
      .where('studentId', '==', studentId)
      .where('courseId', '==', courseId)
      .get()
    
    if (snapshot.empty) return null
    
    const doc = snapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data()
    } as Enrollment
  }

  async getActiveEnrollments(courseId?: string): Promise<Enrollment[]> {
    let query = adminDb.collection(ENROLLMENTS_COLLECTION)
      .where('status', '==', 'active')
    
    if (courseId) {
      query = query.where('courseId', '==', courseId)
    }
    
    const snapshot = await query.get()
    const enrollments: Enrollment[] = []
    snapshot.forEach(doc => {
      enrollments.push({
        id: doc.id,
        ...doc.data()
      } as Enrollment)
    })
    
    return enrollments
  }

  async getCompletedEnrollments(courseId?: string): Promise<Enrollment[]> {
    let query = adminDb.collection(ENROLLMENTS_COLLECTION)
      .where('status', '==', 'completed')
    
    if (courseId) {
      query = query.where('courseId', '==', courseId)
    }
    
    const snapshot = await query.get()
    const enrollments: Enrollment[] = []
    snapshot.forEach(doc => {
      enrollments.push({
        id: doc.id,
        ...doc.data()
      } as Enrollment)
    })
    
    return enrollments
  }

  async getEnrollmentsByStatus(status: Enrollment['status'], courseId?: string): Promise<Enrollment[]> {
    let query = adminDb.collection(ENROLLMENTS_COLLECTION)
      .where('status', '==', status)
    
    if (courseId) {
      query = query.where('courseId', '==', courseId)
    }
    
    const snapshot = await query.get()
    const enrollments: Enrollment[] = []
    snapshot.forEach(doc => {
      enrollments.push({
        id: doc.id,
        ...doc.data()
      } as Enrollment)
    })
    
    return enrollments
  }

  async updateProgress(enrollmentId: string, totalTopics: number, completedTopics: number): Promise<void> {
    const percentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0
    
    await adminDb.collection(ENROLLMENTS_COLLECTION).doc(enrollmentId).update({
      progress: {
        totalTopics,
        completedTopics,
        percentage
      },
      lastAccessedAt: new Date(),
      updatedAt: new Date(),
    })
  }

  async completeEnrollment(enrollmentId: string, grades?: Enrollment['grades']): Promise<void> {
    const updateData: any = {
      status: 'completed',
      completionDate: new Date(),
      updatedAt: new Date(),
    }
    
    if (grades) {
      updateData.grades = grades
    }
    
    await adminDb.collection(ENROLLMENTS_COLLECTION).doc(enrollmentId).update(updateData)
  }

  async issueCertificate(enrollmentId: string, certificateUrl: string): Promise<void> {
    await adminDb.collection(ENROLLMENTS_COLLECTION).doc(enrollmentId).update({
      certificateIssued: true,
      certificateUrl,
      updatedAt: new Date(),
    })
  }

  async updateLastAccess(enrollmentId: string): Promise<void> {
    await adminDb.collection(ENROLLMENTS_COLLECTION).doc(enrollmentId).update({
      lastAccessedAt: new Date(),
      updatedAt: new Date(),
    })
  }

  async dropEnrollment(enrollmentId: string): Promise<void> {
    await adminDb.collection(ENROLLMENTS_COLLECTION).doc(enrollmentId).update({
      status: 'dropped',
      updatedAt: new Date(),
    })
  }

  async suspendEnrollment(enrollmentId: string): Promise<void> {
    await adminDb.collection(ENROLLMENTS_COLLECTION).doc(enrollmentId).update({
      status: 'suspended',
      updatedAt: new Date(),
    })
  }

  async reactivateEnrollment(enrollmentId: string): Promise<void> {
    await adminDb.collection(ENROLLMENTS_COLLECTION).doc(enrollmentId).update({
      status: 'active',
      updatedAt: new Date(),
    })
  }

  async getAllEnrollments(): Promise<Enrollment[]> {
    const snapshot = await adminDb.collection(ENROLLMENTS_COLLECTION).get()
    const enrollments: Enrollment[] = []
    snapshot.forEach(doc => {
      enrollments.push({
        id: doc.id,
        ...doc.data()
      } as Enrollment)
    })
    
    return enrollments
  }

  async getEnrollmentStats(courseId?: string): Promise<EnrollmentStats> {
    let enrollments: Enrollment[]
    
    if (courseId) {
      enrollments = await this.getEnrollmentsByCourse(courseId)
    } else {
      enrollments = await this.getAllEnrollments()
    }
    
    const totalEnrollments = enrollments.length
    const activeEnrollments = enrollments.filter(e => e.status === 'active').length
    const completedEnrollments = enrollments.filter(e => e.status === 'completed').length
    const droppedEnrollments = enrollments.filter(e => e.status === 'dropped').length
    const suspendedEnrollments = enrollments.filter(e => e.status === 'suspended').length
    
    // Group enrollments by month
    const enrollmentsByMonth: { [month: string]: number } = {}
    enrollments.forEach(enrollment => {
      const month = enrollment.enrollmentDate.toISOString().slice(0, 7) // YYYY-MM format
      enrollmentsByMonth[month] = (enrollmentsByMonth[month] || 0) + 1
    })
    
    // Calculate average progress
    const totalProgress = enrollments.reduce((sum, e) => sum + e.progress.percentage, 0)
    const averageProgress = totalEnrollments > 0 ? totalProgress / totalEnrollments : 0
    
    // Calculate average grade (from overall grades)
    const enrollmentsWithGrades = enrollments.filter(e => e.grades?.overall !== undefined)
    const totalGrades = enrollmentsWithGrades.reduce((sum, e) => sum + (e.grades?.overall || 0), 0)
    const averageGrade = enrollmentsWithGrades.length > 0 ? totalGrades / enrollmentsWithGrades.length : 0
    
    const certificatesIssued = enrollments.filter(e => e.certificateIssued).length
    const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0
    
    return {
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      droppedEnrollments,
      suspendedEnrollments,
      enrollmentsByMonth,
      averageProgress,
      averageGrade,
      certificatesIssued,
      completionRate
    }
  }

  async deleteEnrollment(enrollmentId: string): Promise<void> {
    await this.delete(enrollmentId)
  }

  async deleteEnrollmentsByCourse(courseId: string): Promise<void> {
    const enrollments = await this.getEnrollmentsByCourse(courseId)
    
    const deletePromises = enrollments.map(enrollment => this.delete(enrollment.id))
    await Promise.all(deletePromises)
  }

  async deleteEnrollmentsByStudent(studentId: string): Promise<void> {
    const enrollments = await this.getEnrollmentsByStudent(studentId)
    
    const deletePromises = enrollments.map(enrollment => this.delete(enrollment.id))
    await Promise.all(deletePromises)
  }
}
