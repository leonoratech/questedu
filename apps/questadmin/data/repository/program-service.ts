/**
 * Server-side Program Repository
 * Handles all Firebase operations for programs on the server
 */

import { Program } from '../models/program';
import { adminDb } from './firebase-admin';

const PROGRAM_COLLECTION = 'programs';

export class ProgramRepository {
    async getPrograms(collegeId: string, departmentId?: string): Promise<Program[]> {
        let query = adminDb.collection(PROGRAM_COLLECTION).where('collegeId', '==', collegeId);
        if (departmentId) query = query.where('departmentId', '==', departmentId);
        const snapshot = await query.where('isActive', '==', true).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Program));
    }

    async getById(id: string): Promise<Program | null> {
        const doc = await adminDb.collection(PROGRAM_COLLECTION).doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() } as Program;
    }

    async createProgram(data: Omit<Program, 'id'>): Promise<Program> {
        const ref = await adminDb.collection(PROGRAM_COLLECTION).add(data);
        return { id: ref.id, ...data };
    }

    async updateProgram(id: string, updates: Partial<Program>): Promise<void> {
        await adminDb.collection(PROGRAM_COLLECTION).doc(id).update(updates);
    }

    async deleteProgram(id: string): Promise<void> {
        await adminDb.collection(PROGRAM_COLLECTION).doc(id).delete();
    }
}
