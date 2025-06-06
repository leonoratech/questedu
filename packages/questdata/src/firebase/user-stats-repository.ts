import {
    deleteDoc,
    doc,
    getDoc,
    increment,
    setDoc,
    Timestamp,
    updateDoc
} from 'firebase/firestore';
import { OperationResult, UserStats } from '../domain';
import { IUserStatsRepository } from '../repositories';
import { FirebaseAppManager } from './app-manager';

const COLLECTION_NAME = 'user_stats';

/**
 * Firebase implementation of the UserStats repository
 */
export class FirebaseUserStatsRepository implements IUserStatsRepository {
  private appManager = FirebaseAppManager.getInstance();

  private get db() {
    return this.appManager.getDb();
  }

  private get enableLogging() {
    return this.appManager.getConfig().environment.enableDebugLogging;
  }

  private log(message: string, ...args: any[]) {
    if (this.enableLogging) {
      console.log(`[FirebaseUserStatsRepository] ${message}`, ...args);
    }
  }

  private error(message: string, error: any) {
    console.error(`[FirebaseUserStatsRepository] ${message}`, error);
  }

  /**
   * Convert Firestore document to UserStats model
   */
  private documentToUserStats(userId: string, data: any): UserStats {
    return {
      userId,
      coursesEnrolled: data.coursesEnrolled || 0,
      coursesCompleted: data.coursesCompleted || 0,
      totalLearningHours: data.totalLearningHours || 0,
      certificatesEarned: data.certificatesEarned || 0,
      coursesCreated: data.coursesCreated || 0,
      totalStudents: data.totalStudents || 0,
      totalRevenue: data.totalRevenue || 0,
      averageRating: data.averageRating || 0,
      updatedAt: data.updatedAt
    };
  }

  async getById(userId: string): Promise<UserStats | null> {
    try {
      this.log('Fetching user stats by ID:', userId);
      
      const docRef = doc(this.db, COLLECTION_NAME, userId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        this.log('User stats not found for ID:', userId);
        return null;
      }

      const stats = this.documentToUserStats(userId, docSnap.data());
      this.log('Successfully fetched user stats:', stats);

      return stats;
    } catch (error) {
      this.error('Failed to fetch user stats by ID', error);
      return null;
    }
  }

  async create(stats: UserStats): Promise<OperationResult<void>> {
    try {
      this.log('Creating new user stats:', stats);
      
      const docRef = doc(this.db, COLLECTION_NAME, stats.userId);
      const statsData = {
        ...stats,
        updatedAt: Timestamp.now()
      };

      await setDoc(docRef, statsData);
      this.log('Successfully created user stats for user:', stats.userId);

      return { success: true };
    } catch (error) {
      this.error('Failed to create user stats', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  async update(userId: string, updateData: Partial<UserStats>): Promise<OperationResult<void>> {
    try {
      this.log('Updating user stats:', userId, updateData);
      
      const docRef = doc(this.db, COLLECTION_NAME, userId);
      const updatePayload = {
        ...updateData,
        updatedAt: Timestamp.now()
      };

      await updateDoc(docRef, updatePayload);
      this.log('Successfully updated user stats:', userId);

      return { success: true };
    } catch (error) {
      this.error('Failed to update user stats', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  async incrementCoursesEnrolled(userId: string): Promise<OperationResult<void>> {
    try {
      this.log('Incrementing courses enrolled for user:', userId);
      
      const docRef = doc(this.db, COLLECTION_NAME, userId);
      await updateDoc(docRef, {
        coursesEnrolled: increment(1),
        updatedAt: Timestamp.now()
      });

      this.log('Successfully incremented courses enrolled for user:', userId);
      return { success: true };
    } catch (error) {
      this.error('Failed to increment courses enrolled', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  async incrementCoursesCompleted(userId: string): Promise<OperationResult<void>> {
    try {
      this.log('Incrementing courses completed for user:', userId);
      
      const docRef = doc(this.db, COLLECTION_NAME, userId);
      await updateDoc(docRef, {
        coursesCompleted: increment(1),
        updatedAt: Timestamp.now()
      });

      this.log('Successfully incremented courses completed for user:', userId);
      return { success: true };
    } catch (error) {
      this.error('Failed to increment courses completed', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  async incrementCoursesCreated(userId: string): Promise<OperationResult<void>> {
    try {
      this.log('Incrementing courses created for user:', userId);
      
      const docRef = doc(this.db, COLLECTION_NAME, userId);
      await updateDoc(docRef, {
        coursesCreated: increment(1),
        updatedAt: Timestamp.now()
      });

      this.log('Successfully incremented courses created for user:', userId);
      return { success: true };
    } catch (error) {
      this.error('Failed to increment courses created', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  async updateLearningHours(userId: string, hours: number): Promise<OperationResult<void>> {
    try {
      this.log('Updating learning hours for user:', userId, 'hours:', hours);
      
      const docRef = doc(this.db, COLLECTION_NAME, userId);
      await updateDoc(docRef, {
        totalLearningHours: increment(hours),
        updatedAt: Timestamp.now()
      });

      this.log('Successfully updated learning hours for user:', userId);
      return { success: true };
    } catch (error) {
      this.error('Failed to update learning hours', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  async delete(userId: string): Promise<OperationResult<void>> {
    try {
      this.log('Deleting user stats:', userId);
      
      const docRef = doc(this.db, COLLECTION_NAME, userId);
      await deleteDoc(docRef);

      this.log('Successfully deleted user stats:', userId);
      return { success: true };
    } catch (error) {
      this.error('Failed to delete user stats', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}