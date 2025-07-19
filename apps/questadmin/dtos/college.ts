import { College } from "@/data/models/college";

export interface UpdateCollegeRequest extends Omit<College, 'id' | 'createdAt' | 'updatedAt'> {   
}
