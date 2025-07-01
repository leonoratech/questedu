/**
 * Server-side Instructor Activity Repository
 * Handles all Firebase operations for instructor activities on the server
 */

import {
    ActivitySearchFilters,
    ActivityStats,
    CreateInstructorActivityRequest,
    InstructorActivity,
    InstructorActivityType
} from '@/data/models/instructor-activity'
import { BaseRepository } from './base-service'
import { adminDb } from './firebase-admin'

const INSTRUCTOR_ACTIVITIES_COLLECTION = 'instructorActivities'

export class InstructorActivityRepository extends BaseRepository<InstructorActivity> {
  constructor() {
    super(INSTRUCTOR_ACTIVITIES_COLLECTION)
  }

  async createActivity(data: CreateInstructorActivityRequest): Promise<string> {
    const activityData: Omit<InstructorActivity, 'id'> = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const docRef = await adminDb.collection(INSTRUCTOR_ACTIVITIES_COLLECTION).add(activityData)
    return docRef.id
  }

  async getActivitiesByInstructor(
    instructorId: string, 
    limit: number = 10
  ): Promise<InstructorActivity[]> {
    try {
      const querySnapshot = await adminDb
        .collection(INSTRUCTOR_ACTIVITIES_COLLECTION)
        .where('instructorId', '==', instructorId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get()

      return querySnapshot.docs.map((doc: any) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        } as InstructorActivity
      })
    } catch (error) {
      console.error('Error fetching instructor activities:', error)
      throw new Error('Failed to fetch instructor activities')
    }
  }

  async getActivitiesByCourse(
    courseId: string, 
    limit: number = 10
  ): Promise<InstructorActivity[]> {
    try {
      const querySnapshot = await adminDb
        .collection(INSTRUCTOR_ACTIVITIES_COLLECTION)
        .where('courseId', '==', courseId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get()

      return querySnapshot.docs.map((doc: any) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        } as InstructorActivity
      })
    } catch (error) {
      console.error('Error fetching course activities:', error)
      throw new Error('Failed to fetch course activities')
    }
  }

  async searchActivities(filters: ActivitySearchFilters): Promise<InstructorActivity[]> {
    try {
      let query: any = adminDb.collection(INSTRUCTOR_ACTIVITIES_COLLECTION)

      // Apply filters
      if (filters.instructorId) {
        query = query.where('instructorId', '==', filters.instructorId)
      }

      if (filters.type) {
        query = query.where('type', '==', filters.type)
      }

      if (filters.courseId) {
        query = query.where('courseId', '==', filters.courseId)
      }

      if (filters.topicId) {
        query = query.where('topicId', '==', filters.topicId)
      }

      if (filters.questionId) {
        query = query.where('questionId', '==', filters.questionId)
      }

      if (filters.startDate) {
        query = query.where('createdAt', '>=', filters.startDate)
      }

      if (filters.endDate) {
        query = query.where('createdAt', '<=', filters.endDate)
      }

      // Apply ordering and limit
      query = query.orderBy('createdAt', 'desc')

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const querySnapshot = await query.get()

      return querySnapshot.docs.map((doc: any) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        } as InstructorActivity
      })
    } catch (error) {
      console.error('Error searching activities:', error)
      throw new Error('Failed to search activities')
    }
  }

  async getActivityStats(instructorId?: string): Promise<ActivityStats> {
    try {
      let query: any = adminDb.collection(INSTRUCTOR_ACTIVITIES_COLLECTION)

      if (instructorId) {
        query = query.where('instructorId', '==', instructorId)
      }

      const allActivitiesSnapshot = await query.get()
      const activities = allActivitiesSnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      })) as InstructorActivity[]

      const totalActivities = activities.length

      // Calculate activities by type
      const activitiesByType: Record<InstructorActivityType, number> = Object.values(InstructorActivityType).reduce(
        (acc, type) => {
          acc[type] = activities.filter(activity => activity.type === type).length
          return acc
        },
        {} as Record<InstructorActivityType, number>
      )

      // Calculate time-based stats
      const now = new Date()
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const activitiesLast24Hours = activities.filter(
        activity => activity.createdAt && activity.createdAt >= oneDayAgo
      ).length

      const activitiesLast7Days = activities.filter(
        activity => activity.createdAt && activity.createdAt >= sevenDaysAgo
      ).length

      const activitiesLast30Days = activities.filter(
        activity => activity.createdAt && activity.createdAt >= thirtyDaysAgo
      ).length

      // Find most active instructor (if not filtering by instructor)
      let mostActiveInstructor: { instructorId: string; activityCount: number } | undefined

      if (!instructorId) {
        const instructorCounts: Record<string, number> = {}
        activities.forEach(activity => {
          instructorCounts[activity.instructorId] = (instructorCounts[activity.instructorId] || 0) + 1
        })

        const topInstructor = Object.entries(instructorCounts).reduce(
          (max, [id, count]) => (count > max.activityCount ? { instructorId: id, activityCount: count } : max),
          { instructorId: '', activityCount: 0 }
        )

        if (topInstructor.activityCount > 0) {
          mostActiveInstructor = topInstructor
        }
      }

      return {
        totalActivities,
        activitiesByType,
        activitiesLast24Hours,
        activitiesLast7Days,
        activitiesLast30Days,
        mostActiveInstructor
      }
    } catch (error) {
      console.error('Error getting activity stats:', error)
      throw new Error('Failed to get activity stats')
    }
  }

  async deleteActivitiesByCourse(courseId: string): Promise<void> {
    try {
      const activities = await this.getActivitiesByCourse(courseId, 1000) // Get all activities for the course
      
      const deletePromises = activities.map(activity => this.delete(activity.id!))
      await Promise.all(deletePromises)
    } catch (error) {
      console.error('Error deleting course activities:', error)
      throw new Error('Failed to delete course activities')
    }
  }

  async deleteActivitiesByInstructor(instructorId: string): Promise<void> {
    try {
      const activities = await this.getActivitiesByInstructor(instructorId, 1000) // Get all activities for the instructor
      
      const deletePromises = activities.map(activity => this.delete(activity.id!))
      await Promise.all(deletePromises)
    } catch (error) {
      console.error('Error deleting instructor activities:', error)
      throw new Error('Failed to delete instructor activities')
    }
  }
}
