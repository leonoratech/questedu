import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    QueryDocumentSnapshot,
    runTransaction,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import {
    OperationResult,
    QueryResult,
    QuestionBank
} from '../domain';
import { IQuestionBankRepository } from '../repositories';
import { FirebaseAppManager } from './app-manager';

const COLLECTION_NAME = 'question_banks';

/**
 * Firebase implementation of the question bank repository
 */
export class FirebaseQuestionBankRepository implements IQuestionBankRepository {
    private appManager = FirebaseAppManager.getInstance();

    private get db() {
        return this.appManager.getDb();
    }

    private get enableLogging() {
        return this.appManager.getConfig().environment.enableDebugLogging;
    }

    private log(message: string, ...args: any[]) {
        if (this.enableLogging) {
            console.log(`[FirebaseQuestionBankRepository] ${message}`, ...args);
        }
    }

    private error(message: string, error: any) {
        console.error(`[FirebaseQuestionBankRepository] ${message}`, error);
    }

    /**
     * Convert Firestore document to QuestionBank model
     */
    private documentToQuestionBank(doc: QueryDocumentSnapshot): QuestionBank {
        const data = doc.data();
        return {
            id: doc.id,
            courseId: data.courseId,
            name: data.name,
            description: data.description,
            category: data.category,
            tags: data.tags,
            isPublic: data.isPublic,
            totalQuestions: data.totalQuestions,
            questionsByType: data.questionsByType,
            questionsByDifficulty: data.questionsByDifficulty,
            createdBy: data.createdBy,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
        };
    }

    async getAll(): Promise<QueryResult<QuestionBank>> {
        try {
            this.log('Fetching all question banks');
            
            const questionBankRef = collection(this.db, COLLECTION_NAME);
            const querySnapshot = await getDocs(questionBankRef);
            const questionBanks = querySnapshot.docs.map(doc => this.documentToQuestionBank(doc));

            this.log(`Successfully fetched ${questionBanks.length} question banks`);

            return {
                data: questionBanks,
                total: questionBanks.length,
                hasMore: false
            };
        } catch (error) {
            this.error('Failed to fetch all question banks', error);
            return {
                data: [],
                total: 0,
                hasMore: false
            };
        }
    }

    async getById(id: string): Promise<QuestionBank | null> {
        try {
            this.log('Fetching question bank by ID:', id);
            
            const questionBankRef = doc(this.db, COLLECTION_NAME, id);
            const docSnapshot = await getDoc(questionBankRef);

            if (!docSnapshot.exists()) {
                this.log('Question bank not found for ID:', id);
                return null;
            }

            const questionBank = this.documentToQuestionBank(docSnapshot);
            this.log('Successfully fetched question bank:', questionBank.id);

            return questionBank;
        } catch (error) {
            this.error('Failed to fetch question bank by ID', error);
            return null;
        }
    }

    async getByCourseId(courseId: string): Promise<QueryResult<QuestionBank>> {
        try {
            this.log('Fetching question banks by course ID:', courseId);
            
            const questionBankRef = collection(this.db, COLLECTION_NAME);
            const q = query(questionBankRef, where('courseId', '==', courseId));
            const querySnapshot = await getDocs(q);
            const questionBanks = querySnapshot.docs.map(doc => this.documentToQuestionBank(doc));

            this.log(`Successfully fetched ${questionBanks.length} question banks for course:`, courseId);

            return {
                data: questionBanks,
                total: questionBanks.length,
                hasMore: false
            };
        } catch (error) {
            this.error('Failed to fetch question banks by course ID', error);
            return {
                data: [],
                total: 0,
                hasMore: false
            };
        }
    }

    async getPublic(): Promise<QueryResult<QuestionBank>> {
        try {
            this.log('Fetching public question banks');
            
            const questionBankRef = collection(this.db, COLLECTION_NAME);
            const q = query(questionBankRef, where('isPublic', '==', true));
            const querySnapshot = await getDocs(q);
            const questionBanks = querySnapshot.docs.map(doc => this.documentToQuestionBank(doc));

            this.log(`Successfully fetched ${questionBanks.length} public question banks`);

            return {
                data: questionBanks,
                total: questionBanks.length,
                hasMore: false
            };
        } catch (error) {
            this.error('Failed to fetch public question banks', error);
            return {
                data: [],
                total: 0,
                hasMore: false
            };
        }
    }

    async create(questionBank: Omit<QuestionBank, 'id' | 'createdAt' | 'updatedAt'>): Promise<OperationResult<string>> {
        try {
            this.log('Creating new question bank:', questionBank);
            
            const questionBankRef = collection(this.db, COLLECTION_NAME);
            const newQuestionBank = {
                ...questionBank,
                totalQuestions: 0,
                questionsByType: {},
                questionsByDifficulty: {},
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            };

            const docRef = await addDoc(questionBankRef, newQuestionBank);
            this.log('Successfully created question bank with ID:', docRef.id);

            return {
                success: true,
                data: docRef.id
            };
        } catch (error) {
            this.error('Failed to create question bank', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    async update(id: string, updateData: Partial<QuestionBank>): Promise<OperationResult<void>> {
        try {
            this.log('Updating question bank:', id, updateData);
            
            const questionBankRef = doc(this.db, COLLECTION_NAME, id);
            await updateDoc(questionBankRef, {
                ...updateData,
                updatedAt: Timestamp.now()
            });

            this.log('Successfully updated question bank:', id);
            return { success: true };
        } catch (error) {
            this.error('Failed to update question bank', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    async delete(id: string): Promise<OperationResult<void>> {
        try {
            this.log('Deleting question bank:', id);
            
            const questionBankRef = doc(this.db, COLLECTION_NAME, id);
            await deleteDoc(questionBankRef);

            this.log('Successfully deleted question bank:', id);
            return { success: true };
        } catch (error) {
            this.error('Failed to delete question bank', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    async updateQuestionStats(id: string): Promise<OperationResult<void>> {
        try {
            this.log('Updating question bank statistics:', id);
            
            return await runTransaction(this.db, async (transaction) => {
                const questionBankRef = doc(this.db, COLLECTION_NAME, id);
                const questionBankDoc = await transaction.get(questionBankRef);
                
                if (!questionBankDoc.exists()) {
                    throw new Error('Question bank not found');
                }

                // Query questions belonging to this question bank
                const questionsRef = collection(this.db, 'questions');
                const q = query(questionsRef, where('questionBankId', '==', id));
                const questionsSnapshot = await getDocs(q);
                
                const stats = {
                    totalQuestions: questionsSnapshot.size,
                    questionsByType: {} as { [key: string]: number },
                    questionsByDifficulty: {} as { [key: string]: number }
                };

                // Calculate statistics
                questionsSnapshot.docs.forEach(doc => {
                    const data = doc.data();
                    const type = data.type;
                    const difficulty = data.difficulty;
                    
                    stats.questionsByType[type] = (stats.questionsByType[type] || 0) + 1;
                    stats.questionsByDifficulty[difficulty] = (stats.questionsByDifficulty[difficulty] || 0) + 1;
                });

                // Update question bank with new statistics
                transaction.update(questionBankRef, {
                    ...stats,
                    updatedAt: Timestamp.now()
                });

                return { success: true };
            });
        } catch (error) {
            this.error('Failed to update question bank statistics', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
}
