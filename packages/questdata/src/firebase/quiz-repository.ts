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
    OperationResult,
    QueryResult,
    Quiz
} from '../domain';
import { IQuizRepository } from '../repositories';
import { FirebaseAppManager } from './app-manager';

const COLLECTION_NAME = 'quizzes';

/**
 * Firebase implementation of the quiz repository
 */
export class FirebaseQuizRepository implements IQuizRepository {
    private appManager = FirebaseAppManager.getInstance();

    private get db() {
        return this.appManager.getDb();
    }

    private get enableLogging() {
        return this.appManager.getConfig().environment.enableDebugLogging;
    }

    private log(message: string, ...args: any[]) {
        if (this.enableLogging) {
            console.log(`[FirebaseQuizRepository] ${message}`, ...args);
        }
    }

    private error(message: string, error: any) {
        console.error(`[FirebaseQuizRepository] ${message}`, error);
    }

    /**
     * Convert Firestore document to Quiz model
     */
    private documentToQuiz(doc: QueryDocumentSnapshot): Quiz {
        const data = doc.data();
        return {
            id: doc.id,
            courseId: data.courseId,
            topicId: data.topicId,
            title: data.title,
            description: data.description,
            instructions: data.instructions,
            totalQuestions: data.totalQuestions,
            timeLimit: data.timeLimit,
            attemptsAllowed: data.attemptsAllowed,
            passingScore: data.passingScore,
            shuffleQuestions: data.shuffleQuestions,
            shuffleAnswers: data.shuffleAnswers,
            showResultsImmediately: data.showResultsImmediately,
            questionIds: data.questionIds,
            questionBankId: data.questionBankId,
            questionSelection: data.questionSelection,
            isPublished: data.isPublished,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
        };
    }

    async getAll(): Promise<QueryResult<Quiz>> {
        try {
            this.log('Fetching all quizzes');
            
            const quizRef = collection(this.db, COLLECTION_NAME);
            const querySnapshot = await getDocs(quizRef);
            const quizzes = querySnapshot.docs.map(doc => this.documentToQuiz(doc));

            this.log(`Successfully fetched ${quizzes.length} quizzes`);

            return {
                data: quizzes,
                total: quizzes.length,
                hasMore: false
            };
        } catch (error) {
            this.error('Failed to fetch all quizzes', error);
            return {
                data: [],
                total: 0,
                hasMore: false
            };
        }
    }

    async getById(id: string): Promise<Quiz | null> {
        try {
            this.log('Fetching quiz by ID:', id);
            
            const quizRef = doc(this.db, COLLECTION_NAME, id);
            const docSnapshot = await getDoc(quizRef);

            if (!docSnapshot.exists()) {
                this.log('Quiz not found for ID:', id);
                return null;
            }

            const quiz = this.documentToQuiz(docSnapshot);
            this.log('Successfully fetched quiz:', quiz.id);

            return quiz;
        } catch (error) {
            this.error('Failed to fetch quiz by ID', error);
            return null;
        }
    }

    async getByCourseId(courseId: string): Promise<QueryResult<Quiz>> {
        try {
            this.log('Fetching quizzes by course ID:', courseId);
            
            const quizRef = collection(this.db, COLLECTION_NAME);
            const q = query(quizRef, where('courseId', '==', courseId));
            const querySnapshot = await getDocs(q);
            const quizzes = querySnapshot.docs.map(doc => this.documentToQuiz(doc));

            this.log(`Successfully fetched ${quizzes.length} quizzes for course:`, courseId);

            return {
                data: quizzes,
                total: quizzes.length,
                hasMore: false
            };
        } catch (error) {
            this.error('Failed to fetch quizzes by course ID', error);
            return {
                data: [],
                total: 0,
                hasMore: false
            };
        }
    }

    async getByTopicId(topicId: string): Promise<QueryResult<Quiz>> {
        try {
            this.log('Fetching quizzes by topic ID:', topicId);
            
            const quizRef = collection(this.db, COLLECTION_NAME);
            const q = query(quizRef, where('topicId', '==', topicId));
            const querySnapshot = await getDocs(q);
            const quizzes = querySnapshot.docs.map(doc => this.documentToQuiz(doc));

            this.log(`Successfully fetched ${quizzes.length} quizzes for topic:`, topicId);

            return {
                data: quizzes,
                total: quizzes.length,
                hasMore: false
            };
        } catch (error) {
            this.error('Failed to fetch quizzes by topic ID', error);
            return {
                data: [],
                total: 0,
                hasMore: false
            };
        }
    }

    async create(quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>): Promise<OperationResult<string>> {
        try {
            this.log('Creating new quiz:', quiz);
            
            const quizRef = collection(this.db, COLLECTION_NAME);
            const newQuiz = {
                ...quiz,
                isPublished: false,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            };

            const docRef = await addDoc(quizRef, newQuiz);
            this.log('Successfully created quiz with ID:', docRef.id);

            return {
                success: true,
                data: docRef.id
            };
        } catch (error) {
            this.error('Failed to create quiz', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    async update(id: string, updateData: Partial<Quiz>): Promise<OperationResult<void>> {
        try {
            this.log('Updating quiz:', id, updateData);
            
            const quizRef = doc(this.db, COLLECTION_NAME, id);
            await updateDoc(quizRef, {
                ...updateData,
                updatedAt: Timestamp.now()
            });

            this.log('Successfully updated quiz:', id);
            return { success: true };
        } catch (error) {
            this.error('Failed to update quiz', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    async delete(id: string): Promise<OperationResult<void>> {
        try {
            this.log('Deleting quiz:', id);
            
            const quizRef = doc(this.db, COLLECTION_NAME, id);
            await deleteDoc(quizRef);

            this.log('Successfully deleted quiz:', id);
            return { success: true };
        } catch (error) {
            this.error('Failed to delete quiz', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    async publish(id: string): Promise<OperationResult<void>> {
        try {
            this.log('Publishing quiz:', id);
            
            const quizRef = doc(this.db, COLLECTION_NAME, id);
            await updateDoc(quizRef, {
                isPublished: true,
                updatedAt: Timestamp.now()
            });

            this.log('Successfully published quiz:', id);
            return { success: true };
        } catch (error) {
            this.error('Failed to publish quiz', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    async unpublish(id: string): Promise<OperationResult<void>> {
        try {
            this.log('Unpublishing quiz:', id);
            
            const quizRef = doc(this.db, COLLECTION_NAME, id);
            await updateDoc(quizRef, {
                isPublished: false,
                updatedAt: Timestamp.now()
            });

            this.log('Successfully unpublished quiz:', id);
            return { success: true };
        } catch (error) {
            this.error('Failed to unpublish quiz', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
}
