// filepath: /home/solmon/github/questedu/apps/questadmin/lib/admin-user-service.ts
// HTTP-based user service using Next.js API routes

import { UserRole } from './firebase-auth'

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
  total: number
  admins: number
  instructors: number
  students: number
}

// API response interface
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  user?: AdminUser
  users?: AdminUser[]
  stats?: UserStats
  error?: string
  message?: string
}

/**
 * Get all users from API
 */
export async function getUsers(limit?: number): Promise<AdminUser[]> {
  try {
    const url = limit ? `/api/users?limit=${limit}` : '/api/users'
    const response = await fetch(url)
    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to fetch users:', data.error)
      return []
    }

    return data.users || []
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

/**
 * Get users by role
 */
export async function getUsersByRole(role: UserRole): Promise<AdminUser[]> {
  try {
    const response = await fetch(`/api/users?role=${role}`)
    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to fetch users by role:', data.error)
      return []
    }

    return data.users || []
  } catch (error) {
    console.error('Error fetching users by role:', error)
    return []
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<AdminUser | null> {
  try {
    const response = await fetch(`/api/users/${userId}`)
    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to fetch user:', data.error)
      return null
    }

    return data.user || null
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

/**
 * Update user profile
 */
export async function updateUser(userId: string, userData: Partial<AdminUser>): Promise<boolean> {
  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to update user:', data.error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating user:', error)
    return false
  }
}

/**
 * Delete user
 */
export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'DELETE',
    })

    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to delete user:', data.error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting user:', error)
    return false
  }
}

/**
 * Get user statistics
 */
export async function getUserStats(): Promise<UserStats> {
  try {
    const response = await fetch('/api/users?stats=true')
    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to fetch user stats:', data.error)
      return {
        total: 0,
        admins: 0,
        instructors: 0,
        students: 0
      }
    }

    return data.stats || {
      total: 0,
      admins: 0,
      instructors: 0,
      students: 0
    }
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return {
      total: 0,
      admins: 0,
      instructors: 0,
      students: 0
    }
  }
}

/**
 * Search users
 */
export async function searchUsers(searchTerm: string): Promise<AdminUser[]> {
  try {
    const response = await fetch(`/api/users?search=${encodeURIComponent(searchTerm)}`)
    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to search users:', data.error)
      return []
    }

    return data.users || []
  } catch (error) {
    console.error('Error searching users:', error)
    return []
  }
}

/**
 * Change user role
 */
export async function changeUserRole(userId: string, newRole: UserRole): Promise<boolean> {
  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: newRole }),
    })

    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to change user role:', data.error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error changing user role:', error)
    return false
  }
}

/**
 * Toggle user active status
 */
export async function toggleUserStatus(userId: string, isActive: boolean): Promise<boolean> {
  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isActive }),
    })

    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to toggle user status:', data.error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error toggling user status:', error)
    return false
  }
}
