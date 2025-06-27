/**
 * Server-side Activity Service
 * Handles all Firebase operations for activities on the server
 */

import { Batch } from '@/data/models/batch';
import { adminDb } from '@/data/repository/firebase-admin';
import { BaseRepository } from './base-service';
const BATCH_COLLECTION = 'batches';

export class BatchRepository extends BaseRepository<Batch> {
    constructor() {
        super(BATCH_COLLECTION);
    }

    async getCollegeBatches(collegeId: string, isActive:boolean): Promise<Batch[]> {
        try {
            const batchesRef = adminDb.collection(BATCH_COLLECTION);
            const querySnapshot = await batchesRef
                .where('collegeId', '==', collegeId)
                .where('isActive', '==', isActive)
                .get();

            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    startDate: data.startDate?.toDate?.() || data.startDate,
                    endDate: data.endDate?.toDate?.() || data.endDate,
                } as Batch;
            });
        } catch (error) {
            console.error('Error fetching college batches:', error);
            throw new Error('Failed to fetch college batches');
        }
    }
}




