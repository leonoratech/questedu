'use client'

import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/data/config/firebase-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: UserRole
  requiredRoles?: UserRole[]
  fallbackPath?: string
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requiredRole,
  requiredRoles,
  fallbackPath = '/login'
}) => {
  const { user, userProfile, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      router.push(fallbackPath)
      return
    }

    // User exists but no profile - might be loading or error
    if (user && !userProfile) {
      // For new users, we might have basic user data but not full profile yet
      // Give it a moment to load, but don't wait too long
      const timer = setTimeout(() => {
        if (!userProfile) {
          // If we're not already on profile/complete, redirect there
          if (!window.location.pathname.includes('/profile/complete')) {
            router.push('/profile/complete')
          }
        }
      }, 1500) // Reduced timeout to 1.5 seconds
      return () => clearTimeout(timer)
    }

    // Check if profile completion is required (skip for profile completion page)
    // Only redirect to profile completion if user explicitly has profileCompleted: false
    if (userProfile && 
        userProfile.profileCompleted === false &&
        !window.location.pathname.includes('/profile/complete') &&
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/signup')) {
      router.push('/profile/complete')
      return
    }

    // Check role requirements
    if (userProfile) {
      let hasRequiredRole = true

      if (requiredRole) {
        hasRequiredRole = userProfile.role === requiredRole
      }

      if (requiredRoles && requiredRoles.length > 0) {
        hasRequiredRole = requiredRoles.includes(userProfile.role)
      }

      if (!hasRequiredRole) {
        router.push('/unauthorized')
        return
      }
    }
  }, [user, userProfile, loading, isAuthenticated, router, requiredRole, requiredRoles, fallbackPath])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Show nothing while redirecting
  if (!isAuthenticated || (user && !userProfile)) {
    return null
  }

  // Check role requirements before rendering
  if (userProfile) {
    // Check profile completion first (before role requirements)
    if (userProfile.profileCompleted === false &&
        !window.location.pathname.includes('/profile/complete') &&
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/signup')) {
      return null // Don't render while redirecting
    }

    let hasRequiredRole = true

    if (requiredRole) {
      hasRequiredRole = userProfile.role === requiredRole
    }

    if (requiredRoles && requiredRoles.length > 0) {
      hasRequiredRole = requiredRoles.includes(userProfile.role)
    }

    if (!hasRequiredRole) {
      return null
    }
  }

  return <>{children}</>
}

// HOC for page-level authentication
export const withAuth = (
  Component: React.ComponentType,
  requiredRole?: UserRole,
  requiredRoles?: UserRole[]
) => {
  return function AuthenticatedComponent(props: any) {
    return (
      <AuthGuard requiredRole={requiredRole} requiredRoles={requiredRoles}>
        <Component {...props} />
      </AuthGuard>
    )
  }
}
