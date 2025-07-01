import { removeUndefinedFields } from '../../lib/utils'
import {
  CreateQuestionRequest,
  Question,
  QuestionStats,
  UpdateQuestionRequest
} from '../models/question'
import { BaseRepository } from './base-service'
import { adminDb } from './firebase-admin'

const QUESTIONS_COLLECTION = 'courseQuestions'

export class QuestionRepository extends BaseRepository<Question> {
  constructor() {
    super(QUESTIONS_COLLECTION)
  }

  async createQuestion(data: CreateQuestionRequest, createdBy: string): Promise<string> {
    const questionData = {
      ...data,
      difficulty: data.difficulty || 'medium' as const,
      marks: data.marks || 1,
      tags: data.tags || [],
      flags: {
        important: data.flags?.important || false,
        frequently_asked: data.flags?.frequently_asked || false,
        practical: data.flags?.practical || false,
        conceptual: data.flags?.conceptual || false,
      },
      isPublished: data.isPublished || false,
      order: data.order || 0,
      createdBy,
    }

    // Remove undefined fields before saving to Firestore
    const sanitizedData = removeUndefinedFields(questionData)

    // Validate question data based on type
    if (questionData.questionType === 'multiple_choice' && (!questionData.options || questionData.options.length < 2)) {
      throw new Error('Multiple choice questions must have at least 2 options')
    }

    if ((questionData.questionType === 'short_essay' || questionData.questionType === 'long_essay')) {
      if (!questionData.questionText && !questionData.questionRichText) {
        throw new Error('Essay questions must have question text or rich text content')
      }
    }

    try {
      const docRef = await adminDb.collection(QUESTIONS_COLLECTION).add({
        ...sanitizedData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      return docRef.id
    } catch (error) {
      console.error('Error creating question:', error)
      throw new Error('Failed to create question')
    }
  }

  async updateQuestion(id: string, data: UpdateQuestionRequest): Promise<void> {
    await adminDb.collection(QUESTIONS_COLLECTION).doc(id).update({
      ...data,
      updatedAt: new Date(),
    })
  }

  async getQuestionsByCourse(courseId: string): Promise<Question[]> {
    const snapshot = await adminDb.collection(QUESTIONS_COLLECTION)
      .where('courseId', '==', courseId)
      .get()

    const questions: Question[] = []
    snapshot.forEach(doc => {
      questions.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt instanceof Date ? doc.data().createdAt : new Date(doc.data().createdAt),
        updatedAt: doc.data().updatedAt instanceof Date ? doc.data().updatedAt : new Date(doc.data().updatedAt),
      } as Question)
    })

    // Sort questions by order and then by creation date
    return questions.sort((a, b) => {
      if (a.order !== b.order) {
        return (a.order || 0) - (b.order || 0)
      }
      const aCreatedAt = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt)
      const bCreatedAt = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt)
      return aCreatedAt.getTime() - bCreatedAt.getTime()
    })
  }

  async getQuestionsByTopic(topicId: string): Promise<Question[]> {
    const snapshot = await adminDb.collection(QUESTIONS_COLLECTION)
      .where('topicId', '==', topicId)
      .get()

    const questions: Question[] = []
    snapshot.forEach(doc => {
      questions.push({
        id: doc.id,
        ...doc.data()
      } as Question)
    })

    return questions.sort((a, b) => {
      if (a.order !== b.order) {
        return (a.order || 0) - (b.order || 0)
      }
      return a.createdAt.getTime() - b.createdAt.getTime()
    })
  }

  async getQuestionsByTopicAndCourse(courseId: string, topicId: string): Promise<Question[]> {
    const snapshot = await adminDb.collection(QUESTIONS_COLLECTION)
      .where('courseId', '==', courseId)
      .where('topicId', '==', topicId)
      .get()

    const questions: Question[] = []
    snapshot.forEach(doc => {
      questions.push({
        id: doc.id,
        ...doc.data()
      } as Question)
    })

    return questions.sort((a, b) => {
      if (a.order !== b.order) {
        return (a.order || 0) - (b.order || 0)
      }
      return a.createdAt.getTime() - b.createdAt.getTime()
    })
  }

  async getPublishedQuestions(courseId: string): Promise<Question[]> {
    const snapshot = await adminDb.collection(QUESTIONS_COLLECTION)
      .where('courseId', '==', courseId)
      .where('isPublished', '==', true)
      .get()

    const questions: Question[] = []
    snapshot.forEach(doc => {
      questions.push({
        id: doc.id,
        ...doc.data()
      } as Question)
    })

    return questions.sort((a, b) => (a.order || 0) - (b.order || 0))
  }

  async getDraftQuestions(courseId: string): Promise<Question[]> {
    const snapshot = await adminDb.collection(QUESTIONS_COLLECTION)
      .where('courseId', '==', courseId)
      .where('isPublished', '==', false)
      .get()

    const questions: Question[] = []
    snapshot.forEach(doc => {
      questions.push({
        id: doc.id,
        ...doc.data()
      } as Question)
    })

    return questions.sort((a, b) => (a.order || 0) - (b.order || 0))
  }

  async getQuestionsByDifficulty(courseId: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<Question[]> {
    const snapshot = await adminDb.collection(QUESTIONS_COLLECTION)
      .where('courseId', '==', courseId)
      .where('difficulty', '==', difficulty)
      .get()

    const questions: Question[] = []
    snapshot.forEach(doc => {
      questions.push({
        id: doc.id,
        ...doc.data()
      } as Question)
    })

    return questions.sort((a, b) => (a.order || 0) - (b.order || 0))
  }

  async getQuestionsByType(courseId: string, questionType: Question['questionType']): Promise<Question[]> {
    const snapshot = await adminDb.collection(QUESTIONS_COLLECTION)
      .where('courseId', '==', courseId)
      .where('questionType', '==', questionType)
      .get()

    const questions: Question[] = []
    snapshot.forEach(doc => {
      questions.push({
        id: doc.id,
        ...doc.data()
      } as Question)
    })

    return questions.sort((a, b) => (a.order || 0) - (b.order || 0))
  }

  async getFlaggedQuestions(courseId: string, flag: keyof Question['flags']): Promise<Question[]> {
    const snapshot = await adminDb.collection(QUESTIONS_COLLECTION)
      .where('courseId', '==', courseId)
      .where(`flags.${flag}`, '==', true)
      .get()

    const questions: Question[] = []
    snapshot.forEach(doc => {
      questions.push({
        id: doc.id,
        ...doc.data()
      } as Question)
    })

    return questions.sort((a, b) => (a.order || 0) - (b.order || 0))
  }

  async updateQuestionOrder(questionId: string, newOrder: number): Promise<void> {
    await adminDb.collection(QUESTIONS_COLLECTION).doc(questionId).update({
      order: newOrder,
      updatedAt: new Date(),
    })
  }

  async publishQuestion(questionId: string): Promise<void> {
    await adminDb.collection(QUESTIONS_COLLECTION).doc(questionId).update({
      isPublished: true,
      updatedAt: new Date(),
    })
  }

  async unpublishQuestion(questionId: string): Promise<void> {
    await adminDb.collection(QUESTIONS_COLLECTION).doc(questionId).update({
      isPublished: false,
      updatedAt: new Date(),
    })
  }

  async getQuestionStats(courseId: string): Promise<QuestionStats> {
    const questions = await this.getQuestionsByCourse(courseId)

    const totalQuestions = questions.length
    const publishedQuestions = questions.filter(q => q.isPublished).length
    const draftQuestions = totalQuestions - publishedQuestions

    const questionsByDifficulty = {
      easy: questions.filter(q => q.difficulty === 'easy').length,
      medium: questions.filter(q => q.difficulty === 'medium').length,
      hard: questions.filter(q => q.difficulty === 'hard').length,
    }

    const questionsByType = {
      multiple_choice: questions.filter(q => q.questionType === 'multiple_choice').length,
      true_false: questions.filter(q => q.questionType === 'true_false').length,
      short_essay: questions.filter(q => q.questionType === 'short_essay').length,
      long_essay: questions.filter(q => q.questionType === 'long_essay').length,
      fill_blank: questions.filter(q => q.questionType === 'fill_blank').length,
    }

    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0)
    const averageMarks = totalQuestions > 0 ? totalMarks / totalQuestions : 0

    const flaggedQuestions = {
      important: questions.filter(q => q.flags.important).length,
      frequently_asked: questions.filter(q => q.flags.frequently_asked).length,
      practical: questions.filter(q => q.flags.practical).length,
      conceptual: questions.filter(q => q.flags.conceptual).length,
    }

    return {
      totalQuestions,
      publishedQuestions,
      draftQuestions,
      questionsByDifficulty,
      questionsByType,
      totalMarks,
      averageMarks,
      flaggedQuestions
    }
  }

  async deleteQuestion(questionId: string): Promise<void> {
    await this.delete(questionId)
  }

  async deleteQuestionsByCourse(courseId: string): Promise<void> {
    const questions = await this.getQuestionsByCourse(courseId)

    const deletePromises = questions.map(question => this.delete(question.id))
    await Promise.all(deletePromises)
  }

  async deleteQuestionsByTopic(topicId: string): Promise<void> {
    const questions = await this.getQuestionsByTopic(topicId)

    const deletePromises = questions.map(question => this.delete(question.id))
    await Promise.all(deletePromises)
  }

  async duplicateQuestions(sourceCourseId: string, targetCourseId: string, createdBy: string): Promise<void> {
    const sourceQuestions = await this.getQuestionsByCourse(sourceCourseId)

    const createPromises = sourceQuestions.map(question => {
      const { id, courseId, createdAt, updatedAt, ...questionData } = question
      return this.createQuestion({ ...questionData, courseId: targetCourseId }, createdBy)
    })

    await Promise.all(createPromises)
  }
}
