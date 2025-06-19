'use client'

import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/data/config/firebase-auth'
import { AdminCourse, getAllCourses } from '@/data/services/admin-course-service'
import { enrollInCourse, getUserEnrollments, isEnrolledInCourse } from '@/data/services/enrollment-service'
import { useEffect, useState } from 'react'

export default function TestEnrollmentPage() {
  const { user, loading } = useAuth()
  const [courses, setCourses] = useState<AdminCourse[]>([])
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [testResults, setTestResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      loadData()
    }
  }, [user, loading])

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const loadData = async () => {
    try {
      setIsLoading(true)
      addTestResult('Loading courses...')
      
      const allCourses = await getAllCourses()
      const publishedCourses = allCourses.filter(course => course.status === 'published')
      setCourses(publishedCourses)
      addTestResult(`Found ${publishedCourses.length} published courses`)

      if (user?.role === UserRole.STUDENT) {
        addTestResult('Loading user enrollments...')
        const userEnrollments = await getUserEnrollments()
        setEnrollments(userEnrollments)
        addTestResult(`Found ${userEnrollments.length} enrollments`)
      }
    } catch (error) {
      addTestResult(`Error loading data: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testEnrollment = async (courseId: string) => {
    if (!user) {
      addTestResult('No user authenticated')
      return
    }

    if (user.role !== UserRole.STUDENT) {
      addTestResult('Only students can enroll in courses')
      return
    }

    try {
      addTestResult(`Testing enrollment for course ${courseId}...`)
      
      // Check if already enrolled
      const alreadyEnrolled = await isEnrolledInCourse(courseId)
      if (alreadyEnrolled) {
        addTestResult(`Already enrolled in course ${courseId}`)
        return
      }

      // Attempt enrollment
      const result = await enrollInCourse(courseId)
      if (result.success) {
        addTestResult(`✅ Successfully enrolled in course ${courseId}`)
        await loadData() // Refresh data
      } else {
        addTestResult(`❌ Failed to enroll: ${result.error}`)
      }
    } catch (error) {
      addTestResult(`❌ Enrollment error: ${error}`)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Not Authenticated</h1>
        <p>Please log in to test the enrollment functionality.</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Enrollment System</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Info */}
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Current User:</h2>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Can Enroll:</strong> {user.role === UserRole.STUDENT ? 'Yes' : 'No'}</p>
        </div>

        {/* Course List */}
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Available Courses ({courses.length}):</h2>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {courses.map(course => (
              <div key={course.id} className="bg-white p-3 rounded border">
                <h3 className="font-medium">{course.title}</h3>
                <p className="text-sm text-gray-600">by {course.instructor}</p>
                <p className="text-sm text-green-600">{course.price > 0 ? `$${course.price}` : 'Free'}</p>
                {user.role === UserRole.STUDENT && (
                  <button
                    onClick={() => testEnrollment(course.id!)}
                    className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    Test Enroll
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Enrollments */}
        {user.role === UserRole.STUDENT && (
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">My Enrollments ({enrollments.length}):</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {enrollments.map(enrollment => (
                <div key={enrollment.id} className="bg-white p-3 rounded border">
                  <p className="font-medium">Course ID: {enrollment.courseId}</p>
                  <p className="text-sm text-gray-600">Status: {enrollment.status}</p>
                  <p className="text-sm text-gray-600">Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Results */}
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Test Results:</h2>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono bg-white p-2 rounded">
                {result}
              </div>
            ))}
          </div>
          <button
            onClick={() => setTestResults([])}
            className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
          >
            Clear Results
          </button>
        </div>
      </div>

      <div className="mt-8 bg-yellow-50 p-4 rounded">
        <h3 className="font-semibold mb-2">Test Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Ensure you're logged in as a student to test enrollment</li>
          <li>Check that published courses are loading correctly</li>
          <li>Test enrollment functionality with the "Test Enroll" buttons</li>
          <li>Verify that enrollments are recorded correctly</li>
          <li>Check the test results for any errors</li>
        </ol>
      </div>
    </div>
  )
}
