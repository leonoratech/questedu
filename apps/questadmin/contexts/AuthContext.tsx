'use client'

import {
    getUserProfile,
    logOut,
    onAuthStateChange,
    resetPassword,
    signInWithEmail,
    signUpWithEmail,
    UserProfile,
    UserRole
} from '@/lib/firebase-auth'
import { User as FirebaseUser } from 'firebase/auth'
import React, { createContext, useContext, useEffect, useState } from 'react'

interface AuthContextType {
  // Auth state
  user: FirebaseUser | null
  userProfile: UserProfile | null
  loading: boolean
  isAuthenticated: boolean
  
  // Auth methods
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, userData: { firstName: string; lastName: string; role?: UserRole }) => Promise<{ error: string | null }>
  signOut: () => Promise<{ error: string | null }>
  sendPasswordReset: (email: string) => Promise<{ error: string | null }>
  
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
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      setUser(firebaseUser)
      
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const profile = await getUserProfile(firebaseUser.uid)
        setUserProfile(profile)
      } else {
        setUserProfile(null)
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const result = await signInWithEmail(email, password)
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
      return { error: result.error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const result = await logOut()
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
    if (userProfile.role === UserRole.ADMIN) return true
    return userProfile.role === role
  }

  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!userProfile) return false
    if (userProfile.role === UserRole.ADMIN) return true
    return roles.includes(userProfile.role)
  }

  const canManageCourses = (): boolean => {
    return hasAnyRole([UserRole.ADMIN, UserRole.INSTRUCTOR])
  }

  const canManageUsers = (): boolean => {
    return hasRole(UserRole.ADMIN)
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
    hasRole,
    hasAnyRole,
    canManageCourses,
    canManageUsers
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
