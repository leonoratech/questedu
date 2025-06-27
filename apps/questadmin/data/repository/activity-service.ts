/**
 * Server-side Activity Repository
 * Handles all Firebase operations for activities on the server
 */

import { Activity, ActivitySearchFilters, ActivityStats, ActivityType, ResourceType } from '@/data/models/activity';
import { adminDb } from '@/data/repository/firebase-admin';
import { BaseRepository } from './base-service';

const ACTIVITY_COLLECTION = 'activities';

export class ActivityRepository extends BaseRepository<Activity> {
    constructor() {
        super(ACTIVITY_COLLECTION);
    }

    async searchActivities(filters: ActivitySearchFilters): Promise<Activity[]> {
        try {
            let activitiesQuery: FirebaseFirestore.Query = adminDb.collection(ACTIVITY_COLLECTION);

            // Apply filters
            if (filters.userId) {
                activitiesQuery = activitiesQuery.where('userId', '==', filters.userId);
            }

            if (filters.actionType) {
                activitiesQuery = activitiesQuery.where('actionType', '==', filters.actionType);
            }

            if (filters.resourceType) {
                activitiesQuery = activitiesQuery.where('resourceType', '==', filters.resourceType);
            }

            if (filters.resourceId) {
                activitiesQuery = activitiesQuery.where('resourceId', '==', filters.resourceId);
            }

            if (filters.collegeId) {
                activitiesQuery = activitiesQuery.where('collegeId', '==', filters.collegeId);
            }

            if (filters.programId) {
                activitiesQuery = activitiesQuery.where('programId', '==', filters.programId);
            }

            if (filters.batchId) {
                activitiesQuery = activitiesQuery.where('batchId', '==', filters.batchId);
            }

            // Apply date range filters
            if (filters.startDate) {
                activitiesQuery = activitiesQuery.where('timestamp', '>=', filters.startDate);
            }

            if (filters.endDate) {
                activitiesQuery = activitiesQuery.where('timestamp', '<=', filters.endDate);
            }

            // Apply ordering (newest first)
            activitiesQuery = activitiesQuery.orderBy('timestamp', 'desc');

            // Apply limit if specified
            if (filters.limit) {
                activitiesQuery = activitiesQuery.limit(filters.limit);
            }

            const querySnapshot = await activitiesQuery.get();
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    timestamp: data.timestamp?.toDate?.() || data.timestamp,
                } as Activity;
            });
        } catch (error) {
            console.error('Error searching activities:', error);
            throw new Error('Failed to search activities');
        }
    }

    async getUserActivities(userId: string, limit?: number): Promise<Activity[]> {
        try {
            let activitiesQuery = adminDb.collection(ACTIVITY_COLLECTION)
                .where('userId', '==', userId)
                .orderBy('timestamp', 'desc');

            if (limit) {
                activitiesQuery = activitiesQuery.limit(limit);
            }

            const querySnapshot = await activitiesQuery.get();
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    timestamp: data.timestamp?.toDate?.() || data.timestamp,
                } as Activity;
            });
        } catch (error) {
            console.error('Error fetching user activities:', error);
            throw new Error('Failed to fetch user activities');
        }
    }

    async getResourceActivities(resourceType: ResourceType, resourceId: string, limit?: number): Promise<Activity[]> {
        try {
            let activitiesQuery = adminDb.collection(ACTIVITY_COLLECTION)
                .where('resourceType', '==', resourceType)
                .where('resourceId', '==', resourceId)
                .orderBy('timestamp', 'desc');

            if (limit) {
                activitiesQuery = activitiesQuery.limit(limit);
            }

            const querySnapshot = await activitiesQuery.get();
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    timestamp: data.timestamp?.toDate?.() || data.timestamp,
                } as Activity;
            });
        } catch (error) {
            console.error('Error fetching resource activities:', error);
            throw new Error('Failed to fetch resource activities');
        }
    }

    async getRecentActivities(hours: number = 24, limit?: number): Promise<Activity[]> {
        try {
            const startTime = new Date();
            startTime.setHours(startTime.getHours() - hours);

            let activitiesQuery = adminDb.collection(ACTIVITY_COLLECTION)
                .where('timestamp', '>=', startTime)
                .orderBy('timestamp', 'desc');

            if (limit) {
                activitiesQuery = activitiesQuery.limit(limit);
            }

            const querySnapshot = await activitiesQuery.get();
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    timestamp: data.timestamp?.toDate?.() || data.timestamp,
                } as Activity;
            });
        } catch (error) {
            console.error('Error fetching recent activities:', error);
            throw new Error('Failed to fetch recent activities');
        }
    }

    async getActivityStats(collegeId?: string): Promise<ActivityStats> {
        try {
            let activitiesQuery: FirebaseFirestore.Query = adminDb.collection(ACTIVITY_COLLECTION);
            
            if (collegeId) {
                activitiesQuery = activitiesQuery.where('collegeId', '==', collegeId);
            }

            const activitiesSnapshot = await activitiesQuery.get();
            
            const stats: ActivityStats = {
                totalActivities: 0,
                activitiesByType: {} as Record<ActivityType, number>,
                activitiesByResource: {} as Record<ResourceType, number>,
                activitiesLast24Hours: 0,
                activitiesLast7Days: 0,
                activitiesLast30Days: 0,
                topUsers: []
            };

            const now = new Date();
            const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

            const userActivityCount = new Map<string, { userId: string; userName: string; count: number }>();

            activitiesSnapshot.docs.forEach(doc => {
                const data = doc.data() as Activity;
                let timestamp: Date;
                if (data.timestamp instanceof Date) {
                    timestamp = data.timestamp;
                } else if (typeof data.timestamp?.toDate === 'function') {
                    timestamp = data.timestamp.toDate();
                } else {
                    timestamp = new Date(data.timestamp as any);
                }
                
                stats.totalActivities++;

                // Count by action type
                const actionType = data.actionType as ActivityType;
                stats.activitiesByType[actionType] = (stats.activitiesByType[actionType] || 0) + 1;

                // Count by resource type
                const resourceType = data.resourceType as ResourceType;
                stats.activitiesByResource[resourceType] = (stats.activitiesByResource[resourceType] || 0) + 1;

                // Count time-based activities
                if (timestamp >= last24Hours) {
                    stats.activitiesLast24Hours++;
                }
                if (timestamp >= last7Days) {
                    stats.activitiesLast7Days++;
                }
                if (timestamp >= last30Days) {
                    stats.activitiesLast30Days++;
                }

                // Count user activities
                const userId = data.userId;
                const userName = data.userName || 'Unknown User';
                if (userActivityCount.has(userId)) {
                    userActivityCount.get(userId)!.count++;
                } else {
                    userActivityCount.set(userId, { userId, userName, count: 1 });
                }
            });

            // Get top 10 most active users
            stats.topUsers = Array.from(userActivityCount.values())
                .sort((a, b) => b.count - a.count)
                .slice(0, 10)
                .map(user => ({
                    userId: user.userId,
                    userName: user.userName,
                    activityCount: user.count
                }));

            return stats;
        } catch (error) {
            console.error('Error calculating activity stats:', error);
            throw new Error('Failed to calculate activity stats');
        }
    }

    async logActivity(activity: Omit<Activity, 'id' | 'timestamp'>): Promise<Activity> {
        try {
            const activityData = {
                ...activity,
                timestamp: new Date()
            };

            return await this.create(activityData as Activity);
        } catch (error) {
            console.error('Error logging activity:', error);
            throw new Error('Failed to log activity');
        }
    }

    async deleteOldActivities(daysToKeep: number = 90): Promise<number> {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

            const oldActivitiesQuery = adminDb.collection(ACTIVITY_COLLECTION)
                .where('timestamp', '<', cutoffDate);

            const querySnapshot = await oldActivitiesQuery.get();
            
            if (querySnapshot.empty) {
                return 0;
            }

            // Delete in batches to avoid timeout
            const batch = adminDb.batch();
            let deletedCount = 0;

            querySnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
                deletedCount++;
            });

            await batch.commit();
            return deletedCount;
        } catch (error) {
            console.error('Error deleting old activities:', error);
            throw new Error('Failed to delete old activities');
        }
    }
}
