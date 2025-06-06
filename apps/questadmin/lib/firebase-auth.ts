import { initializeApp } from 'firebase/app'
import {
    createUserWithEmailAndPassword,
    User as FirebaseUser,
    getAuth,
    onAuthStateChanged,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from 'firebase/auth'
import {
    doc,
    getDoc,
    getFirestore,
    serverTimestamp,
    setDoc
} from 'firebase/firestore'

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyALWHvJopjpZ9amcpV74jrBlYqEZzeWaTI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "questedu-cb2a4.firebaseapp.com", 
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "questedu-cb2a4",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "questedu-cb2a4.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "247130380208",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:247130380208:web:dfe0053ff32ae3194a6875"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

// User roles
export enum UserRole {
  ADMIN = 'admin',
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
}

// Authentication functions
export const signUpWithEmail = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: UserRole = UserRole.INSTRUCTOR
): Promise<{ user: FirebaseUser | null; error: string | null }> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    const displayName = `${firstName} ${lastName}`
    
    // Update the user's display name
    await updateProfile(user, { displayName })

    // Send email verification
    await sendEmailVerification(user)

    // Create user profile in Firestore
    await createUserProfile(user, role, firstName, lastName)

    return { user, error: null }
  } catch (error: any) {
    console.error('Sign up error:', error)
    return { user: null, error: error.message }
  }
}

export const signInWithEmail = async (
  email: string,
  password: string
): Promise<{ user: FirebaseUser | null; error: string | null }> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update last login time
    await updateLastLogin(user.uid)

    return { user, error: null }
  } catch (error: any) {
    console.error('Sign in error:', error)
    return { user: null, error: error.message }
  }
}

export const logOut = async (): Promise<{ error: string | null }> => {
  try {
    await signOut(auth)
    return { error: null }
  } catch (error: any) {
    console.error('Sign out error:', error)
    return { error: error.message }
  }
}

export const resetPassword = async (email: string): Promise<{ error: string | null }> => {
  try {
    await sendPasswordResetEmail(auth, email)
    return { error: null }
  } catch (error: any) {
    console.error('Password reset error:', error)
    return { error: error.message }
  }
}

// User profile management
export const createUserProfile = async (
  user: FirebaseUser,
  role: UserRole,
  firstName: string,
  lastName: string
): Promise<void> => {
  const displayName = `${firstName} ${lastName}`
  const userProfile: UserProfile = {
    uid: user.uid,
    email: user.email!,
    firstName,
    lastName,
    displayName,
    role,
    isActive: true,
    createdAt: new Date(),
    lastLoginAt: new Date()
  }

  await setDoc(doc(db, 'users', user.uid), {
    ...userProfile,
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp()
  })
}

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (userDoc.exists()) {
      const data = userDoc.data()
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        lastLoginAt: data.lastLoginAt?.toDate() || new Date()
      } as UserProfile
    }
    return null
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

export const updateUserProfile = async (
  uid: string,
  updates: Partial<UserProfile>
): Promise<{ error: string | null }> => {
  try {
    await setDoc(doc(db, 'users', uid), updates, { merge: true })
    return { error: null }
  } catch (error: any) {
    console.error('Error updating user profile:', error)
    return { error: error.message }
  }
}

const updateLastLogin = async (uid: string): Promise<void> => {
  try {
    await setDoc(
      doc(db, 'users', uid),
      { lastLoginAt: serverTimestamp() },
      { merge: true }
    )
  } catch (error) {
    console.error('Error updating last login:', error)
  }
}

// Authorization helpers
export const hasRole = (userProfile: UserProfile | null, requiredRole: UserRole): boolean => {
  if (!userProfile) return false
  
  // Admin can access everything
  if (userProfile.role === UserRole.ADMIN) return true
  
  return userProfile.role === requiredRole
}

export const hasAnyRole = (userProfile: UserProfile | null, roles: UserRole[]): boolean => {
  if (!userProfile) return false
  
  // Admin can access everything
  if (userProfile.role === UserRole.ADMIN) return true
  
  return roles.includes(userProfile.role)
}

export const canManageCourses = (userProfile: UserProfile | null): boolean => {
  return hasAnyRole(userProfile, [UserRole.ADMIN, UserRole.INSTRUCTOR])
}

export const canManageUsers = (userProfile: UserProfile | null): boolean => {
  return hasRole(userProfile, UserRole.ADMIN)
}

// Auth state observer
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback)
}
