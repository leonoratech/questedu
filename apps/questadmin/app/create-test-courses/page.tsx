'use client'

import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/data/config/firebase-auth'
import { useState } from 'react'

export default function CreateTestCoursePage() {
  const { user, loading } = useAuth()
  const [isCreating, setIsCreating] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const createTestCourse = async () => {
    if (!user) {
      setResult('Error: User not authenticated')
      return
    }

    setIsCreating(true)
    setResult(null)

    try {
      const testCourse = {
        title: "Test Course - JavaScript Fundamentals",
        description: "A comprehensive introduction to JavaScript programming. Learn variables, functions, objects, and DOM manipulation.",
        instructor: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : "Test Instructor",
        category: "Programming",
        level: "beginner",
        price: 0,
        duration: 20,
        status: "published",
        instructorId: user.uid,
        primaryLanguage: "en",
        supportedLanguages: ["en"],
        enableTranslation: false,
        whatYouWillLearn: [
          "JavaScript basics and syntax",
          "Working with variables and data types",
          "Functions and scope",
          "DOM manipulation",
          "Event handling"
        ],
        prerequisites: [],
        targetAudience: ["Beginner programmers", "Students", "Career changers"],
        tags: ["javascript", "programming", "web development"],
        skills: ["JavaScript", "Programming", "Web Development"]
      }

      console.log('Creating test course:', testCourse)

      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        body: JSON.stringify(testCourse)
      })

      const data = await response.json()
      console.log('Create course response:', data)

      if (response.ok && data.success) {
        setResult(`✅ Successfully created test course! ID: ${data.course?.id}`)
      } else {
        setResult(`❌ Failed to create course: ${data.error}`)
      }
    } catch (error) {
      console.error('Error creating course:', error)
      setResult(`❌ Network error: ${error}`)
    } finally {
      setIsCreating(false)
    }
  }

  const createMultipleTestCourses = async () => {
    if (!user) {
      setResult('Error: User not authenticated')
      return
    }

    setIsCreating(true)
    setResult(null)

    const testCourses = [
      {
        title: "JavaScript Fundamentals",
        description: "Learn the basics of JavaScript programming",
        instructor: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : "Test Instructor",
        category: "Programming",
        level: "beginner",
        price: 0,
        duration: 20,
        status: "published",
        instructorId: user.uid
      },
      {
        title: "React for Beginners",
        description: "Build modern web applications with React",
        instructor: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : "Test Instructor",
        category: "Web Development",
        level: "intermediate",
        price: 49,
        duration: 30,
        status: "published",
        instructorId: user.uid
      },
      {
        title: "Advanced Python",
        description: "Master advanced Python concepts and frameworks",
        instructor: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : "Test Instructor",
        category: "Programming",
        level: "advanced",
        price: 99,
        duration: 40,
        status: "published",
        instructorId: user.uid
      }
    ]

    let created = 0
    let errors = []

    for (const course of testCourses) {
      try {
        const response = await fetch('/api/courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
          },
          body: JSON.stringify(course)
        })

        const data = await response.json()
        
        if (response.ok && data.success) {
          created++
          console.log(`Created course: ${course.title}`)
        } else {
          errors.push(`${course.title}: ${data.error}`)
        }
      } catch (error) {
        errors.push(`${course.title}: Network error`)
      }
    }

    if (errors.length === 0) {
      setResult(`✅ Successfully created ${created} test courses!`)
    } else {
      setResult(`⚠️ Created ${created} courses. Errors: ${errors.join(', ')}`)
    }
    
    setIsCreating(false)
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Not Authenticated</h1>
        <p>Please log in to create test courses.</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Test Courses</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Info */}
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-3">Current User</h2>
          <div className="space-y-2">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
            <p><strong>Can Create Courses:</strong> {user.role === UserRole.INSTRUCTOR ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-3">Actions</h2>
          <div className="space-y-3">
            {user.role === UserRole.INSTRUCTOR ? (
              <>
                <button
                  onClick={createTestCourse}
                  disabled={isCreating}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create Single Test Course'}
                </button>
                <button
                  onClick={createMultipleTestCourses}
                  disabled={isCreating}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create Multiple Test Courses'}
                </button>
              </>
            ) : (
              <div className="bg-yellow-100 text-yellow-800 p-3 rounded">
                <p className="font-medium">Only instructors can create courses</p>
                <p className="text-sm">Switch to an instructor account to create test courses.</p>
              </div>
            )}
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-white p-4 rounded border md:col-span-2">
            <h2 className="text-lg font-semibold mb-3">Result</h2>
            <p className="font-mono text-sm">{result}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-yellow-50 p-4 rounded md:col-span-2">
          <h3 className="font-semibold mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Log in as an instructor to create test courses</li>
            <li>Click "Create Single Test Course" to create one published course</li>
            <li>Or click "Create Multiple Test Courses" to create several courses at once</li>
            <li>After creating courses, test the browse courses page as a student</li>
            <li>Students should now see the published courses in their browse page</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
