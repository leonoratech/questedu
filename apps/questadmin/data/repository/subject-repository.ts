import { Subject } from '@/data/models/subject'
import { adminDb } from '@/lib/firebase/admin'
import { BaseRepository } from './base-repository'

export class SubjectRepository extends BaseRepository<Subject> {
  constructor() {
    super('subjects')
  }

  async findByProgram(programId: string): Promise<Subject[]> {
    try {
      const snapshot = await adminDb
        .collection(this.collectionName)
        .where('programId', '==', programId)
        .where('isActive', '==', true)
        .get()

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject))
    } catch (error) {
      console.error('Error finding subjects by program:', error)
      throw error
    }
  }

  async findByInstructor(instructorId: string): Promise<Subject[]> {
    try {
      const snapshot = await adminDb
        .collection(this.collectionName)
        .where('instructorId', '==', instructorId)
        .where('isActive', '==', true)
        .get()

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject))
    } catch (error) {
      console.error('Error finding subjects by instructor:', error)
      throw error
    }
  }

  async findByYear(programId: string, year: number): Promise<Subject[]> {
    try {
      const snapshot = await adminDb
        .collection(this.collectionName)
        .where('programId', '==', programId)
        .where('year', '==', year)
        .where('isActive', '==', true)
        .get()

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject))
    } catch (error) {
      console.error('Error finding subjects by year:', error)
      throw error
    }
  }
}
