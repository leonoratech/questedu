/**
 * Server-side Program Repository
 * Handles all Firebase operations for programs on the server
 */

import { Program, ProgramStats } from '@/data/models/program';
import { adminDb } from '@/data/repository/firebase-admin';
import { BaseRepository } from './base-service';

const PROGRAM_COLLECTION = 'programs';

export class ProgramRepository extends BaseRepository<Program> {
    constructor() {
        super(PROGRAM_COLLECTION);
    }

    async getCollegePrograms(collegeId: string, isActive?: boolean): Promise<Program[]> {
        try {
            let programsQuery = adminDb.collection(PROGRAM_COLLECTION)
                .where('collegeId', '==', collegeId);

            if (isActive !== undefined) {
                programsQuery = programsQuery.where('isActive', '==', isActive);
            }

            programsQuery = programsQuery.orderBy('name', 'asc');

            const querySnapshot = await programsQuery.get();
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
                } as Program;
            });
        } catch (error) {
            console.error('Error fetching college programs:', error);
            throw new Error('Failed to fetch college programs');
        }
    }

    async searchPrograms(search?: string): Promise<Program[]> {
        try {
            let programsQuery = adminDb.collection(PROGRAM_COLLECTION)
                .where('isActive', '==', true)
                .orderBy('name', 'asc');

            const querySnapshot = await programsQuery.get();
            let programs = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
                } as Program;
            });

            // Apply text search filter in memory
            if (search && search.trim()) {
                const searchLower = search.toLowerCase().trim();
                programs = programs.filter(program => {
                    const name = (program.name || '').toLowerCase();
                    const description = (program.description || '').toLowerCase();
                    const category = (program.category || '').toLowerCase();
                    
                    return name.includes(searchLower) ||
                           description.includes(searchLower) ||
                           category.includes(searchLower);
                });
            }

            return programs;
        } catch (error) {
            console.error('Error searching programs:', error);
            throw new Error('Failed to search programs');
        }
    }

    async getProgramsByCategory(category: string): Promise<Program[]> {
        try {
            const programsQuery = adminDb.collection(PROGRAM_COLLECTION)
                .where('category', '==', category)
                .where('isActive', '==', true)
                .orderBy('name', 'asc');

            const querySnapshot = await programsQuery.get();
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
                } as Program;
            });
        } catch (error) {
            console.error('Error fetching programs by category:', error);
            throw new Error('Failed to fetch programs by category');
        }
    }

    async getProgramStats(collegeId?: string): Promise<ProgramStats> {
        try {
            let programsQuery: FirebaseFirestore.Query = adminDb.collection(PROGRAM_COLLECTION);
            
            if (collegeId) {
                programsQuery = programsQuery.where('collegeId', '==', collegeId);
            }

            const programsSnapshot = await programsQuery.get();
            
            const stats: ProgramStats = {
                totalPrograms: 0,
                activePrograms: 0,
                inactivePrograms: 0,
                totalBatches: 0,
                activeBatches: 0,
                totalStudents: 0,
                programsByType: {}
            };

            programsSnapshot.docs.forEach(doc => {
                const data = doc.data() as Program;
                stats.totalPrograms++;

                if (data.isActive) {
                    stats.activePrograms++;
                } else {
                    stats.inactivePrograms++;
                }

                // Count by semester type
                const type = data.semesterType;
                stats.programsByType[type] = (stats.programsByType[type] || 0) + 1;
            });

            // TODO: Calculate batch and student stats when batch repository is available
            // This would require querying the batches collection

            return stats;
        } catch (error) {
            console.error('Error calculating program stats:', error);
            throw new Error('Failed to calculate program stats');
        }
    }

    async getCategories(): Promise<string[]> {
        try {
            const programsSnapshot = await adminDb.collection(PROGRAM_COLLECTION).get();
            const categories = new Set<string>();

            programsSnapshot.docs.forEach(doc => {
                const data = doc.data() as Program;
                if (data.category) {
                    categories.add(data.category);
                }
            });

            return Array.from(categories).sort();
        } catch (error) {
            console.error('Error fetching program categories:', error);
            throw new Error('Failed to fetch program categories');
        }
    }

    async deactivateProgram(programId: string): Promise<Program> {
        try {
            return await this.update(programId, { isActive: false });
        } catch (error) {
            console.error('Error deactivating program:', error);
            throw new Error('Failed to deactivate program');
        }
    }

    async activateProgram(programId: string): Promise<Program> {
        try {
            return await this.update(programId, { isActive: true });
        } catch (error) {
            console.error('Error activating program:', error);
            throw new Error('Failed to activate program');
        }
    }
}
