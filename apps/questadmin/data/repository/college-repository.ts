import { College } from '@/data/models/college'
import { adminDb } from '@/lib/firebase/admin'
import { BaseRepository } from './base-repository'

export class CollegeRepository extends BaseRepository<College> {
  constructor() {
    super('colleges')
  }

  async findByName(name: string): Promise<College | null> {
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
      return { id: doc.id, ...doc.data() } as College
    } catch (error) {
      console.error('Error finding college by name:', error)
      throw error
    }
  }
}
