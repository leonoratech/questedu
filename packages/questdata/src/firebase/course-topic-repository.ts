import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    QueryDocumentSnapshot,
    Timestamp,
    updateDoc,
    where,
    writeBatch
} from 'firebase/firestore';
import {
    CourseTopic,
    OperationResult,
    QueryResult
} from '../domain';
import { ICourseTopicRepository } from '../repositories';
import { FirebaseAppManager } from './app-manager';

const COLLECTION_NAME = 'courseTopics';

/**
 * Firebase implementation of the course topic repository
 */
export class FirebaseCourseTopicRepository implements ICourseTopicRepository {
    private appManager = FirebaseAppManager.getInstance();

    private get db() {
        return this.appManager.getDb();
    }

    private get enableLogging() {
        return this.appManager.getConfig().environment.enableDebugLogging;
    }

    private log(message: string, ...args: any[]) {
        if (this.enableLogging) {
            console.log(`[FirebaseCourseTopicRepository] ${message}`, ...args);
        }
    }

    private error(message: string, error: any) {
        console.error(`[FirebaseCourseTopicRepository] ${message}`, error);
    }

    /**
     * Convert Firestore document to CourseTopic model
     */
    private documentToCourseTopic(doc: QueryDocumentSnapshot): CourseTopic {
        const data = doc.data();
        return {
            id: doc.id,
            courseId: data.courseId,
            title: data.title,
            description: data.description,
            order: data.order,
            duration: data.duration,
            videoUrl: data.videoUrl,
            materials: data.materials,
            isPublished: data.isPublished,
            prerequisites: data.prerequisites,
            learningObjectives: data.learningObjectives,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
        };
    }

    async getAll(): Promise<QueryResult<CourseTopic>> {
        try {
            this.log('Fetching all course topics');
            
            const topicRef = collection(this.db, COLLECTION_NAME);
            const q = query(topicRef, orderBy('order', 'asc'));
            const querySnapshot = await getDocs(q);
            const topics = querySnapshot.docs.map(doc => this.documentToCourseTopic(doc));

            this.log(`Successfully fetched ${topics.length} course topics`);

            return {
                data: topics,
                total: topics.length,
                hasMore: false
            };
        } catch (error) {
            this.error('Failed to fetch all course topics', error);
            return {
                data: [],
                total: 0,
                hasMore: false
            };
        }
    }

    async getById(id: string): Promise<CourseTopic | null> {
        try {
            this.log('Fetching course topic by ID:', id);
            
            const topicRef = doc(this.db, COLLECTION_NAME, id);
            const docSnapshot = await getDoc(topicRef);

            if (!docSnapshot.exists()) {
                this.log('Course topic not found for ID:', id);
                return null;
            }

            const topic = this.documentToCourseTopic(docSnapshot);
            this.log('Successfully fetched course topic:', topic.id);

            return topic;
        } catch (error) {
            this.error('Failed to fetch course topic by ID', error);
            return null;
        }
    }

    async getByCourseId(courseId: string): Promise<QueryResult<CourseTopic>> {
        try {
            this.log('Fetching course topics by course ID:', courseId);
            
            const topicRef = collection(this.db, COLLECTION_NAME);
            const q = query(
                topicRef, 
                where('courseId', '==', courseId),
                orderBy('order', 'asc')
            );
            const querySnapshot = await getDocs(q);
            const topics = querySnapshot.docs.map(doc => this.documentToCourseTopic(doc));

            this.log(`Successfully fetched ${topics.length} course topics for course:`, courseId);

            return {
                data: topics,
                total: topics.length,
                hasMore: false
            };
        } catch (error) {
            this.error('Failed to fetch course topics by course ID', error);
            return {
                data: [],
                total: 0,
                hasMore: false
            };
        }
    }

    async create(topic: Omit<CourseTopic, 'id' | 'createdAt' | 'updatedAt'>): Promise<OperationResult<string>> {
        try {
            this.log('Creating new course topic:', topic);
            
            const topicRef = collection(this.db, COLLECTION_NAME);
            const newTopic = {
                ...topic,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            };

            const docRef = await addDoc(topicRef, newTopic);
            this.log('Successfully created course topic with ID:', docRef.id);

            return {
                success: true,
                data: docRef.id
            };
        } catch (error) {
            this.error('Failed to create course topic', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    async update(id: string, updateData: Partial<CourseTopic>): Promise<OperationResult<void>> {
        try {
            this.log('Updating course topic:', id, updateData);
            
            const topicRef = doc(this.db, COLLECTION_NAME, id);
            await updateDoc(topicRef, {
                ...updateData,
                updatedAt: Timestamp.now()
            });

            this.log('Successfully updated course topic:', id);
            return { success: true };
        } catch (error) {
            this.error('Failed to update course topic', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    async delete(id: string): Promise<OperationResult<void>> {
        try {
            this.log('Deleting course topic:', id);
            
            const topicRef = doc(this.db, COLLECTION_NAME, id);
            await deleteDoc(topicRef);

            this.log('Successfully deleted course topic:', id);
            return { success: true };
        } catch (error) {
            this.error('Failed to delete course topic', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    async reorderTopics(courseId: string, topicIds: string[]): Promise<OperationResult<void>> {
        try {
            this.log('Reordering course topics for course:', courseId, topicIds);
            
            const batch = writeBatch(this.db);
            
            topicIds.forEach((topicId, index) => {
                const topicRef = doc(this.db, COLLECTION_NAME, topicId);
                batch.update(topicRef, {
                    order: index + 1,
                    updatedAt: Timestamp.now()
                });
            });

            await batch.commit();
            this.log('Successfully reordered course topics');
            return { success: true };
        } catch (error) {
            this.error('Failed to reorder course topics', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
}
