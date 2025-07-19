import { Program } from "@/data/models/program"

export interface ProgramResponse extends Program {}

export interface CreateProgramRequest extends Omit<Program, 'id' | 'createdAt' | 'updatedAt'> {}

export interface UpdateProgramRequest extends Partial<CreateProgramRequest> {
  id: string
  isActive?: boolean
}