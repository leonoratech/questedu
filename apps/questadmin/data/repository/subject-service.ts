/**
 * Server-side Subject Repository
 * Handles all Firebase operations for subjects on the server
 */

import { Subject } from '@/data/models/subject';
import { adminDb } from '@/data/repository/firebase-admin';
import { BaseRepository } from './base-service';

const SUBJECT_COLLECTION = 'subjects';

export class SubjectRepository extends BaseRepository<Subject> {
    constructor() {
        super(SUBJECT_COLLECTION);
    }

    async getProgramSubjects(programId: string, isActive?: boolean): Promise<Subject[]> {
        try {
            let subjectsQuery = adminDb.collection(SUBJECT_COLLECTION)
                .where('programId', '==', programId);

            if (isActive !== undefined) {
                subjectsQuery = subjectsQuery.where('isActive', '==', isActive);
            }

            subjectsQuery = subjectsQuery.orderBy('name', 'asc');

            const querySnapshot = await subjectsQuery.get();
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
                } as Subject;
            });
        } catch (error) {
            console.error('Error fetching program subjects:', error);
            throw new Error('Failed to fetch program subjects');
        }
    }

    async getCollegeSubjects(collegeId: string, isActive?: boolean): Promise<Subject[]> {
        try {
            let subjectsQuery = adminDb.collection(SUBJECT_COLLECTION)
                .where('collegeId', '==', collegeId);

            if (isActive !== undefined) {
                subjectsQuery = subjectsQuery.where('isActive', '==', isActive);
            }

            subjectsQuery = subjectsQuery.orderBy('name', 'asc');

            const querySnapshot = await subjectsQuery.get();
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
                } as Subject;
            });
        } catch (error) {
            console.error('Error fetching college subjects:', error);
            throw new Error('Failed to fetch college subjects');
        }
    }

    async searchSubjects(search?: string, collegeId?: string): Promise<Subject[]> {
        try {
            let subjectsQuery = adminDb.collection(SUBJECT_COLLECTION)
                .where('isActive', '==', true);

            if (collegeId) {
                subjectsQuery = subjectsQuery.where('collegeId', '==', collegeId);
            }

            subjectsQuery = subjectsQuery.orderBy('name', 'asc');

            const querySnapshot = await subjectsQuery.get();
            let subjects = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
                } as Subject;
            });

            // Apply text search filter in memory
            if (search && search.trim()) {
                const searchLower = search.toLowerCase().trim();
                subjects = subjects.filter(subject => {
                    const name = (subject.name || '').toLowerCase();
                    const description = (subject.description || '').toLowerCase();
                    
                    return name.includes(searchLower) ||
                           description.includes(searchLower);
                });
            }

            return subjects;
        } catch (error) {
            console.error('Error searching subjects:', error);
            throw new Error('Failed to search subjects');
        }
    }

    async getSubjectsByInstructor(instructorId: string): Promise<Subject[]> {
        try {
            const subjectsQuery = adminDb.collection(SUBJECT_COLLECTION)
                .where('instructorId', '==', instructorId)
                .where('isActive', '==', true)
                .orderBy('name', 'asc');

            const querySnapshot = await subjectsQuery.get();
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
                } as Subject;
            });
        } catch (error) {
            console.error('Error fetching subjects by instructor:', error);
            throw new Error('Failed to fetch subjects by instructor');
        }
    }

    async getSubjectsBySemester(programId: string, semester: number): Promise<Subject[]> {
        try {
            const subjectsQuery = adminDb.collection(SUBJECT_COLLECTION)
                .where('programId', '==', programId)
                .where('semester', '==', semester)
                .where('isActive', '==', true)
                .orderBy('name', 'asc');

            const querySnapshot = await subjectsQuery.get();
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
                } as Subject;
            });
        } catch (error) {
            console.error('Error fetching subjects by semester:', error);
            throw new Error('Failed to fetch subjects by semester');
        }
    }

    async deactivateSubject(subjectId: string): Promise<Subject> {
        try {
            return await this.update(subjectId, { isActive: false });
        } catch (error) {
            console.error('Error deactivating subject:', error);
            throw new Error('Failed to deactivate subject');
        }
    }

    async activateSubject(subjectId: string): Promise<Subject> {
        try {
            return await this.update(subjectId, { isActive: true });
        } catch (error) {
            console.error('Error activating subject:', error);
            throw new Error('Failed to activate subject');
        }
    }

    async assignInstructor(subjectId: string, instructorId: string): Promise<Subject> {
        try {
            return await this.update(subjectId, { instructorId });
        } catch (error) {
            console.error('Error assigning instructor to subject:', error);
            throw new Error('Failed to assign instructor to subject');
        }
    }
}
