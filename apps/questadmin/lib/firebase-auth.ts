// HTTP-based authentication service using Next.js API routes

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
  updatedAt?: Date
  bio?: string
  department?: string
  profilePicture?: string
  lastLoginAt?: Date
}

// API response interfaces
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  user?: any
  token?: string
  error?: string
  message?: string
}

// HTTP-based authentication functions
export const signUpWithEmail = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: UserRole = UserRole.STUDENT
): Promise<{ user: any | null; error: string | null }> => {
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
        role
      }),
    })

    const data: ApiResponse = await response.json()

    if (!response.ok) {
      return { user: null, error: data.error || 'Sign up failed' }
    }

    return { user: data.user, error: null }
  } catch (error: any) {
    console.error('Sign up error:', error)
    return { user: null, error: 'An error occurred during sign up' }
  }
}

export const signInWithEmail = async (
  email: string,
  password: string
): Promise<{ user: any | null; error: string | null }> => {
  try {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password
      }),
    })

    const data: ApiResponse = await response.json()

    if (!response.ok) {
      return { user: null, error: data.error || 'Sign in failed' }
    }

    // Store JWT token in localStorage for subsequent API calls
    if (data.token) {
      localStorage.setItem('jwt_token', data.token)
    }

    return { user: data.user, error: null }
  } catch (error: any) {
    console.error('Sign in error:', error)
    return { user: null, error: 'An error occurred during sign in' }
  }
}

export const logOut = async (): Promise<{ error: string | null }> => {
  try {
    const response = await fetch('/api/auth/signout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data: ApiResponse = await response.json()

    if (!response.ok) {
      return { error: data.error || 'Sign out failed' }
    }

    // Remove JWT token from localStorage
    localStorage.removeItem('jwt_token')

    return { error: null }
  } catch (error: any) {
    console.error('Sign out error:', error)
    
    // Remove JWT token even if API call fails
    localStorage.removeItem('jwt_token')
    
    return { error: 'An error occurred during sign out' }
  }
}

export const resetPassword = async (email: string): Promise<{ error: string | null }> => {
  try {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    const data: ApiResponse = await response.json()

    if (!response.ok) {
      return { error: data.error || 'Password reset failed' }
    }

    return { error: null }
  } catch (error: any) {
    console.error('Password reset error:', error)
    return { error: 'An error occurred sending password reset email' }
  }
}

// User profile management
export const updateUserProfile = async (
  profileData: {
    email?: string
    password?: string
    displayName?: string
    firstName?: string
    lastName?: string
    bio?: string
    department?: string
    role?: UserRole
  }
): Promise<{ user: any | null; error: string | null }> => {
  try {
    const response = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    })

    const data: ApiResponse = await response.json()

    if (!response.ok) {
      return { user: null, error: data.error || 'Profile update failed' }
    }

    return { user: data.user, error: null }
  } catch (error: any) {
    console.error('Profile update error:', error)
    return { user: null, error: 'An error occurred updating profile' }
  }
}

// JWT token helpers
export const getJWTToken = (): string | null => {
  if (typeof window === 'undefined') {
    // Server-side, return null
    return null
  }
  return localStorage.getItem('jwt_token')
}

export const getAuthHeaders = (): Record<string, string> => {
  const token = getJWTToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
}

export const getCurrentUserProfile = async (): Promise<{ user: any | null; error: string | null }> => {
  try {
    const response = await fetch('/api/auth/profile', {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data: ApiResponse = await response.json()

    if (!response.ok) {
      return { user: null, error: data.error || 'Failed to get profile' }
    }

    return { user: data.user, error: null }
  } catch (error: any) {
    console.error('Get profile error:', error)
    return { user: null, error: 'An error occurred fetching profile' }
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

// Backward compatibility exports (these will need to be updated to work with HTTP-based auth)
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  console.warn('getUserProfile is deprecated, use getCurrentUserProfile instead')
  const { user } = await getCurrentUserProfile()
  return user
}

// Legacy auth state change - this will need to be implemented differently
// with HTTP-based authentication (possibly using polling or WebSocket)
export const onAuthStateChange = (callback: (user: any | null) => void) => {
  console.warn('onAuthStateChange needs to be reimplemented for HTTP-based auth')
  // This is a placeholder - you'll need to implement session management
  return () => {}
}
