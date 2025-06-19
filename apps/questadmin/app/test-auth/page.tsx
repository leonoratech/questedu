'use client'

import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/data/config/firebase-auth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function TestAuthPage() {
  const { user, loading, signUp, signIn, signOut } = useAuth()
  const router = useRouter()
  const [testCredentials, setTestCredentials] = useState({
    email: 'teststudent@example.com',
    password: 'test123',
    firstName: 'Test',
    lastName: 'Student'
  })

  const createTestStudent = async () => {
    try {
      console.log('Creating test student...')
      const result = await signUp(
        testCredentials.email,
        testCredentials.password,
        {
          firstName: testCredentials.firstName,
          lastName: testCredentials.lastName,
          role: UserRole.STUDENT
        }
      )
      
      if (result.error) {
        console.error('Signup error:', result.error)
        alert('Signup error: ' + result.error)
      } else {
        console.log('Test student created successfully')
        alert('Test student created successfully!')
      }
    } catch (error) {
      console.error('Signup error:', error)
      alert('Signup error: ' + error)
    }
  }

  const signInTestStudent = async () => {
    try {
      console.log('Signing in test student...')
      const result = await signIn(testCredentials.email, testCredentials.password)
      
      if (result.error) {
        console.error('Signin error:', result.error)
        alert('Signin error: ' + result.error)
      } else {
        console.log('Test student signed in successfully')
        alert('Test student signed in successfully!')
      }
    } catch (error) {
      console.error('Signin error:', error)
      alert('Signin error: ' + error)
    }
  }

  const testAPICall = async () => {
    try {
      console.log('Testing API call...')
      const response = await fetch('/api/enrollments', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        }
      })
      
      const data = await response.json()
      console.log('API response:', data)
      
      if (!response.ok) {
        alert(`API error: ${data.error}`)
      } else {
        alert(`API success: Found ${data.enrollments?.length || 0} enrollments`)
      }
    } catch (error) {
      console.error('API error:', error)
      alert('API error: ' + error)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication & Role Testing</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current User Status */}
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-3">Current User Status</h2>
          {loading ? (
            <p>Loading...</p>
          ) : user ? (
            <div className="space-y-2">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>Profile Completed:</strong> {user.profileCompleted ? 'Yes' : 'No'}</p>
              <p><strong>UID:</strong> {user.uid}</p>
              <p><strong>Is Student:</strong> {user.role === UserRole.STUDENT ? 'Yes' : 'No'}</p>
              <button
                onClick={signOut}
                className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <p>Not authenticated</p>
          )}
        </div>

        {/* Test Actions */}
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-3">Test Actions</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Test Email:</label>
              <input
                type="email"
                value={testCredentials.email}
                onChange={(e) => setTestCredentials(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Test Password:</label>
              <input
                type="password"
                value={testCredentials.password}
                onChange={(e) => setTestCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <button
              onClick={createTestStudent}
              className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Create Test Student
            </button>
            <button
              onClick={signInTestStudent}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Sign In Test Student
            </button>
            <button
              onClick={testAPICall}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Test API Call
            </button>
          </div>
        </div>

        {/* Navigation Tests */}
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-3">Navigation Tests</h2>
          <div className="space-y-2">
            <button
              onClick={() => router.push('/browse-courses')}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Test Browse Courses
            </button>
            <button
              onClick={() => router.push('/test-enrollment')}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Test Enrollment Page
            </button>
            <button
              onClick={() => router.push('/signup')}
              className="w-full bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
            >
              Test Signup Page
            </button>
          </div>
        </div>

        {/* Token Info */}
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-3">Token Info</h2>
          <div className="space-y-2">
            <p><strong>Token exists:</strong> {localStorage.getItem('authToken') ? 'Yes' : 'No'}</p>
            <p><strong>Token length:</strong> {localStorage.getItem('authToken')?.length || 0}</p>
            <button
              onClick={() => {
                const token = localStorage.getItem('authToken')
                if (token) {
                  console.log('Current token:', token)
                  alert('Token logged to console')
                } else {
                  alert('No token found')
                }
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Log Token to Console
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-yellow-50 p-4 rounded">
        <h3 className="font-semibold mb-2">Testing Steps:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Create a test student account using the form above</li>
          <li>Sign in with the test student credentials</li>
          <li>Verify the user role is "student"</li>
          <li>Test the API call to check authentication</li>
          <li>Navigate to browse courses to test the page</li>
          <li>Try the enrollment functionality</li>
        </ol>
      </div>
    </div>
  )
}
