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
    QuizAttempt
} from '../domain';
import { IQuizAttemptRepository } from '../repositories';
import { FirebaseAppManager } from './app-manager';

const COLLECTION_NAME = 'quiz_attempts';

/**
 * Firebase implementation of the quiz attempt repository
 */
export class FirebaseQuizAttemptRepository implements IQuizAttemptRepository {
    private appManager = FirebaseAppManager.getInstance();

    private get db() {
        return this.appManager.getDb();
    }

    private get enableLogging() {
        return this.appManager.getConfig().environment.enableDebugLogging;
    }

    private log(message: string, ...args: any[]) {
        if (this.enableLogging) {
            console.log(`[FirebaseQuizAttemptRepository] ${message}`, ...args);
        }
    }

    private error(message: string, error: any) {
        console.error(`[FirebaseQuizAttemptRepository] ${message}`, error);
    }

    /**
     * Convert Firestore document to QuizAttempt model
     */
    private documentToQuizAttempt(doc: QueryDocumentSnapshot): QuizAttempt {
        const data = doc.data();
        return {
            id: doc.id,
            quizId: data.quizId,
            userId: data.userId,
            courseId: data.courseId,
            attemptNumber: data.attemptNumber,
            startedAt: data.startedAt,
            completedAt: data.completedAt,
            timeSpent: data.timeSpent,
            totalQuestions: data.totalQuestions,
            answeredQuestions: data.answeredQuestions,
            correctAnswers: data.correctAnswers,
            score: data.score,
            passed: data.passed,
            answers: data.answers,
            hasEssayQuestions: data.hasEssayQuestions,
            essayGradingStatus: data.essayGradingStatus,
            autoGradableScore: data.autoGradableScore,
            finalScore: data.finalScore,
            createdAt: data.createdAt
        };
    }

    async getAll(): Promise<QueryResult<QuizAttempt>> {
        try {
            this.log('Fetching all quiz attempts');
            
            const attemptRef = collection(this.db, COLLECTION_NAME);
            const querySnapshot = await getDocs(attemptRef);
            const attempts = querySnapshot.docs.map(doc => this.documentToQuizAttempt(doc));

            this.log(`Successfully fetched ${attempts.length} quiz attempts`);

            return {
                data: attempts,
                total: attempts.length,
                hasMore: false
            };
        } catch (error) {
            this.error('Failed to fetch all quiz attempts', error);
            return {
                data: [],
                total: 0,
                hasMore: false
            };
        }
    }

    async getById(id: string): Promise<QuizAttempt | null> {
        try {
            this.log('Fetching quiz attempt by ID:', id);
            
            const attemptRef = doc(this.db, COLLECTION_NAME, id);
            const docSnapshot = await getDoc(attemptRef);

            if (!docSnapshot.exists()) {
                this.log('Quiz attempt not found for ID:', id);
                return null;
            }

            const attempt = this.documentToQuizAttempt(docSnapshot);
            this.log('Successfully fetched quiz attempt:', attempt.id);

            return attempt;
        } catch (error) {
            this.error('Failed to fetch quiz attempt by ID', error);
            return null;
        }
    }

    async getByQuizId(quizId: string): Promise<QueryResult<QuizAttempt>> {
        try {
            this.log('Fetching quiz attempts by quiz ID:', quizId);
            
            const attemptRef = collection(this.db, COLLECTION_NAME);
            const q = query(attemptRef, where('quizId', '==', quizId));
            const querySnapshot = await getDocs(q);
            const attempts = querySnapshot.docs.map(doc => this.documentToQuizAttempt(doc));

            this.log(`Successfully fetched ${attempts.length} quiz attempts for quiz:`, quizId);

            return {
                data: attempts,
                total: attempts.length,
                hasMore: false
            };
        } catch (error) {
            this.error('Failed to fetch quiz attempts by quiz ID', error);
            return {
                data: [],
                total: 0,
                hasMore: false
            };
        }
    }

    async getByUserId(userId: string): Promise<QueryResult<QuizAttempt>> {
        try {
            this.log('Fetching quiz attempts by user ID:', userId);
            
            const attemptRef = collection(this.db, COLLECTION_NAME);
            const q = query(attemptRef, where('userId', '==', userId));
            const querySnapshot = await getDocs(q);
            const attempts = querySnapshot.docs.map(doc => this.documentToQuizAttempt(doc));

            this.log(`Successfully fetched ${attempts.length} quiz attempts for user:`, userId);

            return {
                data: attempts,
                total: attempts.length,
                hasMore: false
            };
        } catch (error) {
            this.error('Failed to fetch quiz attempts by user ID', error);
            return {
                data: [],
                total: 0,
                hasMore: false
            };
        }
    }

    async getByUserAndQuiz(userId: string, quizId: string): Promise<QueryResult<QuizAttempt>> {
        try {
            this.log('Fetching quiz attempts by user and quiz ID:', { userId, quizId });
            
            const attemptRef = collection(this.db, COLLECTION_NAME);
            const q = query(
                attemptRef, 
                where('userId', '==', userId),
                where('quizId', '==', quizId)
            );
            const querySnapshot = await getDocs(q);
            const attempts = querySnapshot.docs.map(doc => this.documentToQuizAttempt(doc));

            this.log(`Successfully fetched ${attempts.length} quiz attempts for user and quiz`);

            return {
                data: attempts,
                total: attempts.length,
                hasMore: false
            };
        } catch (error) {
            this.error('Failed to fetch quiz attempts by user and quiz ID', error);
            return {
                data: [],
                total: 0,
                hasMore: false
            };
        }
    }

    async create(attempt: Omit<QuizAttempt, 'id' | 'createdAt'>): Promise<OperationResult<string>> {
        try {
            this.log('Creating new quiz attempt:', attempt);
            
            const attemptRef = collection(this.db, COLLECTION_NAME);
            const newAttempt = {
                ...attempt,
                status: 'in_progress',
                startedAt: attempt.startedAt || Timestamp.now(),
                createdAt: Timestamp.now()
            };

            const docRef = await addDoc(attemptRef, newAttempt);
            this.log('Successfully created quiz attempt with ID:', docRef.id);

            return {
                success: true,
                data: docRef.id
            };
        } catch (error) {
            this.error('Failed to create quiz attempt', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    async update(id: string, updateData: Partial<QuizAttempt>): Promise<OperationResult<void>> {
        try {
            this.log('Updating quiz attempt:', id, updateData);
            
            const attemptRef = doc(this.db, COLLECTION_NAME, id);
            await updateDoc(attemptRef, updateData);

            this.log('Successfully updated quiz attempt:', id);
            return { success: true };
        } catch (error) {
            this.error('Failed to update quiz attempt', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    async complete(id: string, finalScore: number): Promise<OperationResult<void>> {
        try {
            this.log('Completing quiz attempt:', id, finalScore);
            
            const attemptRef = doc(this.db, COLLECTION_NAME, id);
            await updateDoc(attemptRef, {
                status: 'completed',
                finalScore,
                submittedAt: Timestamp.now()
            });

            this.log('Successfully completed quiz attempt:', id);
            return { success: true };
        } catch (error) {
            this.error('Failed to complete quiz attempt', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    async delete(id: string): Promise<OperationResult<void>> {
        try {
            this.log('Deleting quiz attempt:', id);
            
            const attemptRef = doc(this.db, COLLECTION_NAME, id);
            await deleteDoc(attemptRef);

            this.log('Successfully deleted quiz attempt:', id);
            return { success: true };
        } catch (error) {
            this.error('Failed to delete quiz attempt', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
}
