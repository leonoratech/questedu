'use client'

import {
    getCurrentUserProfile,
    getJWTToken,
    logOut,
    resetPassword,
    signInWithEmail,
    signUpWithEmail,
    UserProfile,
    UserRole
} from '@/data/config/firebase-auth'
import React, { createContext, useContext, useEffect, useState } from 'react'

interface AuthContextType {
  // Auth state
  user: any | null
  userProfile: UserProfile | null
  loading: boolean
  isAuthenticated: boolean
  
  // Auth methods
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, userData: { firstName: string; lastName: string; role?: UserRole }) => Promise<{ error: string | null }>
  signOut: () => Promise<{ error: string | null }>
  sendPasswordReset: (email: string) => Promise<{ error: string | null }>
  refreshProfile: () => Promise<void>
  
  // Authorization helpers
  hasRole: (role: UserRole) => boolean
  hasAnyRole: (roles: UserRole[]) => boolean
  canManageCourses: () => boolean
  canManageUsers: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Check if user is authenticated on component mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // First check if we have a JWT token
      const token = getJWTToken()
      if (!token) {
        setUser(null)
        setUserProfile(null)
        setLoading(false)
        return
      }

      // Try to get current user profile which will determine if user is authenticated
      const { user: currentUser, error } = await getCurrentUserProfile()
      
      if (currentUser && !error) {
        // Auto-migrate existing users: if they have firstName and lastName but no profileCompleted field,
        // assume their profile is completed to avoid forcing them through the completion flow
        if (currentUser.firstName && currentUser.lastName && currentUser.profileCompleted === undefined) {
          currentUser.profileCompleted = true
        }
        
        setUser(currentUser)
        setUserProfile(currentUser)
      } else {
        // If profile fetch fails, remove invalid token
        if (typeof window !== 'undefined') {
          localStorage.removeItem('jwt_token')
        }
        setUser(null)
        setUserProfile(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      // Clear invalid token on error
      if (typeof window !== 'undefined') {
        localStorage.removeItem('jwt_token')
      }
      setUser(null)
      setUserProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      try {
        const { user: currentUser } = await getCurrentUserProfile()
        if (currentUser) {
          // Auto-migrate existing users: if they have firstName and lastName but no profileCompleted field,
          // assume their profile is completed to avoid forcing them through the completion flow
          if (currentUser.firstName && currentUser.lastName && currentUser.profileCompleted === undefined) {
            currentUser.profileCompleted = true
          }
          
          setUserProfile(currentUser)
        }
      } catch (error) {
        console.error('Failed to refresh profile:', error)
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const result = await signInWithEmail(email, password)
      if (result.user && !result.error) {
        setUser(result.user)
        setUserProfile(result.user)
      }
      return { error: result.error }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData: { firstName: string; lastName: string; role?: UserRole }) => {
    setLoading(true)
    try {
      const result = await signUpWithEmail(
        email, 
        password, 
        userData.firstName, 
        userData.lastName, 
        userData.role || UserRole.INSTRUCTOR
      )
      
      if (result.user && !result.error) {
        // Set the user data immediately from signup response
        setUser(result.user)
        setUserProfile(result.user)
        
        // Also refresh profile to ensure we have the latest data
        setTimeout(async () => {
          try {
            const { user: currentUser } = await getCurrentUserProfile()
            if (currentUser) {
              setUserProfile(currentUser)
            }
          } catch (error) {
            console.error('Failed to refresh profile after signup:', error)
          }
        }, 1000)
      }
      return { error: result.error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const result = await logOut()
      setUser(null)
      setUserProfile(null)
      return { error: result.error }
    } finally {
      setLoading(false)
    }
  }

  const sendPasswordReset = async (email: string) => {
    return await resetPassword(email)
  }

  // Authorization helpers
  const hasRole = (role: UserRole): boolean => {
    if (!userProfile) return false
    return userProfile.role === role
  }

  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!userProfile) return false
    return roles.includes(userProfile.role)
  }

  const canManageCourses = (): boolean => {
    return hasRole(UserRole.INSTRUCTOR)
  }

  const canManageUsers = (): boolean => {
    // Only instructors can manage users in the new system
    return hasRole(UserRole.INSTRUCTOR)
  }

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    sendPasswordReset,
    refreshProfile,
    hasRole,
    hasAnyRole,
    canManageCourses,
    canManageUsers,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}