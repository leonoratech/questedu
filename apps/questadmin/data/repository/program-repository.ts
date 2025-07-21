import { Program } from '@/data/models/program'
import { adminDb } from '@/lib/firebase/admin'
import { BaseRepository } from './base-repository'

export class ProgramRepository extends BaseRepository<Program> {
  constructor() {
    super('programs')
  }

  async findByDepartment(departmentId: string): Promise<Program[]> {
    try {
      const snapshot = await adminDb
        .collection(this.collectionName)
        .where('departmentId', '==', departmentId)
        .where('isActive', '==', true)
        .get()

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Program))
    } catch (error) {
      console.error('Error finding programs by department:', error)
      throw error
    }
  }

  async findByName(name: string): Promise<Program | null> {
    try {
      const snapshot = await adminDb
        .collection(this.collectionName)
        .where('name', '==', name)
        .limit(1)
        .get()

      if (snapshot.empty) {
        return null
      }

      const doc = snapshot.docs[0]
      return { id: doc.id, ...doc.data() } as Program
    } catch (error) {
      console.error('Error finding program by name:', error)
      throw error
    }
  }
}
