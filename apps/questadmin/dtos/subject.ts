import { Subject } from "@/data/models/subject";

export interface SubjectResponse extends Subject{}

export interface CreateSubjectRequest extends Omit<Subject, 'id' | 'createdAt' | 'updatedAt'> {}

export interface UpdateSubjectRequest extends Partial<CreateSubjectRequest> {
  id: string
}