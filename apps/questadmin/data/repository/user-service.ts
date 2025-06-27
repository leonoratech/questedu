/**
 * Server-side User Repository
 * Handles all Firebase operations for users on the server
 */

import { UserProfile } from '@/app/api/firebase-server';
import { UserRole } from '@/data/models/user-model';
import { adminDb } from '@/data/repository/firebase-admin';
import { BaseRepository } from './base-service';

const USER_COLLECTION = 'users';

export interface UserSearchFilters {
    role?: string
    isActive?: boolean
    collegeId?: string
    search?: string
    limit?: number
}

export interface UserStats {
    totalUsers: number
    activeUsers: number
    inactiveUsers: number
    usersByRole: Record<string, number>
    newUsersLast30Days: number
    lastLoginStats: {
        last24Hours: number
        last7Days: number
        last30Days: number
    }
}

export class UserRepository extends BaseRepository<UserProfile> {
    constructor() {
        super(USER_COLLECTION);
    }

    async searchUsers(filters: UserSearchFilters): Promise<UserProfile[]> {
        try {
            let usersQuery: FirebaseFirestore.Query = adminDb.collection(USER_COLLECTION);

            // Apply filters
            if (filters.role) {
                usersQuery = usersQuery.where('role', '==', filters.role);
            }

            if (filters.isActive !== undefined) {
                usersQuery = usersQuery.where('isActive', '==', filters.isActive);
            }

            if (filters.collegeId) {
                usersQuery = usersQuery.where('collegeId', '==', filters.collegeId);
            }

            // Apply ordering
            usersQuery = usersQuery.orderBy('createdAt', 'desc');

            // Apply limit if specified
            if (filters.limit) {
                usersQuery = usersQuery.limit(filters.limit);
            }

            const querySnapshot = await usersQuery.get();
            let users = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    ...data,
                    id: doc.id,
                    createdAt: data.createdAt?.toDate?.() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
                    lastLoginAt: data.lastLoginAt?.toDate?.() || data.lastLoginAt,
                } as unknown as UserProfile;
            });

            // Apply text search filter in memory
            if (filters.search && filters.search.trim()) {
                const searchLower = filters.search.toLowerCase().trim();
                users = users.filter(user => {
                    const firstName = (user.firstName || '').toLowerCase();
                    const lastName = (user.lastName || '').toLowerCase();
                    const email = (user.email || '').toLowerCase();
                    const displayName = (user.displayName || '').toLowerCase();
                    
                    return firstName.includes(searchLower) ||
                           lastName.includes(searchLower) ||
                           email.includes(searchLower) ||
                           displayName.includes(searchLower);
                });
            }

            return users;
        } catch (error) {
            console.error('Error searching users:', error);
            throw new Error('Failed to search users');
        }
    }

    async getUserByEmail(email: string): Promise<UserProfile | null> {
        try {
            const usersQuery = adminDb.collection(USER_COLLECTION)
                .where('email', '==', email)
                .limit(1);

            const querySnapshot = await usersQuery.get();
            
            if (querySnapshot.empty) {
                return null;
            }

            const doc = querySnapshot.docs[0];
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                createdAt: data.createdAt?.toDate?.() || data.createdAt,
                updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
                lastLoginAt: data.lastLoginAt?.toDate?.() || data.lastLoginAt,
            } as unknown as UserProfile;
        } catch (error) {
            console.error('Error fetching user by email:', error);
            throw new Error('Failed to fetch user by email');
        }
    }

    async getUsersByRole(role: string, isActive?: boolean): Promise<UserProfile[]> {
        try {
            let usersQuery = adminDb.collection(USER_COLLECTION)
                .where('role', '==', role);

            if (isActive !== undefined) {
                usersQuery = usersQuery.where('isActive', '==', isActive);
            }

            usersQuery = usersQuery.orderBy('displayName', 'asc');

            const querySnapshot = await usersQuery.get();
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    ...data,
                    id: doc.id,
                    createdAt: data.createdAt?.toDate?.() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
                    lastLoginAt: data.lastLoginAt?.toDate?.() || data.lastLoginAt,
                } as unknown as UserProfile;
            });
        } catch (error) {
            console.error('Error fetching users by role:', error);
            throw new Error('Failed to fetch users by role');
        }
    }

    async getCollegeUsers(collegeId: string, role?: string): Promise<UserProfile[]> {
        try {
            let usersQuery = adminDb.collection(USER_COLLECTION)
                .where('collegeId', '==', collegeId);

            if (role) {
                usersQuery = usersQuery.where('role', '==', role);
            }

            usersQuery = usersQuery.orderBy('displayName', 'asc');

            const querySnapshot = await usersQuery.get();
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    ...data,
                    id: doc.id,
                    createdAt: data.createdAt?.toDate?.() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
                    lastLoginAt: data.lastLoginAt?.toDate?.() || data.lastLoginAt,
                } as unknown as UserProfile;
            });
        } catch (error) {
            console.error('Error fetching college users:', error);
            throw new Error('Failed to fetch college users');
        }
    }

    async getActiveInstructors(collegeId?: string): Promise<UserProfile[]> {
        try {
            let usersQuery = adminDb.collection(USER_COLLECTION)
                .where('role', '==', 'instructor')
                .where('isActive', '==', true);

            if (collegeId) {
                usersQuery = usersQuery.where('collegeId', '==', collegeId);
            }

            usersQuery = usersQuery.orderBy('displayName', 'asc');

            const querySnapshot = await usersQuery.get();
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    ...data,
                    id: doc.id,
                    createdAt: data.createdAt?.toDate?.() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
                    lastLoginAt: data.lastLoginAt?.toDate?.() || data.lastLoginAt,
                } as unknown as UserProfile;
            });
        } catch (error) {
            console.error('Error fetching active instructors:', error);
            throw new Error('Failed to fetch active instructors');
        }
    }

    async getUserStats(collegeId?: string): Promise<UserStats> {
        try {
            let usersQuery: FirebaseFirestore.Query = adminDb.collection(USER_COLLECTION);
            
            if (collegeId) {
                usersQuery = usersQuery.where('collegeId', '==', collegeId);
            }

            const usersSnapshot = await usersQuery.get();
            
            const stats: UserStats = {
                totalUsers: 0,
                activeUsers: 0,
                inactiveUsers: 0,
                usersByRole: {},
                newUsersLast30Days: 0,
                lastLoginStats: {
                    last24Hours: 0,
                    last7Days: 0,
                    last30Days: 0
                }
            };

            const now = new Date();
            const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

            usersSnapshot.docs.forEach(doc => {
                const data = doc.data() as UserProfile;
                let createdAt: Date;
                if ((data.createdAt as any)?.toDate) {
                    createdAt = (data.createdAt as any).toDate();
                } else {
                    createdAt = new Date(data.createdAt as any);
                }
                let lastLoginAt: Date | null = null;
                if (data.lastLoginAt) {
                    if ((data.lastLoginAt as any)?.toDate) {
                        lastLoginAt = (data.lastLoginAt as any).toDate();
                    } else {
                        lastLoginAt = new Date(data.lastLoginAt as any);
                    }
                }

                stats.totalUsers++;

                // Count by active status
                if (data.isActive) {
                    stats.activeUsers++;
                } else {
                    stats.inactiveUsers++;
                }

                // Count by role
                const role = data.role || 'unknown';
                stats.usersByRole[role] = (stats.usersByRole[role] || 0) + 1;

                // Count new users in last 30 days
                if (createdAt >= last30Days) {
                    stats.newUsersLast30Days++;
                }

                // Count login activity
                if (lastLoginAt) {
                    if (lastLoginAt >= last24Hours) {
                        stats.lastLoginStats.last24Hours++;
                    }
                    if (lastLoginAt >= last7Days) {
                        stats.lastLoginStats.last7Days++;
                    }
                    if (lastLoginAt >= last30Days) {
                        stats.lastLoginStats.last30Days++;
                    }
                }
            });

            return stats;
        } catch (error) {
            console.error('Error calculating user stats:', error);
            throw new Error('Failed to calculate user stats');
        }
    }

    async deactivateUser(userId: string): Promise<UserProfile> {
        try {
            return await this.update(userId, { isActive: false });
        } catch (error) {
            console.error('Error deactivating user:', error);
            throw new Error('Failed to deactivate user');
        }
    }

    async activateUser(userId: string): Promise<UserProfile> {
        try {
            return await this.update(userId, { isActive: true });
        } catch (error) {
            console.error('Error activating user:', error);
            throw new Error('Failed to activate user');
        }
    }

    async updateLastLogin(userId: string): Promise<UserProfile> {
        try {
            return await this.update(userId, { lastLoginAt: new Date() });
        } catch (error) {
            console.error('Error updating last login:', error);
            throw new Error('Failed to update last login');
        }
    }

    async updateUserRole(userId: string, role: string): Promise<UserProfile> {
        try {
            return await this.update(userId, { role: role as UserRole });
        } catch (error) {
            console.error('Error updating user role:', error);
            throw new Error('Failed to update user role');
        }
    }
}
