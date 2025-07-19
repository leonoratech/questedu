import { Timestamp } from 'firebase-admin/firestore'

export interface BaseTimestamps {
  createdAt?: Timestamp | Date
  updatedAt?: Timestamp | Date
  createdBy?: string // User ID of the creator
  updatedBy?: string // User ID of the last updater
  isActive?: boolean // Soft delete flag
}

export interface BaseEntity extends BaseTimestamps {
  id?: string
}