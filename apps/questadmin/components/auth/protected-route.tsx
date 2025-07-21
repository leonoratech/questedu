'use client'

import { useAuth } from '@/components/auth/auth-provider'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Memoize allowedRoles to prevent unnecessary re-renders
  const memoizedAllowedRoles = useMemo(() => allowedRoles, [allowedRoles?.join(',')])

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
        return
      }

      if (memoizedAllowedRoles && !memoizedAllowedRoles.includes(user.role)) {
        router.push('/unauthorized')
        return
      }
    }
  }, [user, loading, memoizedAllowedRoles, router])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // If user is not authenticated, don't render anything (redirect is happening)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // If user doesn't have required role, don't render anything (redirect is happening)
  if (memoizedAllowedRoles && !memoizedAllowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // User is authenticated and authorized
  return <>{children}</>
}
