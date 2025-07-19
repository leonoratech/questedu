import { BaseEntity } from './basemodel';
// Course Topic data models and interfaces

export interface CourseTopic extends BaseEntity  {
  courseId: string
  title: string
  description?: string
  content?: string
  order: number
  isPublished: boolean
  estimatedDuration?: number // in minutes
  learningObjectives?: string[]
  resources?: {
    type: 'video' | 'document' | 'link' | 'audio'
    title: string
    url: string
    duration?: number
  }[]  
}

export interface CreateCourseTopicRequest {
  title: string
  description?: string
  content?: string
  order?: number
  isPublished?: boolean
  estimatedDuration?: number
  learningObjectives?: string[]
  resources?: {
    type: 'video' | 'document' | 'link' | 'audio'
    title: string
    url: string
    duration?: number
  }[]
}

export interface UpdateCourseTopicRequest {
  title?: string
  description?: string
  content?: string
  order?: number
  isPublished?: boolean
  estimatedDuration?: number
  learningObjectives?: string[]
  resources?: {
    type: 'video' | 'document' | 'link' | 'audio'
    title: string
    url: string
    duration?: number
  }[]
}

export interface CourseTopicStats {
  totalTopics: number
  publishedTopics: number
  draftTopics: number
  totalDuration: number // in minutes
  averageDuration: number
  topicsWithResources: number
}
