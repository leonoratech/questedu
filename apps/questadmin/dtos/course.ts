import { Course } from "@/data/models/course"

export interface CourseResource extends Course {}

export interface CreateCourseRequest extends Omit<Course, 'id' | 'createdAt' | 'updatedAt'> {  
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {
  id: string
}