import { BaseEntity } from '@/data/models/basemodel'
import { adminDb } from '@/lib/firebase/admin'

export abstract class BaseRepository<T extends BaseEntity> {
  protected collectionName: string

  constructor(collectionName: string) {
    this.collectionName = collectionName
  }

  // Helper method to remove undefined values from an object
  private removeUndefinedValues<T extends Record<string, any>>(obj: T): Partial<T> {
    const cleaned: Partial<T> = {}
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        // Also skip empty strings for optional fields
        if (typeof value === 'string' && value.trim() === '' && 
            (key === 'departmentId' || key === 'programId')) {
          continue
        }
        cleaned[key as keyof T] = value
      }
    }
    return cleaned
  }

  async create(data: Omit<T, 'id'>): Promise<string> {
    try {
      // Clean undefined values before sending to Firestore
      const dataWithTimestamps = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      }
      
      const cleanedData = this.removeUndefinedValues(dataWithTimestamps)
      
      console.log('Original data:', data)
      console.log('Cleaned data:', cleanedData)
      
      const docRef = await adminDb.collection(this.collectionName).add(cleanedData)
      return docRef.id
    } catch (error) {
      console.error(`Error creating ${this.collectionName}:`, error)
      throw error
    }
  }

  async findById(id: string): Promise<T | null> {
    try {
      const doc = await adminDb.collection(this.collectionName).doc(id).get()
      if (!doc.exists) {
        return null
      }
      return { id: doc.id, ...doc.data() } as T
    } catch (error) {
      console.error(`Error finding ${this.collectionName} by id:`, error)
      throw error
    }
  }

  async findAll(): Promise<T[]> {
    try {
      const snapshot = await adminDb
        .collection(this.collectionName)
        .where('isActive', '==', true)
        .get()

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T))
    } catch (error) {
      console.error(`Error finding all ${this.collectionName}:`, error)
      throw error
    }
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    try {
      // Clean undefined values before sending to Firestore
      const dataWithTimestamp = {
        ...data,
        updatedAt: new Date(),
      }
      
      const cleanedData = this.removeUndefinedValues(dataWithTimestamp)
      
      await adminDb.collection(this.collectionName).doc(id).update(cleanedData)
    } catch (error) {
      console.error(`Error updating ${this.collectionName}:`, error)
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await adminDb.collection(this.collectionName).doc(id).update({
        isActive: false,
        updatedAt: new Date(),
      })
    } catch (error) {
      console.error(`Error deleting ${this.collectionName}:`, error)
      throw error
    }
  }

  async hardDelete(id: string): Promise<void> {
    try {
      await adminDb.collection(this.collectionName).doc(id).delete()
    } catch (error) {
      console.error(`Error hard deleting ${this.collectionName}:`, error)
      throw error
    }
  }
}
