'use client'

import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/data/config/firebase-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function TestBrowsePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      console.log('Current user:', {
        uid: user.uid,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted
      })
    }
  }, [user, loading])

  const testBrowseCourses = () => {
    router.push('/browse-courses')
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Not Authenticated</h1>
        <p>Please log in to test the browse courses functionality.</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Browse Courses Access</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="text-lg font-semibold mb-2">Current User Info:</h2>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Profile Completed:</strong> {user.profileCompleted ? 'Yes' : 'No'}</p>
        <p><strong>Is Student:</strong> {user.role === UserRole.STUDENT ? 'Yes' : 'No'}</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={testBrowseCourses}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Test Browse Courses Page
        </button>

        <div className="bg-yellow-50 p-4 rounded">
          <h3 className="font-semibold mb-2">Expected Behavior:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Any authenticated user should be able to access the browse courses page</li>
            <li>Only students should see enrollment buttons and be able to enroll</li>
            <li>Instructors should see "Student Enrollment Only" button</li>
            <li>All users should be able to preview courses</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
