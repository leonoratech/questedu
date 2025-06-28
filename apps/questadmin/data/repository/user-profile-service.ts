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

  // Override getById to ensure all fields and timestamps are mapped
  async getById(id: string): Promise<UserProfile> {
    const doc = await adminDb.collection(USERS_COLLECTION).doc(id).get();
    if (!doc.exists) {
      throw new Error(`User with ID ${id} does not exist`);
    }
    const data = doc.data() || {};
    return {
      id: doc.id,
      uid: data.uid || doc.id,
      email: data.email || '',
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      displayName: data.displayName || '',
      role: data.role,
      isActive: data.isActive !== false,
      createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(0),
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || undefined,
      lastLoginAt: data.lastLoginAt?.toDate?.() || data.lastLoginAt || undefined,
      profilePicture: data.profilePicture || undefined,
      department: data.department || undefined,
      bio: data.bio || undefined,
      collegeId: data.collegeId || undefined,
      college: data.college || undefined,
      description: data.description || undefined,
      coreTeachingSkills: data.coreTeachingSkills || undefined,
      additionalTeachingSkills: data.additionalTeachingSkills || undefined,
      mainSubjects: data.mainSubjects || undefined,
      class: data.class || undefined,
      profileCompleted: data.profileCompleted || undefined,
    };
  }
}





