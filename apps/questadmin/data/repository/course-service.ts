/**
 * Server-side Course Repository
 * Handles all Firebase operations for courses on the server
 */

import { Course, CourseAssociation } from '../models/course'
import { adminDb } from './firebase-admin'

const COURSE_COLLECTION = 'courses'

export class CourseRepository {
  async getCourses(collegeId: string, programId?: string, subjectId?: string): Promise<Course[]> {
    let query = adminDb.collection(COURSE_COLLECTION).where('collegeId', '==', collegeId)
    if (programId) query = query.where('programId', '==', programId)
    if (subjectId) query = query.where('subjectId', '==', subjectId)
    const snapshot = await query.get()
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course))
  }

  async getById(id: string): Promise<Course | null> {
    const doc = await adminDb.collection(COURSE_COLLECTION).doc(id).get()
    if (!doc.exists) return null
    return { id: doc.id, ...doc.data() } as Course
  }

  async createCourse(data: Omit<Course, 'id'>): Promise<Course> {
    const ref = await adminDb.collection(COURSE_COLLECTION).add(data)
    return { id: ref.id, ...data }
  }

  async updateCourse(id: string, updates: Partial<Course>): Promise<void> {
    await adminDb.collection(COURSE_COLLECTION).doc(id).update(updates)
  }

  // Add alias methods for compatibility
  async update(id: string, updates: Partial<Course>): Promise<void> {
    await this.updateCourse(id, updates)
  }

  async delete(id: string): Promise<void> {
    await this.deleteCourse(id)
  }

  async searchCourses(filters: any): Promise<Course[]> {
    let query: any = adminDb.collection(COURSE_COLLECTION)
    
    // Apply filters
    if (filters.instructorId) {
      query = query.where('instructorId', '==', filters.instructorId)
    }
    
    const snapshot = await query.get()
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Course))
  }

  async getCoursesByProgram(programId: string): Promise<Course[]> {
    const snapshot = await adminDb.collection(COURSE_COLLECTION)
      .where('programId', '==', programId)
      .get()
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course))
  }

  async getCoursesBySubject(subjectId: string): Promise<Course[]> {
    const snapshot = await adminDb.collection(COURSE_COLLECTION)
      .where('subjectId', '==', subjectId)
      .get()
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course))
  }

  async getCoursesByProgramAndYear(programId: string, year: number): Promise<Course[]> {
    const snapshot = await adminDb.collection(COURSE_COLLECTION)
      .where('programId', '==', programId)
      .where('year', '==', year)
      .get()
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course))
  }

  async updateCourseAssociations(id: string, associations: CourseAssociation[]): Promise<void> {
    await adminDb.collection(COURSE_COLLECTION).doc(id).update({
      associations,
      updatedAt: new Date()
    })
  }

  async removeAllCourseAssociations(id: string): Promise<void> {
    await adminDb.collection(COURSE_COLLECTION).doc(id).update({
      associations: [],
      updatedAt: new Date()
    })
  }

  async deleteCourse(id: string): Promise<void> {
    await adminDb.collection(COURSE_COLLECTION).doc(id).delete()
  }
}
