import { Timestamp } from 'firebase/firestore'

export interface Course {
  id?: string
  title: string
  instructor: string
  progress: number
  image: string
  category?: string
  description?: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
}
