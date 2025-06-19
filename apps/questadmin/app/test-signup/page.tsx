'use client'

import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/data/config/firebase-auth'
import { useState } from 'react'

export default function TestSignupFlow() {
  const { signUp, user, userProfile, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      const result = await signUp(email, password, {
        firstName,
        lastName,
        role: UserRole.STUDENT
      })

      if (result.error) {
        setMessage(`Error: ${result.error}`)
      } else {
        setMessage('Signup successful!')
      }
    } catch (error: any) {
      setMessage(`Exception: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Test Signup Flow
          </h2>
        </div>

        {!user ? (
          <form className="mt-8 space-y-6" onSubmit={handleSignup}>
            <div className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>

            {message && (
              <div className={`text-sm ${message.includes('Error') || message.includes('Exception') ? 'text-red-600' : 'text-green-600'}`}>
                {message}
              </div>
            )}
          </form>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">User Created Successfully!</h3>
            
            <div className="bg-gray-100 p-4 rounded-md">
              <h4 className="font-medium">User Info:</h4>
              <p>Email: {user.email}</p>
              <p>UID: {user.uid}</p>
            </div>

            <div className="bg-gray-100 p-4 rounded-md">
              <h4 className="font-medium">Profile Info:</h4>
              <p>Profile Completed: {userProfile?.profileCompleted?.toString()}</p>
              <p>First Name: {userProfile?.firstName}</p>
              <p>Last Name: {userProfile?.lastName}</p>
              <p>Role: {userProfile?.role}</p>
            </div>

            <a 
              href="/profile/complete"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              Go to Profile Complete Page
            </a>
          </div>
        )}

        {loading && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading...</p>
          </div>
        )}
      </div>
    </div>
  )
}
