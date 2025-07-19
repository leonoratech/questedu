import { BaseEntity } from './basemodel';
// Course Topic data models and interfaces

export interface CourseTopic extends BaseEntity  {
  courseId: string
  title: string
  description?: string
  content?: string
  order: number
  estimatedDuration?: number // in minutes
  learningObjectives?: string[]
  resources?: {
    type: 'video' | 'document' | 'link' | 'audio'
    title: string
    url: string
    duration?: number
  }[]  
}
