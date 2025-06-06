import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    increment,
    orderBy,
    query,
    QueryDocumentSnapshot,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import {
    DifficultyLevel,
    OperationResult,
    QueryResult,
    Question,
    QuestionType
} from '../domain';
import { IQuestionRepository } from '../repositories';
import { FirebaseAppManager } from './app-manager';

const COLLECTION_NAME = 'questions';

/**
 * Firebase implementation of the question repository
 */
export class FirebaseQuestionRepository implements IQuestionRepository {
    private appManager = FirebaseAppManager.getInstance();

    private get db() {
        return this.appManager.getDb();
    }

    private get enableLogging() {
        return this.appManager.getConfig().environment.enableDebugLogging;
    }

    private log(message: string, ...args: any[]) {
        if (this.enableLogging) {
            console.log(`[FirebaseQuestionRepository] ${message}`, ...args);
        }
    }

    private error(message: string, error: any) {
        console.error(`[FirebaseQuestionRepository] ${message}`, error);
    }

    /**
     * Convert Firestore document to Question model
     */
    private documentToQuestion(doc: QueryDocumentSnapshot): Question {
        const data = doc.data();
        return {
            id: doc.id,
            courseId: data.courseId,
            topicId: data.topicId,
            questionBankId: data.questionBankId,
            type: data.type,
            difficulty: data.difficulty,
            title: data.title,
            description: data.description,
            question: data.question,
            points: data.points,
            timeLimit: data.timeLimit,
            options: data.options,
            correctAnswer: data.correctAnswer,
            sampleAnswers: data.sampleAnswers,
            essayConfig: data.essayConfig,
            matchingPairs: data.matchingPairs,
            correctOrder: data.correctOrder,
            hints: data.hints,
            explanation: data.explanation,
            tags: data.tags,
            timesUsed: data.timesUsed,
            averageScore: data.averageScore,
            isActive: data.isActive !== false,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
        };
    }

    async getAll(): Promise<QueryResult<Question>> {
        try {
            this.log('Fetching all questions');
            
            const questionRef = collection(this.db, COLLECTION_NAME);
            const q = query(questionRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const questions = querySnapshot.docs.map(doc => this.documentToQuestion(doc));

            this.log(`Successfully fetched ${questions.length} questions`);

            return {
                data: questions,
                total: questions.length,
                hasMore: false
            };
        } catch (error) {
            this.error('Failed to fetch all questions', error);
            return {
                data: [],
                total: 0,
                hasMore: false
            };
        }
    }

    async getById(id: string): Promise<Question | null> {
        try {
            this.log('Fetching question by ID:', id);
            
            const questionRef = doc(this.db, COLLECTION_NAME, id);
            const docSnapshot = await getDoc(questionRef);

            if (!docSnapshot.exists()) {
                this.log('Question not found for ID:', id);
                return null;
            }

            const question = this.documentToQuestion(docSnapshot);
            this.log('Successfully fetched question:', question.id);

            return question;
        } catch (error) {
            this.error('Failed to fetch question by ID', error);
            return null;
        }
    }

    async getByCourseId(courseId: string): Promise<QueryResult<Question>> {
        try {
            this.log('Fetching questions by course ID:', courseId);
            
            const questionRef = collection(this.db, COLLECTION_NAME);
            const q = query(questionRef, where('courseId', '==', courseId));
            const querySnapshot = await getDocs(q);
            const questions = querySnapshot.docs.map(doc => this.documentToQuestion(doc));

            this.log(`Successfully fetched ${questions.length} questions for course:`, courseId);

            return {
                data: questions,
                total: questions.length,
                hasMore: false
            };
        } catch (error) {
            this.error('Failed to fetch questions by course ID', error);
            return {
                data: [],
                total: 0,
                hasMore: false
            };
        }
    }

    async getByTopicId(topicId: string): Promise<QueryResult<Question>> {
        try {
            this.log('Fetching questions by topic ID:', topicId);
            
            const questionRef = collection(this.db, COLLECTION_NAME);
            const q = query(questionRef, where('topicId', '==', topicId));
            const querySnapshot = await getDocs(q);
            const questions = querySnapshot.docs.map(doc => this.documentToQuestion(doc));

            this.log(`Successfully fetched ${questions.length} questions for topic:`, topicId);

            return {
                data: questions,
                total: questions.length,
                hasMore: false
            };
        } catch (error) {
            this.error('Failed to fetch questions by topic ID', error);
            return {
                data: [],
                total: 0,
                hasMore: false
            };
        }
    }

    async getByQuestionBankId(questionBankId: string): Promise<QueryResult<Question>> {
        try {
            this.log('Fetching questions by question bank ID:', questionBankId);
            
            const questionRef = collection(this.db, COLLECTION_NAME);
            const q = query(questionRef, where('questionBankId', '==', questionBankId));
            const querySnapshot = await getDocs(q);
            const questions = querySnapshot.docs.map(doc => this.documentToQuestion(doc));

            this.log(`Successfully fetched ${questions.length} questions for question bank:`, questionBankId);

            return {
                data: questions,
                total: questions.length,
                hasMore: false
            };
        } catch (error) {
            this.error('Failed to fetch questions by question bank ID', error);
            return {
                data: [],
                total: 0,
                hasMore: false
            };
        }
    }

    async getByType(type: QuestionType): Promise<QueryResult<Question>> {
        try {
            this.log('Fetching questions by type:', type);
            
            const questionRef = collection(this.db, COLLECTION_NAME);
            const q = query(questionRef, where('type', '==', type));
            const querySnapshot = await getDocs(q);
            const questions = querySnapshot.docs.map(doc => this.documentToQuestion(doc));

            this.log(`Successfully fetched ${questions.length} questions of type:`, type);

            return {
                data: questions,
                total: questions.length,
                hasMore: false
            };
        } catch (error) {
            this.error('Failed to fetch questions by type', error);
            return {
                data: [],
                total: 0,
                hasMore: false
            };
        }
    }

    async getByDifficulty(difficulty: DifficultyLevel): Promise<QueryResult<Question>> {
        try {
            this.log('Fetching questions by difficulty:', difficulty);
            
            const questionRef = collection(this.db, COLLECTION_NAME);
            const q = query(questionRef, where('difficulty', '==', difficulty));
            const querySnapshot = await getDocs(q);
            const questions = querySnapshot.docs.map(doc => this.documentToQuestion(doc));

            this.log(`Successfully fetched ${questions.length} questions of difficulty:`, difficulty);

            return {
                data: questions,
                total: questions.length,
                hasMore: false
            };
        } catch (error) {
            this.error('Failed to fetch questions by difficulty', error);
            return {
                data: [],
                total: 0,
                hasMore: false
            };
        }
    }

    async create(question: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>): Promise<OperationResult<string>> {
        try {
            this.log('Creating new question:', question);
            
            const questionRef = collection(this.db, COLLECTION_NAME);
            const newQuestion = {
                ...question,
                usageCount: 0,
                averageScore: 0,
                isActive: true,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            };

            const docRef = await addDoc(questionRef, newQuestion);
            this.log('Successfully created question with ID:', docRef.id);

            return {
                success: true,
                data: docRef.id
            };
        } catch (error) {
            this.error('Failed to create question', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    async update(id: string, updateData: Partial<Question>): Promise<OperationResult<void>> {
        try {
            this.log('Updating question:', id, updateData);
            
            const questionRef = doc(this.db, COLLECTION_NAME, id);
            await updateDoc(questionRef, {
                ...updateData,
                updatedAt: Timestamp.now()
            });

            this.log('Successfully updated question:', id);
            return { success: true };
        } catch (error) {
            this.error('Failed to update question', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    async delete(id: string): Promise<OperationResult<void>> {
        try {
            this.log('Deleting question:', id);
            
            const questionRef = doc(this.db, COLLECTION_NAME, id);
            await deleteDoc(questionRef);

            this.log('Successfully deleted question:', id);
            return { success: true };
        } catch (error) {
            this.error('Failed to delete question', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    async incrementUsage(id: string): Promise<OperationResult<void>> {
        try {
            this.log('Incrementing question usage:', id);
            
            const questionRef = doc(this.db, COLLECTION_NAME, id);
            await updateDoc(questionRef, {
                usageCount: increment(1),
                updatedAt: Timestamp.now()
            });

            this.log('Successfully incremented question usage:', id);
            return { success: true };
        } catch (error) {
            this.error('Failed to increment question usage', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    async updateAverageScore(id: string, score: number): Promise<OperationResult<void>> {
        try {
            this.log('Updating question average score:', id, score);
            
            // This is a simplified implementation
            // In a production system, you'd want to maintain running averages properly
            const questionRef = doc(this.db, COLLECTION_NAME, id);
            await updateDoc(questionRef, {
                averageScore: score,
                updatedAt: Timestamp.now()
            });

            this.log('Successfully updated question average score:', id);
            return { success: true };
        } catch (error) {
            this.error('Failed to update question average score', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
}
