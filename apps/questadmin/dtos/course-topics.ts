import { CourseTopic } from "@/data/models/course-topic";

export interface CourseTopicResponse extends CourseTopic {}
export interface CreateCourseTopicRequest extends Omit<CourseTopic, 'id' | 'createdAt' | 'updatedAt'> {}

export interface UpdateCourseTopicRequest extends Partial<CreateCourseTopicRequest> {
  id: string
}