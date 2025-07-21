import { ForgotPasswordData, LoginData, SignupData, UserProfileData } from '@/lib/validations/auth'

class AuthService {
  private baseUrl = '/api/auth'

  async login(data: LoginData) {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Login failed')
    }

    return response.json()
  }

  async signup(data: SignupData) {
    const response = await fetch(`${this.baseUrl}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Signup failed')
    }

    return response.json()
  }

  async forgotPassword(data: ForgotPasswordData) {
    const response = await fetch(`${this.baseUrl}/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Password reset failed')
    }

    return response.json()
  }

  async getCurrentUser() {
    const response = await fetch(`${this.baseUrl}/me`, {
      method: 'GET',
      credentials: 'include',
    })

    if (!response.ok) {
      if (response.status === 401) {
        return null
      }
      const error = await response.json()
      throw new Error(error.message || 'Failed to get current user')
    }

    return response.json()
  }

  async getMe() {
    return this.getCurrentUser()
  }

  async updateProfile(data: UserProfileData) {
    const response = await fetch(`${this.baseUrl}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Profile update failed')
    }

    return response.json()
  }

  async logout() {
    const response = await fetch(`${this.baseUrl}/logout`, {
      method: 'POST',
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Logout failed')
    }

    return response.json()
  }
}

export const authService = new AuthService()
