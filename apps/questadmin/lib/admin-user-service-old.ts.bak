import { db } from '@/lib/firebase-auth'
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    Timestamp,
    updateDoc
} from 'firebase/firestore'

export interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'instructor' | 'student'
  department?: string
  bio?: string
  profilePicture?: string
  createdAt: Date
  lastLoginAt?: Date
  isActive: boolean
}

export interface UserStats {
  totalUsers: number
  activeUsers: number
  adminCount: number
  instructorCount: number
  studentCount: number
  newUsersThisMonth: number
}

/**
 * Get all users from Firestore
 */
export async function getUsers(): Promise<AdminUser[]> {
  try {
    const usersRef = collection(db, 'users')
    const querySnapshot = await getDocs(usersRef)
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        email: data.email || '',
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        role: data.role || 'student',
        department: data.department,
        bio: data.bio,
        profilePicture: data.profilePicture,
        createdAt: data.createdAt?.toDate() || new Date(),
        lastLoginAt: data.lastLoginAt?.toDate(),
        isActive: data.isActive !== false
      } as AdminUser
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    throw new Error('Failed to fetch users')
  }
}

/**
 * Get user statistics
 */
export async function getUserStats(): Promise<UserStats> {
  try {
    const users = await getUsers()
    
    // Calculate date one month ago
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    
    const stats: UserStats = {
      totalUsers: users.length,
      activeUsers: users.filter(user => user.isActive).length,
      adminCount: users.filter(user => user.role === 'admin').length,
      instructorCount: users.filter(user => user.role === 'instructor').length,
      studentCount: users.filter(user => user.role === 'student').length,
      newUsersThisMonth: users.filter(user => user.createdAt > oneMonthAgo).length
    }
    
    return stats
  } catch (error) {
    console.error('Error fetching user stats:', error)
    throw new Error('Failed to fetch user statistics')
  }
}

/**
 * Get recent users (for dashboard)
 */
export async function getRecentUsers(limitCount: number = 10): Promise<AdminUser[]> {
  try {
    const usersRef = collection(db, 'users')
    const q = query(
      usersRef,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )
    
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        email: data.email || '',
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        role: data.role || 'student',
        department: data.department,
        bio: data.bio,
        profilePicture: data.profilePicture,
        createdAt: data.createdAt?.toDate() || new Date(),
        lastLoginAt: data.lastLoginAt?.toDate(),
        isActive: data.isActive !== false
      } as AdminUser
    })
  } catch (error) {
    console.error('Error fetching recent users:', error)
    throw new Error('Failed to fetch recent users')
  }
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(userId: string, newRole: 'admin' | 'instructor' | 'student'): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      role: newRole,
      updatedAt: Timestamp.now()
    })
  } catch (error) {
    console.error('Error updating user role:', error)
    throw new Error('Failed to update user role')
  }
}

/**
 * Toggle user active status
 */
export async function toggleUserStatus(userId: string, isActive: boolean): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      isActive,
      updatedAt: Timestamp.now()
    })
  } catch (error) {
    console.error('Error updating user status:', error)
    throw new Error('Failed to update user status')
  }
}

/**
 * Delete user (admin only)
 */
export async function deleteUser(userId: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId)
    await deleteDoc(userRef)
  } catch (error) {
    console.error('Error deleting user:', error)
    throw new Error('Failed to delete user')
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<AdminUser | null> {
  try {
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    
    if (!userDoc.exists()) {
      return null
    }
    
    const data = userDoc.data()
    return {
      id: userDoc.id,
      email: data.email || '',
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      role: data.role || 'student',
      department: data.department,
      bio: data.bio,
      profilePicture: data.profilePicture,
      createdAt: data.createdAt?.toDate() || new Date(),
      lastLoginAt: data.lastLoginAt?.toDate(),
      isActive: data.isActive !== false
    } as AdminUser
  } catch (error) {
    console.error('Error fetching user:', error)
    throw new Error('Failed to fetch user')
  }
}