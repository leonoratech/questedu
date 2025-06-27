/**
 * Server-side Activity Service
 * Handles all Firebase operations for activities on the server
 */

import { UserProfile } from '@/data/models/user-model';
import { adminDb } from '@/data/repository/firebase-admin';
import { BaseRepository } from './base-service';
const USERS_COLLECTION = 'users'

export class UserProfileRepository extends BaseRepository<UserProfile> {
  constructor() {
    super(USERS_COLLECTION);
  }

  async getUsersByRole(role: string): Promise<UserProfile[]> {
    try {
      const usersRef = adminDb.collection(USERS_COLLECTION);
      const querySnapshot = await usersRef.where('role', '==', role)
      .where('isActive', '==', true)
      .orderBy('displayName')
      .get();
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        } as UserProfile;
      });
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw new Error('Failed to fetch users by role');
    }
  }
}





