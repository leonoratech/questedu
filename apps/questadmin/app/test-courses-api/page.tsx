'use client'

import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/data/config/firebase-auth'
import { useEffect, useState } from 'react'

export default function TestCoursesAPIPage() {
  const { user, loading } = useAuth()
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [apiLoading, setApiLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testCoursesAPI = async () => {
    if (!user) {
      setError('User not authenticated')
      return
    }

    try {
      setApiLoading(true)
      setError(null)
      
      console.log('Testing courses API with user:', {
        uid: user.uid,
        role: user.role,
        email: user.email
      })

      const response = await fetch('/api/courses', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        }
      })

      const data = await response.json()
      console.log('API Response:', data)

      if (!response.ok) {
        setError(`API Error: ${data.error}`)
        setApiResponse(data)
      } else {
        setApiResponse(data)
        console.log(`Found ${data.courses?.length || 0} courses`)
        
        // Log each course for debugging
        data.courses?.forEach((course: any, index: number) => {
          console.log(`Course ${index + 1}:`, {
            id: course.id,
            title: course.title,
            status: course.status,
            instructor: course.instructor,
            instructorId: course.instructorId,
            category: course.category
          })
        })
      }
    } catch (err) {
      console.error('API call failed:', err)
      setError(`Network Error: ${err}`)
    } finally {
      setApiLoading(false)
    }
  }

  useEffect(() => {
    if (!loading && user) {
      testCoursesAPI()
    }
  }, [user, loading])

  if (loading) {
    return <div className="p-8">Loading user...</div>
  }

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Not Authenticated</h1>
        <p>Please log in to test the courses API.</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Courses API</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Info */}
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-3">Current User</h2>
          <div className="space-y-2">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>UID:</strong> {user.uid}</p>
            <p><strong>Profile Completed:</strong> {user.profileCompleted ? 'Yes' : 'No'}</p>
            <p><strong>Is Student:</strong> {user.role === UserRole.STUDENT ? 'Yes' : 'No'}</p>
          </div>
          <button
            onClick={testCoursesAPI}
            disabled={apiLoading}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {apiLoading ? 'Testing...' : 'Test API Again'}
          </button>
        </div>

        {/* API Response */}
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-3">API Response</h2>
          {error && (
            <div className="bg-red-100 text-red-800 p-3 rounded mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}
          {apiResponse && (
            <div className="bg-white p-3 rounded border">
              <p><strong>Success:</strong> {apiResponse.success ? 'Yes' : 'No'}</p>
              <p><strong>Courses Count:</strong> {apiResponse.courses?.length || 0}</p>
              {apiResponse.error && (
                <p className="text-red-600"><strong>Error:</strong> {apiResponse.error}</p>
              )}
            </div>
          )}
        </div>

        {/* Courses List */}
        {apiResponse?.courses && (
          <div className="bg-gray-100 p-4 rounded lg:col-span-2">
            <h2 className="text-lg font-semibold mb-3">Courses Found ({apiResponse.courses.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {apiResponse.courses.map((course: any, index: number) => (
                <div key={course.id || index} className="bg-white p-3 rounded border">
                  <h3 className="font-medium text-sm">{course.title || 'No Title'}</h3>
                  <p className="text-xs text-gray-600">by {course.instructor || 'Unknown'}</p>
                  <div className="mt-2 space-y-1 text-xs">
                    <p><strong>Status:</strong> <span className={course.status === 'published' ? 'text-green-600' : 'text-yellow-600'}>{course.status || 'Unknown'}</span></p>
                    <p><strong>Category:</strong> {course.category || 'N/A'}</p>
                    <p><strong>Level:</strong> {course.level || 'N/A'}</p>
                    <p><strong>Price:</strong> {course.price ? `$${course.price}` : 'Free'}</p>
                    <p><strong>ID:</strong> {course.id || 'No ID'}</p>
                  </div>
                </div>
              ))}
            </div>
            {apiResponse.courses.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No courses found. This might indicate:
                <ul className="mt-2 list-disc list-inside text-left inline-block">
                  <li>No published courses exist</li>
                  <li>API filtering is too restrictive</li>
                  <li>Database connection issue</li>
                  <li>Authentication problem</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Expected Behavior */}
        <div className="bg-yellow-50 p-4 rounded lg:col-span-2">
          <h3 className="font-semibold mb-2">Expected Behavior by Role:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-green-700">Students should see:</h4>
              <ul className="list-disc list-inside">
                <li>All published courses from any instructor</li>
                <li>Only courses with status = 'published'</li>
                <li>Courses sorted by creation date (newest first)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-700">Instructors should see:</h4>
              <ul className="list-disc list-inside">
                <li>Only their own courses (any status)</li>
                <li>Courses where instructorId = their user ID</li>
                <li>Draft, published, and archived courses</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
