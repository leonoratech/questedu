import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Server-side Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyALWHvJopjpZ9amcpV74jrBlYqEZzeWaTI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "questedu-cb2a4.firebaseapp.com", 
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "questedu-cb2a4",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "questedu-cb2a4.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "247130380208",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:247130380208:web:dfe0053ff32ae3194a6875"
}

// Initialize Firebase (server-side)
const app = initializeApp(firebaseConfig)
export const serverAuth = getAuth(app)
export const serverDb = getFirestore(app)

// User roles
export enum UserRole {
  SUPERADMIN = 'superadmin',
  INSTRUCTOR = 'instructor',
  STUDENT = 'student'
}

export interface UserProfile {
  uid: string
  email: string
  firstName: string
  lastName: string
  displayName: string | null
  role: UserRole
  isActive: boolean
  createdAt: Date
  lastLoginAt: Date
  profilePicture?: string
  department?: string
  bio?: string
  
  // Role-specific fields
  // Common fields for both instructor and student
  collegeId?: string  // Reference to college document ID
  college?: string    // Legacy field for backward compatibility
  description?: string
  
  // Instructor-specific fields
  coreTeachingSkills?: string[]
  additionalTeachingSkills?: string[]
  
  // Student-specific fields
  mainSubjects?: string[]
  class?: string
  
  // Profile completion status
  profileCompleted?: boolean
}
