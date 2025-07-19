import { Question, QuestionFlags } from "@/data/models/question"

export interface QuestionResponse extends Question {}
export interface CreateQuestionRequest extends Omit<Question, 'id' | 'createdAt' | 'updatedAt'> {}

export interface UpdateQuestionRequest extends Partial<CreateQuestionRequest> {
    id: string    
}
export interface QuestionFlagsDto extends QuestionFlags {}