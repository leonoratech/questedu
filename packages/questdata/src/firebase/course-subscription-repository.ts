import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    QueryDocumentSnapshot,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import {
    CourseSubscription,
    OperationResult,
    QueryResult
} from '../domain';
import { ICourseSubscriptionRepository } from '../repositories';
import { FirebaseAppManager } from './app-manager';

const COLLECTION_NAME = 'course_subscriptions';

/**
 * Firebase implementation of the course subscription repository
 */
export class FirebaseCourseSubscriptionRepository implements ICourseSubscriptionRepository {
    private appManager = FirebaseAppManager.getInstance();

    private get db() {
        return this.appManager.getDb();
    }

    private get enableLogging() {
        return this.appManager.getConfig().environment.enableDebugLogging;
    }

    private log(message: string, ...args: any[]) {
        if (this.enableLogging) {
            console.log(`[FirebaseCourseSubscriptionRepository] ${message}`, ...args);
        }
    }

    private error(message: string, error: any) {
        console.error(`[FirebaseCourseSubscriptionRepository] ${message}`, error);
    }

    /**
     * Convert Firestore document to CourseSubscription model
     */
    private documentToCourseSubscription(doc: QueryDocumentSnapshot): CourseSubscription {
        const data = doc.data();
        return {
            id: doc.id,
            userId: data.userId,
            courseId: data.courseId,
            status: data.status,
            enrolledAt: data.enrolledAt,
            completedAt: data.completedAt,
            progress: data.progress,
            lastAccessedAt: data.lastAccessedAt,
            certificateIssued: data.certificateIssued,
            certificateId: data.certificateId
        };
    }

    async getAll(): Promise<QueryResult<CourseSubscription>> {
        try {
            this.log('Fetching all course subscriptions');
            
            const subscriptionRef = collection(this.db, COLLECTION_NAME);
            const querySnapshot = await getDocs(subscriptionRef);
            const subscriptions = querySnapshot.docs.map(doc => this.documentToCourseSubscription(doc));

            this.log(`Successfully fetched ${subscriptions.length} course subscriptions`);

            return {
                data: subscriptions,
                total: subscriptions.length,
                hasMore: false
            };
        } catch (error) {
            this.error('Failed to fetch all course subscriptions', error);
            return {
                data: [],
                total: 0,
                hasMore: false
            };
        }
    }

    async getById(id: string): Promise<CourseSubscription | null> {
        try {
            this.log('Fetching course subscription by ID:', id);
            
            const subscriptionRef = doc(this.db, COLLECTION_NAME, id);
            const docSnapshot = await getDoc(subscriptionRef);

            if (!docSnapshot.exists()) {
                this.log('Course subscription not found for ID:', id);
                return null;
            }

            const subscription = this.documentToCourseSubscription(docSnapshot);
            this.log('Successfully fetched course subscription:', subscription.id);

            return subscription;
        } catch (error) {
            this.error('Failed to fetch course subscription by ID', error);
            return null;
        }
    }

    async getByCourseId(courseId: string): Promise<QueryResult<CourseSubscription>> {
        try {
            this.log('Fetching course subscriptions by course ID:', courseId);
            
            const subscriptionRef = collection(this.db, COLLECTION_NAME);
            const q = query(subscriptionRef, where('courseId', '==', courseId));
            const querySnapshot = await getDocs(q);
            const subscriptions = querySnapshot.docs.map(doc => this.documentToCourseSubscription(doc));

            this.log(`Successfully fetched ${subscriptions.length} course subscriptions for course:`, courseId);

            return {
                data: subscriptions,
                total: subscriptions.length,
                hasMore: false
            };
        } catch (error) {
            this.error('Failed to fetch course subscriptions by course ID', error);
            return {
                data: [],
                total: 0,
                hasMore: false
            };
        }
    }

    async getByUserId(userId: string): Promise<QueryResult<CourseSubscription>> {
        try {
            this.log('Fetching course subscriptions by user ID:', userId);
            
            const subscriptionRef = collection(this.db, COLLECTION_NAME);
            const q = query(subscriptionRef, where('userId', '==', userId));
            const querySnapshot = await getDocs(q);
            const subscriptions = querySnapshot.docs.map(doc => this.documentToCourseSubscription(doc));

            this.log(`Successfully fetched ${subscriptions.length} course subscriptions for user:`, userId);

            return {
                data: subscriptions,
                total: subscriptions.length,
                hasMore: false
            };
        } catch (error) {
            this.error('Failed to fetch course subscriptions by user ID', error);
            return {
                data: [],
                total: 0,
                hasMore: false
            };
        }
    }

    async create(subscription: Omit<CourseSubscription, 'id'>): Promise<OperationResult<string>> {
        try {
            this.log('Creating new course subscription:', subscription);
            
            const subscriptionRef = collection(this.db, COLLECTION_NAME);
            const newSubscription = {
                ...subscription,
                enrolledAt: subscription.enrolledAt || Timestamp.now()
            };

            const docRef = await addDoc(subscriptionRef, newSubscription);
            this.log('Successfully created course subscription with ID:', docRef.id);

            return {
                success: true,
                data: docRef.id
            };
        } catch (error) {
            this.error('Failed to create course subscription', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    async update(id: string, updateData: Partial<CourseSubscription>): Promise<OperationResult<void>> {
        try {
            this.log('Updating course subscription:', id, updateData);
            
            const subscriptionRef = doc(this.db, COLLECTION_NAME, id);
            await updateDoc(subscriptionRef, {
                ...updateData,
                lastAccessedAt: Timestamp.now()
            });

            this.log('Successfully updated course subscription:', id);
            return { success: true };
        } catch (error) {
            this.error('Failed to update course subscription', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    async delete(id: string): Promise<OperationResult<void>> {
        try {
            this.log('Deleting course subscription:', id);
            
            const subscriptionRef = doc(this.db, COLLECTION_NAME, id);
            await deleteDoc(subscriptionRef);

            this.log('Successfully deleted course subscription:', id);
            return { success: true };
        } catch (error) {
            this.error('Failed to delete course subscription', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    async updateProgress(id: string, progress: number): Promise<OperationResult<void>> {
        try {
            this.log('Updating course subscription progress:', id, progress);
            
            const subscriptionRef = doc(this.db, COLLECTION_NAME, id);
            const updateData: any = {
                progress,
                lastAccessedAt: Timestamp.now()
            };

            // If progress is 100%, mark as completed
            if (progress >= 100) {
                updateData.completedAt = Timestamp.now();
                updateData.status = 'active'; // Could be 'completed' based on your enum
            }

            await updateDoc(subscriptionRef, updateData);

            this.log('Successfully updated course subscription progress:', id);
            return { success: true };
        } catch (error) {
            this.error('Failed to update course subscription progress', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    async markCompleted(id: string): Promise<OperationResult<void>> {
        try {
            this.log('Marking course subscription as completed:', id);
            
            const subscriptionRef = doc(this.db, COLLECTION_NAME, id);
            await updateDoc(subscriptionRef, {
                progress: 100,
                completedAt: Timestamp.now(),
                status: 'active', // Update based on your SubscriptionStatus enum
                lastAccessedAt: Timestamp.now()
            });

            this.log('Successfully marked course subscription as completed:', id);
            return { success: true };
        } catch (error) {
            this.error('Failed to mark course subscription as completed', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
}
