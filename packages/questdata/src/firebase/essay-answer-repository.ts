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
    EssayAnswer,
    OperationResult,
    QueryResult
} from '../domain';
import { IEssayAnswerRepository } from '../repositories';
import { FirebaseAppManager } from './app-manager';

const COLLECTION_NAME = 'essay_answers';

/**
 * Firebase implementation of the essay answer repository
 */
export class FirebaseEssayAnswerRepository implements IEssayAnswerRepository {
    private appManager = FirebaseAppManager.getInstance();

    private get db() {
        return this.appManager.getDb();
    }

    private get enableLogging() {
        return this.appManager.getConfig().environment.enableDebugLogging;
    }

    private log(message: string, ...args: any[]) {
        if (this.enableLogging) {
            console.log(`[FirebaseEssayAnswerRepository] ${message}`, ...args);
        }
    }

    private error(message: string, error: any) {
        console.error(`[FirebaseEssayAnswerRepository] ${message}`, error);
    }

    /**
     * Convert Firestore document to EssayAnswer model
     */
    private documentToEssayAnswer(doc: QueryDocumentSnapshot): EssayAnswer {
        const data = doc.data();
        return {
            id: doc.id,
            questionId: data.questionId,
            userId: data.userId,
            content: data.content,
            isSubmitted: data.isSubmitted || false,
            isDraft: data.isDraft !== false,
            submittedAt: data.submittedAt,
            lastEditedAt: data.lastEditedAt,
            score: data.score,
            maxScore: data.maxScore,
            feedback: data.feedback,
            rubricScores: data.rubricScores,
            gradingStatus: data.gradingStatus || 'pending',
            gradedBy: data.gradedBy,
            gradedAt: data.gradedAt,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
        };
    }

    async getAll(): Promise<QueryResult<EssayAnswer>> {
        try {
            this.log('Fetching all essay answers');
            
            const answerRef = collection(this.db, COLLECTION_NAME);
            const querySnapshot = await getDocs(answerRef);
            const answers = querySnapshot.docs.map(doc => this.documentToEssayAnswer(doc));

            this.log(`Successfully fetched ${answers.length} essay answers`);

            return {
                data: answers,
                total: answers.length,
                hasMore: false
            };
        } catch (error) {
            this.error('Failed to fetch all essay answers', error);
            return {
                data: [],
                total: 0,
                hasMore: false
            };
        }
    }

    async getById(id: string): Promise<EssayAnswer | null> {
        try {
            this.log('Fetching essay answer by ID:', id);
            
            const answerRef = doc(this.db, COLLECTION_NAME, id);
            const docSnapshot = await getDoc(answerRef);

            if (!docSnapshot.exists()) {
                this.log('Essay answer not found for ID:', id);
                return null;
            }

            const answer = this.documentToEssayAnswer(docSnapshot);
            this.log('Successfully fetched essay answer:', answer.id);

            return answer;
        } catch (error) {
            this.error('Failed to fetch essay answer by ID', error);
            return null;
        }
    }

    async getByQuestionId(questionId: string): Promise<QueryResult<EssayAnswer>> {
        try {
            this.log('Fetching essay answers by question ID:', questionId);
            
            const answerRef = collection(this.db, COLLECTION_NAME);
            const q = query(answerRef, where('questionId', '==', questionId));
            const querySnapshot = await getDocs(q);
            const answers = querySnapshot.docs.map(doc => this.documentToEssayAnswer(doc));

            this.log(`Successfully fetched ${answers.length} essay answers for question:`, questionId);

            return {
                data: answers,
                total: answers.length,
                hasMore: false
            };
        } catch (error) {
            this.error('Failed to fetch essay answers by question ID', error);
            return {
                data: [],
                total: 0,
                hasMore: false
            };
        }
    }

    async getByQuizAttemptId(quizAttemptId: string): Promise<QueryResult<EssayAnswer>> {
        try {
            this.log('Fetching essay answers by quiz attempt ID:', quizAttemptId);
            
            const answerRef = collection(this.db, COLLECTION_NAME);
            const q = query(answerRef, where('quizAttemptId', '==', quizAttemptId));
            const querySnapshot = await getDocs(q);
            const answers = querySnapshot.docs.map(doc => this.documentToEssayAnswer(doc));

            this.log(`Successfully fetched ${answers.length} essay answers for quiz attempt:`, quizAttemptId);

            return {
                data: answers,
                total: answers.length,
                hasMore: false
            };
        } catch (error) {
            this.error('Failed to fetch essay answers by quiz attempt ID', error);
            return {
                data: [],
                total: 0,
                hasMore: false
            };
        }
    }

    async getByUserId(userId: string): Promise<QueryResult<EssayAnswer>> {
        try {
            this.log('Fetching essay answers by user ID:', userId);
            
            const answerRef = collection(this.db, COLLECTION_NAME);
            const q = query(answerRef, where('userId', '==', userId));
            const querySnapshot = await getDocs(q);
            const answers = querySnapshot.docs.map(doc => this.documentToEssayAnswer(doc));

            this.log(`Successfully fetched ${answers.length} essay answers for user:`, userId);

            return {
                data: answers,
                total: answers.length,
                hasMore: false
            };
        } catch (error) {
            this.error('Failed to fetch essay answers by user ID', error);
            return {
                data: [],
                total: 0,
                hasMore: false
            };
        }
    }

    async getPendingGrading(): Promise<QueryResult<EssayAnswer>> {
        try {
            this.log('Fetching essay answers pending grading');
            
            const answerRef = collection(this.db, COLLECTION_NAME);
            const q = query(answerRef, where('gradingStatus', '==', 'pending'));
            const querySnapshot = await getDocs(q);
            const answers = querySnapshot.docs.map(doc => this.documentToEssayAnswer(doc));

            this.log(`Successfully fetched ${answers.length} essay answers pending grading`);

            return {
                data: answers,
                total: answers.length,
                hasMore: false
            };
        } catch (error) {
            this.error('Failed to fetch essay answers pending grading', error);
            return {
                data: [],
                total: 0,
                hasMore: false
            };
        }
    }

    async create(answer: Omit<EssayAnswer, 'id'>): Promise<OperationResult<string>> {
        try {
            this.log('Creating new essay answer:', answer);
            
            const answerRef = collection(this.db, COLLECTION_NAME);
            const newAnswer = {
                ...answer,
                gradingStatus: 'pending',
                submittedAt: answer.submittedAt || Timestamp.now(),
                autoSavedAt: Timestamp.now()
            };

            const docRef = await addDoc(answerRef, newAnswer);
            this.log('Successfully created essay answer with ID:', docRef.id);

            return {
                success: true,
                data: docRef.id
            };
        } catch (error) {
            this.error('Failed to create essay answer', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    async update(id: string, updateData: Partial<EssayAnswer>): Promise<OperationResult<void>> {
        try {
            this.log('Updating essay answer:', id, updateData);
            
            const answerRef = doc(this.db, COLLECTION_NAME, id);
            await updateDoc(answerRef, {
                ...updateData,
                autoSavedAt: Timestamp.now()
            });

            this.log('Successfully updated essay answer:', id);
            return { success: true };
        } catch (error) {
            this.error('Failed to update essay answer', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    async grade(id: string, score: number, feedback: string, gradedBy: string): Promise<OperationResult<void>> {
        try {
            this.log('Grading essay answer:', id, { score, feedback, gradedBy });
            
            const answerRef = doc(this.db, COLLECTION_NAME, id);
            await updateDoc(answerRef, {
                score,
                feedback,
                gradedBy,
                gradingStatus: 'graded',
                gradedAt: Timestamp.now()
            });

            this.log('Successfully graded essay answer:', id);
            return { success: true };
        } catch (error) {
            this.error('Failed to grade essay answer', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    async autoSave(id: string, content: any): Promise<OperationResult<void>> {
        try {
            this.log('Auto-saving essay answer:', id);
            
            const answerRef = doc(this.db, COLLECTION_NAME, id);
            
            // Calculate word and character count
            const textContent = this.extractTextFromContent(content);
            const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;
            const characterCount = textContent.length;

            await updateDoc(answerRef, {
                content,
                wordCount,
                characterCount,
                autoSavedAt: Timestamp.now()
            });

            this.log('Successfully auto-saved essay answer:', id);
            return { success: true };
        } catch (error) {
            this.error('Failed to auto-save essay answer', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    async delete(id: string): Promise<OperationResult<void>> {
        try {
            this.log('Deleting essay answer:', id);
            
            const answerRef = doc(this.db, COLLECTION_NAME, id);
            await deleteDoc(answerRef);

            this.log('Successfully deleted essay answer:', id);
            return { success: true };
        } catch (error) {
            this.error('Failed to delete essay answer', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    async getByUserAndQuestion(userId: string, questionId: string): Promise<EssayAnswer | null> {
        try {
            this.log('Fetching essay answer by user and question:', { userId, questionId });
            
            const answerRef = collection(this.db, COLLECTION_NAME);
            const q = query(
                answerRef, 
                where('userId', '==', userId),
                where('questionId', '==', questionId)
            );
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                this.log('Essay answer not found for user and question:', { userId, questionId });
                return null;
            }

            const answer = this.documentToEssayAnswer(querySnapshot.docs[0]);
            this.log('Successfully fetched essay answer:', answer.id);

            return answer;
        } catch (error) {
            this.error('Failed to fetch essay answer by user and question', error);
            return null;
        }
    }

    async submit(id: string): Promise<OperationResult<void>> {
        try {
            this.log('Submitting essay answer:', id);
            
            const answerRef = doc(this.db, COLLECTION_NAME, id);
            await updateDoc(answerRef, {
                isSubmitted: true,
                isDraft: false,
                submittedAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });

            this.log('Successfully submitted essay answer:', id);
            return { success: true };
        } catch (error) {
            this.error('Failed to submit essay answer', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    /**
     * Extract plain text from rich text content for word/character counting
     */
    private extractTextFromContent(content: any): string {
        if (typeof content === 'string') {
            return content;
        }
        
        if (content && content.text) {
            return content.text;
        }
        
        if (content && content.format === 'plain_text' && content.text) {
            return content.text;
        }
        
        if (content && content.format === 'html' && content.text) {
            // Strip HTML tags for counting
            return content.text.replace(/<[^>]*>/g, '');
        }
        
        if (content && content.format === 'markdown' && content.text) {
            // Basic markdown stripping for counting
            return content.text.replace(/[#*_`~]/g, '');
        }
        
        // For Delta format (Quill.js), we'd need more complex parsing
        // This is a simplified version
        if (content && content.ops) {
            return content.ops
                .map((op: any) => typeof op.insert === 'string' ? op.insert : '')
                .join('');
        }
        
        return '';
    }
}
