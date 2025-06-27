import {
    CourseTopic,
    CourseTopicStats,
    CreateCourseTopicRequest,
    UpdateCourseTopicRequest
} from '../models/course-topic'
import { BaseRepository } from './base-service'
import { adminDb } from './firebase-admin'

const COURSE_TOPICS_COLLECTION = 'courseTopics'

export class CourseTopicRepository extends BaseRepository<CourseTopic> {
  constructor() {
    super(COURSE_TOPICS_COLLECTION)
  }

  async createCourseTopic(data: CreateCourseTopicRequest, courseId: string): Promise<string> {
    const topicData = {
      ...data,
      courseId,
      order: data.order || 1,
      isPublished: data.isPublished || false,
      estimatedDuration: data.estimatedDuration || 0,
      learningObjectives: data.learningObjectives || [],
      resources: data.resources || [],
    }

    const docRef = await adminDb.collection(COURSE_TOPICS_COLLECTION).add({
      ...topicData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return docRef.id
  }

  async updateCourseTopic(id: string, data: UpdateCourseTopicRequest): Promise<void> {
    await adminDb.collection(COURSE_TOPICS_COLLECTION).doc(id).update({
      ...data,
      updatedAt: new Date(),
    })
  }

  async getTopicsByCourse(courseId: string): Promise<CourseTopic[]> {
    const snapshot = await adminDb.collection(COURSE_TOPICS_COLLECTION)
      .where('courseId', '==', courseId)
      .get()
    
    const topics: CourseTopic[] = []
    snapshot.forEach(doc => {
      topics.push({
        id: doc.id,
        ...doc.data()
      } as CourseTopic)
    })
    
    // Sort topics by order
    return topics.sort((a, b) => (a.order || 0) - (b.order || 0))
  }

  async getTopicsByIds(topicIds: string[]): Promise<CourseTopic[]> {
    if (topicIds.length === 0) return []
    
    const topics: CourseTopic[] = []
    
    // Firestore 'in' queries have a limit of 10 items
    for (let i = 0; i < topicIds.length; i += 10) {
      const batch = topicIds.slice(i, i + 10)
      const snapshot = await adminDb.collection(COURSE_TOPICS_COLLECTION)
        .where('__name__', 'in', batch.map(id => adminDb.collection(COURSE_TOPICS_COLLECTION).doc(id)))
        .get()
      
      snapshot.forEach(doc => {
        topics.push({
          id: doc.id,
          ...doc.data()
        } as CourseTopic)
      })
    }
    
    return topics
  }

  async getPublishedTopics(courseId: string): Promise<CourseTopic[]> {
    const snapshot = await adminDb.collection(COURSE_TOPICS_COLLECTION)
      .where('courseId', '==', courseId)
      .where('isPublished', '==', true)
      .get()
    
    const topics: CourseTopic[] = []
    snapshot.forEach(doc => {
      topics.push({
        id: doc.id,
        ...doc.data()
      } as CourseTopic)
    })
    
    return topics.sort((a, b) => (a.order || 0) - (b.order || 0))
  }

  async getDraftTopics(courseId: string): Promise<CourseTopic[]> {
    const snapshot = await adminDb.collection(COURSE_TOPICS_COLLECTION)
      .where('courseId', '==', courseId)
      .where('isPublished', '==', false)
      .get()
    
    const topics: CourseTopic[] = []
    snapshot.forEach(doc => {
      topics.push({
        id: doc.id,
        ...doc.data()
      } as CourseTopic)
    })
    
    return topics.sort((a, b) => (a.order || 0) - (b.order || 0))
  }

  async updateTopicOrder(topicId: string, newOrder: number): Promise<void> {
    await adminDb.collection(COURSE_TOPICS_COLLECTION).doc(topicId).update({
      order: newOrder,
      updatedAt: new Date(),
    })
  }

  async publishTopic(topicId: string): Promise<void> {
    await adminDb.collection(COURSE_TOPICS_COLLECTION).doc(topicId).update({
      isPublished: true,
      updatedAt: new Date(),
    })
  }

  async unpublishTopic(topicId: string): Promise<void> {
    await adminDb.collection(COURSE_TOPICS_COLLECTION).doc(topicId).update({
      isPublished: false,
      updatedAt: new Date(),
    })
  }

  async getTopicStats(courseId: string): Promise<CourseTopicStats> {
    const topics = await this.getTopicsByCourse(courseId)
    
    const totalTopics = topics.length
    const publishedTopics = topics.filter(t => t.isPublished).length
    const draftTopics = totalTopics - publishedTopics
    
    const totalDuration = topics.reduce((sum, topic) => sum + (topic.estimatedDuration || 0), 0)
    const averageDuration = totalTopics > 0 ? totalDuration / totalTopics : 0
    const topicsWithResources = topics.filter(t => t.resources && t.resources.length > 0).length
    
    return {
      totalTopics,
      publishedTopics,
      draftTopics,
      totalDuration,
      averageDuration,
      topicsWithResources
    }
  }

  async deleteTopic(topicId: string): Promise<void> {
    await this.delete(topicId)
  }

  async deleteTopicsByCourse(courseId: string): Promise<void> {
    const topics = await this.getTopicsByCourse(courseId)
    
    const deletePromises = topics.map(topic => this.delete(topic.id))
    await Promise.all(deletePromises)
  }

  async duplicateTopics(sourceCourseId: string, targetCourseId: string): Promise<void> {
    const sourceTopics = await this.getTopicsByCourse(sourceCourseId)
    
    const createPromises = sourceTopics.map(topic => {
      const { id, courseId, createdAt, updatedAt, ...topicData } = topic
      return this.createCourseTopic(topicData, targetCourseId)
    })
    
    await Promise.all(createPromises)
  }
}
