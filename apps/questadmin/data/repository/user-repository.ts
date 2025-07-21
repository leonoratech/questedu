import { UserProfile } from '@/data/models/user-model'
import { adminDb } from '@/lib/firebase/admin'
import { BaseRepository } from './base-repository'

export class UserRepository extends BaseRepository<UserProfile> {
  constructor() {
    super('users')
  }

  async findByEmail(email: string): Promise<UserProfile | null> {
    try {
      const snapshot = await adminDb
        .collection(this.collectionName)
        .where('email', '==', email)
        .limit(1)
        .get()

      if (snapshot.empty) {
        return null
      }

      const doc = snapshot.docs[0]
      return { id: doc.id, ...doc.data() } as UserProfile
    } catch (error) {
      console.error('Error finding user by email:', error)
      throw error
    }
  }

  async findByUid(uid: string): Promise<UserProfile | null> {
    try {
      const snapshot = await adminDb
        .collection(this.collectionName)
        .where('uid', '==', uid)
        .limit(1)
        .get()

      if (snapshot.empty) {
        return null
      }

      const doc = snapshot.docs[0]
      return { id: doc.id, ...doc.data() } as UserProfile
    } catch (error) {
      console.error('Error finding user by uid:', error)
      throw error
    }
  }

  async updateProfile(id: string, data: Partial<UserProfile>): Promise<void> {
    try {
      await adminDb.collection(this.collectionName).doc(id).update({
        ...data,
        updatedAt: new Date(),
      })
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  }

  async updateLastLogin(id: string): Promise<void> {
    try {
      await adminDb.collection(this.collectionName).doc(id).update({
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
    } catch (error) {
      console.error('Error updating last login:', error)
      throw error
    }
  }

  async findByRole(role: string): Promise<UserProfile[]> {
    try {
      const snapshot = await adminDb
        .collection(this.collectionName)
        .where('role', '==', role)
        .where('isActive', '==', true)
        .get()

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile))
    } catch (error) {
      console.error('Error finding users by role:', error)
      throw error
    }
  }
}
