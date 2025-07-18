/**
 * Server-side Subject Repository
 * Handles all Firebase operations for subjects on the server
 */

import { Subject } from '../models/subject';
import { adminDb } from './firebase-admin';

const SUBJECT_COLLECTION = 'subjects';

export class SubjectRepository {
    async getSubjects(collegeId: string, programId?: string): Promise<Subject[]> {
        let query = adminDb.collection(SUBJECT_COLLECTION).where('collegeId', '==', collegeId);
        if (programId) query = query.where('programId', '==', programId);
        const snapshot = await query.where('isActive', '==', true).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
    }

    async getById(id: string): Promise<Subject | null> {
        const doc = await adminDb.collection(SUBJECT_COLLECTION).doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() } as Subject;
    }

    async createSubject(data: Omit<Subject, 'id'>): Promise<Subject> {
        const ref = await adminDb.collection(SUBJECT_COLLECTION).add(data);
        return { id: ref.id, ...data };
    }

    async updateSubject(id: string, updates: Partial<Subject>): Promise<void> {
        await adminDb.collection(SUBJECT_COLLECTION).doc(id).update(updates);
    }

    async deleteSubject(id: string): Promise<void> {
        await adminDb.collection(SUBJECT_COLLECTION).doc(id).delete();
    }
}
