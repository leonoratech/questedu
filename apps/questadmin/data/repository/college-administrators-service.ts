/**
 * Server-side Activity Service
 * Handles all Firebase operations for activities on the server
 */

import { CollegeAdministrator } from '@/data/models/college-administrator';
import { adminDb } from '@/data/repository/firebase-admin';
import { BaseRepository } from './base-service';

const COLLEGE_ADMINISTRATORS_COLLECTION = 'collegeAdministrators';

export class CollegeAdministratorRepository extends BaseRepository<CollegeAdministrator> {
    constructor() {
        super(COLLEGE_ADMINISTRATORS_COLLECTION);
    }

    async getCollegeAdministrators(collegeId: string): Promise<CollegeAdministrator[]> {        
            const administratorsRef = adminDb.collection(COLLEGE_ADMINISTRATORS_COLLECTION);

            const q = administratorsRef.where('collegeId', '==', collegeId)
                 .where('isActive', '==', true)
                 .orderBy('assignedAt', 'desc');

            const querySnapshot = await q.get();
            const administrators: CollegeAdministrator[] = []

            querySnapshot.forEach((doc) => {
                const data = doc.data()
                administrators.push({
                    id: doc.id,
                    ...data,
                    assignedAt: doc.data().assignedAt?.toDate?.() || doc.data().assignedAt,
                } as CollegeAdministrator);
            })
            return administrators;
    }

    // Helper function to get administrator counts for colleges
    async getAdministratorCounts(collegeIds: string[]) {
      if (collegeIds.length === 0) return {}
      
      const adminCounts: Record<string, { administratorCount: number; coAdministratorCount: number }> = {}
      
      // Initialize counts
      collegeIds.forEach(id => {
        adminCounts[id] = { administratorCount: 0, coAdministratorCount: 0 }
      })
      
      // Filter out undefined/null/empty values from collegeIds
      const validCollegeIds = collegeIds.filter((id): id is string => !!id)
      if (validCollegeIds.length === 0) {
        return adminCounts
      }
      try {
        // Get all active administrators for these colleges
        const adminRef = adminDb.collection(COLLEGE_ADMINISTRATORS_COLLECTION)
        const adminQuery = adminRef
          .where('collegeId', 'in', validCollegeIds)
          .where('isActive', '==', true)
        
        const adminSnapshot = await adminQuery.get()
        
        adminSnapshot.docs.forEach(doc => {
          const data = doc.data()
          const collegeId = data.collegeId
          const role = data.role
          
          if (adminCounts[collegeId]) {
            if (role === 'administrator') {
              adminCounts[collegeId].administratorCount++
            } else if (role === 'co_administrator') {
              adminCounts[collegeId].coAdministratorCount++
            }
          }
        })
      } catch (error) {
        console.error('Error fetching administrator counts:', error)
      }      
      return adminCounts
    }

    // Helper function to check if a user is assigned as an admin for a college
    async checkUserAssignedAsAdmin(collegeId: string, userId: string): Promise<boolean> {
      if (!collegeId || !userId) return false

      try {
        const adminRef = adminDb.collection(COLLEGE_ADMINISTRATORS_COLLECTION)
        const adminQuery = adminRef
          .where('collegeId', '==', collegeId)
          .where('instructorId', '==', userId)
          .where('isActive', '==', true)

        const adminSnapshot = await adminQuery.get()
        return !adminSnapshot.empty
      } catch (error) {
        console.error('Error checking user admin status:', error)
        return false
      }
    }

    // Helper function to check if a user is assigned as an admin for a college
    async checkAdministratorExists(collegeId: string): Promise<boolean> {
      if (!collegeId) return false

      try {
        const adminRef = adminDb.collection(COLLEGE_ADMINISTRATORS_COLLECTION)
        const adminQuery = adminRef
          .where('collegeId', '==', collegeId)
          .where('role', '==', 'administrator')
          .where('isActive', '==', true)

        const adminSnapshot = await adminQuery.get()
        return !adminSnapshot.empty
      } catch (error) {
        console.error('Error checking user admin status:', error)
        return false
      }
    }     
}
