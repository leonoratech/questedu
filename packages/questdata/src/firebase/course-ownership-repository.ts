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
    CourseOwnership,
    OperationResult,
    QueryResult
} from '../domain';
import { ICourseOwnershipRepository } from '../repositories';
import { FirebaseAppManager } from './app-manager';

const COLLECTION_NAME = 'course_ownerships';

/**
 * Firebase implementation of the course ownership repository
 */
export class FirebaseCourseOwnershipRepository implements ICourseOwnershipRepository {
    private appManager = FirebaseAppManager.getInstance();

    private get db() {
        return this.appManager.getDb();
    }

    private get enableLogging() {
        return this.appManager.getConfig().environment.enableDebugLogging;
    }

    private log(message: string, ...args: any[]) {
        if (this.enableLogging) {
            console.log(`[FirebaseCourseOwnershipRepository] ${message}`, ...args);
        }
    }

    private error(message: string, error: any) {
        console.error(`[FirebaseCourseOwnershipRepository] ${message}`, error);
    }

    /**
     * Convert Firestore document to CourseOwnership model
     */
    private documentToCourseOwnership(doc: QueryDocumentSnapshot): CourseOwnership {
        const data = doc.data();
        return {
            id: doc.id,
            userId: data.userId,
            courseId: data.courseId,
            isOwner: data.isOwner,
            permissions: data.permissions,
            createdAt: data.createdAt
        };
    }

    async getAll(): Promise<QueryResult<CourseOwnership>> {
        try {
            this.log('Fetching all course ownerships');
            
            const ownershipRef = collection(this.db, COLLECTION_NAME);
            const querySnapshot = await getDocs(ownershipRef);
            const ownerships = querySnapshot.docs.map(doc => this.documentToCourseOwnership(doc));

            this.log(`Successfully fetched ${ownerships.length} course ownerships`);

            return {
                data: ownerships,
                total: ownerships.length,
                hasMore: false
            };
        } catch (error) {
            this.error('Failed to fetch all course ownerships', error);
            return {
                data: [],
                total: 0,
                hasMore: false
            };
        }
    }

    async getById(id: string): Promise<CourseOwnership | null> {
        try {
            this.log('Fetching course ownership by ID:', id);
            
            const ownershipRef = doc(this.db, COLLECTION_NAME, id);
            const docSnapshot = await getDoc(ownershipRef);

            if (!docSnapshot.exists()) {
                this.log('Course ownership not found for ID:', id);
                return null;
            }

            const ownership = this.documentToCourseOwnership(docSnapshot);
            this.log('Successfully fetched course ownership:', ownership.id);

            return ownership;
        } catch (error) {
            this.error('Failed to fetch course ownership by ID', error);
            return null;
        }
    }

    async getByCourseId(courseId: string): Promise<QueryResult<CourseOwnership>> {
        try {
            this.log('Fetching course ownerships by course ID:', courseId);
            
            const ownershipRef = collection(this.db, COLLECTION_NAME);
            const q = query(ownershipRef, where('courseId', '==', courseId));
            const querySnapshot = await getDocs(q);
            const ownerships = querySnapshot.docs.map(doc => this.documentToCourseOwnership(doc));

            this.log(`Successfully fetched ${ownerships.length} course ownerships for course:`, courseId);

            return {
                data: ownerships,
                total: ownerships.length,
                hasMore: false
            };
        } catch (error) {
            this.error('Failed to fetch course ownerships by course ID', error);
            return {
                data: [],
                total: 0,
                hasMore: false
            };
        }
    }

    async getByUserId(userId: string): Promise<QueryResult<CourseOwnership>> {
        try {
            this.log('Fetching course ownerships by user ID:', userId);
            
            const ownershipRef = collection(this.db, COLLECTION_NAME);
            const q = query(ownershipRef, where('userId', '==', userId));
            const querySnapshot = await getDocs(q);
            const ownerships = querySnapshot.docs.map(doc => this.documentToCourseOwnership(doc));

            this.log(`Successfully fetched ${ownerships.length} course ownerships for user:`, userId);

            return {
                data: ownerships,
                total: ownerships.length,
                hasMore: false
            };
        } catch (error) {
            this.error('Failed to fetch course ownerships by user ID', error);
            return {
                data: [],
                total: 0,
                hasMore: false
            };
        }
    }

    async create(ownership: Omit<CourseOwnership, 'id' | 'createdAt'>): Promise<OperationResult<string>> {
        try {
            this.log('Creating new course ownership:', ownership);
            
            const ownershipRef = collection(this.db, COLLECTION_NAME);
            const newOwnership = {
                ...ownership,
                createdAt: Timestamp.now()
            };

            const docRef = await addDoc(ownershipRef, newOwnership);
            this.log('Successfully created course ownership with ID:', docRef.id);

            return {
                success: true,
                data: docRef.id
            };
        } catch (error) {
            this.error('Failed to create course ownership', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    async update(id: string, updateData: Partial<CourseOwnership>): Promise<OperationResult<void>> {
        try {
            this.log('Updating course ownership:', id, updateData);
            
            const ownershipRef = doc(this.db, COLLECTION_NAME, id);
            await updateDoc(ownershipRef, {
                ...updateData,
                updatedAt: Timestamp.now()
            });

            this.log('Successfully updated course ownership:', id);
            return { success: true };
        } catch (error) {
            this.error('Failed to update course ownership', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    async delete(id: string): Promise<OperationResult<void>> {
        try {
            this.log('Deleting course ownership:', id);
            
            const ownershipRef = doc(this.db, COLLECTION_NAME, id);
            await deleteDoc(ownershipRef);

            this.log('Successfully deleted course ownership:', id);
            return { success: true };
        } catch (error) {
            this.error('Failed to delete course ownership', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    async transferOwnership(courseId: string, fromUserId: string, toUserId: string): Promise<OperationResult<void>> {
        try {
            this.log('Transferring course ownership:', { courseId, fromUserId, toUserId });
            
            // Find the existing ownership record
            const ownershipRef = collection(this.db, COLLECTION_NAME);
            const q = query(
                ownershipRef, 
                where('courseId', '==', courseId), 
                where('userId', '==', fromUserId),
                where('isOwner', '==', true)
            );
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                return {
                    success: false,
                    error: 'No ownership record found for the specified user and course'
                };
            }

            // Update the existing ownership record
            const existingDoc = querySnapshot.docs[0];
            await updateDoc(doc(this.db, COLLECTION_NAME, existingDoc.id), {
                userId: toUserId,
                updatedAt: Timestamp.now()
            });

            this.log('Successfully transferred course ownership');
            return { success: true };
        } catch (error) {
            this.error('Failed to transfer course ownership', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
}
