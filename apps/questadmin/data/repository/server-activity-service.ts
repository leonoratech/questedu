/**
 * Server-side Activity Service
 * Handles all Firebase operations for instructor activities on the server
 * Updated to use the new instructor activity model
 */

import {
    CreateInstructorActivityRequest
} from '@/data/models/instructor-activity';
import { InstructorActivityRepository } from './instructor-activity-service';

// For backward compatibility, re-export the old interfaces
import { CreateActivityData, InstructorActivity as LegacyInstructorActivity } from '@/data/models/data-model';

/**
 * Activity Repository with backward compatibility
 * Delegates to the new InstructorActivityRepository
 */
export class ActivityRepository {
  private instructorActivityRepo: InstructorActivityRepository;

  constructor() {
    this.instructorActivityRepo = new InstructorActivityRepository();
  }

  /**
   * Record activity - backward compatible method
   */
  async recordActivity(activityData: CreateActivityData, instructorId: string): Promise<string> {
    try {
      // Convert legacy activity data to new format
      const newActivityData: CreateInstructorActivityRequest = {
        instructorId,
        type: activityData.type as any, // Type conversion needed
        courseId: activityData.courseId,
        courseName: activityData.courseName,
        description: activityData.description,
        metadata: activityData.metadata
      };

      const activityId = await this.instructorActivityRepo.createActivity(newActivityData);
      console.log('Activity recorded:', newActivityData.type, newActivityData.courseName);
      return activityId;
    } catch (error) {
      console.error('Error recording activity:', error);
      throw new Error('Failed to record activity');
    }
  }

  /**
   * Get instructor activities - backward compatible method
   */
  async getInstructorActivitiesServer(
    instructorId: string,
    options: { limit: number }
  ): Promise<LegacyInstructorActivity[]> {
    try {
      const activities = await this.instructorActivityRepo.getActivitiesByInstructor(
        instructorId, 
        options.limit
      );

      // Convert new format back to legacy format for compatibility
      return activities.map(activity => ({
        id: activity.id,
        instructorId: activity.instructorId,
        type: activity.type as any, // Type conversion
        courseId: activity.courseId || '',
        courseName: activity.courseName || '',
        description: activity.description,
        metadata: activity.metadata || {},
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt
      })) as LegacyInstructorActivity[];
    } catch (error) {
      console.error('Error fetching instructor activities:', error);
      throw new Error('Failed to fetch activities');
    }
  }

  /**
   * Convert activities to dashboard format (server-side)
   */
  formatActivitiesForDashboardServer(activities: LegacyInstructorActivity[]): Array<{
    id: string
    action: string
    user: string
    time: string
    type: 'activity'
    courseId?: string
  }> {
    return activities.map(activity => ({
      id: activity.id || '',
      action: activity.description,
      user: 'You', // Since these are instructor's own activities
      time: this.formatRelativeTime(activity.createdAt instanceof Date ? activity.createdAt : new Date(activity.createdAt as any)),
      type: 'activity' as const,
      courseId: activity.courseId
    }))
  }

  /**
   * Helper function to format relative time
   */
  formatRelativeTime(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`

    return date.toLocaleDateString()
  }

  /**
   * Access to the underlying instructor activity repository
   */
  getInstructorActivityRepository(): InstructorActivityRepository {
    return this.instructorActivityRepo;
  }
}



