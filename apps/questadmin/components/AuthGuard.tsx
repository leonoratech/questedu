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
      // Give it a moment to load
      const timer = setTimeout(() => {
        if (!userProfile) {
          router.push('/profile-setup')
        }
      }, 2000)
      return () => clearTimeout(timer)
    }

    // Check role requirements
    if (userProfile) {
      let hasRequiredRole = true

      if (requiredRole) {
        hasRequiredRole = userProfile.role === UserRole.ADMIN || userProfile.role === requiredRole
      }

      if (requiredRoles && requiredRoles.length > 0) {
        hasRequiredRole = userProfile.role === UserRole.ADMIN || requiredRoles.includes(userProfile.role)
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
    let hasRequiredRole = true

    if (requiredRole) {
      hasRequiredRole = userProfile.role === UserRole.ADMIN || userProfile.role === requiredRole
    }

    if (requiredRoles && requiredRoles.length > 0) {
      hasRequiredRole = userProfile.role === UserRole.ADMIN || requiredRoles.includes(userProfile.role)
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
