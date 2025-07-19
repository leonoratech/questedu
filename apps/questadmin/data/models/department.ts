import { BaseEntity } from "./basemodel"

// Department data model interface
export interface Department extends BaseEntity{
  name: string
  description?: string  
}