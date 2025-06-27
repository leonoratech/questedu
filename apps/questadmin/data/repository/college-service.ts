/**
 * Server-side Activity Service
 * Handles all Firebase operations for activities on the server
 */

import { College } from '@/data/models/college';
import { adminDb } from '@/data/repository/firebase-admin';
import { BaseRepository } from './base-service';
const COLLEGES_COLLECTION = 'colleges';

export class CollegeRepository extends BaseRepository<College> {
    constructor() {
        super(COLLEGES_COLLECTION);
    }

    async searchColleges(search: string | null): Promise<College[]> {
        try {
            const collegesRef = adminDb.collection(COLLEGES_COLLECTION);

            let collegesQuery = collegesRef.orderBy('name')

            // If search term provided, filter by name (case-insensitive)
            if (search) {
                const searchTerm = search.toLowerCase()
                collegesQuery = collegesRef
                    .orderBy('name')
                    .where('name', '>=', searchTerm)
                    .where('name', '<=', searchTerm + '\uf8ff')
            }
            const querySnapshot = await collegesQuery.get();
            const colleges: College[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                colleges.push({
                    ...data,
                    address: data.address || {},
                    contact: data.contact || {},
                    isActive: data.isActive !== undefined ? data.isActive : true,
                } as College);
            });

            return colleges;
        } catch (error) {
            console.error('Error fetching colleges:', error);
            throw new Error('Failed to fetch colleges');
        }
    }
}




