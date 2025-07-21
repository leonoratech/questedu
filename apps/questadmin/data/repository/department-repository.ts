import { Department } from '@/data/models/department'
import { adminDb } from '@/lib/firebase/admin'
import { BaseRepository } from './base-repository'

export class DepartmentRepository extends BaseRepository<Department> {
  constructor() {
    super('departments')
  }

  async findByName(name: string): Promise<Department | null> {
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
      return { id: doc.id, ...doc.data() } as Department
    } catch (error) {
      console.error('Error finding department by name:', error)
      throw error
    }
  }
}
