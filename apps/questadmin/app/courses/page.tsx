'use client'

import { AuthGuard } from '@/components/AuthGuard'
import { CourseManagement } from '@/components/course-management'
import { MultilingualCourseManagement } from '@/components/course-management-multilingual'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, Globe } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState('regular')

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
            <p className="text-gray-600 mt-2">
              Create and manage your courses with support for multiple languages
            </p>
          </div>
          
          <div className="flex gap-3">
            <Link href="/courses/new">
              <Button variant="outline">
                <BookOpen className="h-4 w-4 mr-2" />
                New Course
              </Button>
            </Link>
            <Link href="/courses/new/multilingual">
              <Button>
                <Globe className="h-4 w-4 mr-2" />
                New Multilingual Course
              </Button>
            </Link>
          </div>
        </div>

        {/* Course Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-auto grid-cols-2">
              <TabsTrigger value="regular" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Regular Courses
              </TabsTrigger>
              <TabsTrigger value="multilingual" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Multilingual Courses
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="regular" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Standard Course Management
                </CardTitle>
                <CardDescription>
                  Manage traditional single-language courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CourseManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="multilingual" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  Multilingual Course Management
                </CardTitle>
                <CardDescription>
                  Create and manage courses that support multiple languages (English and Telugu)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MultilingualCourseManagement />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Regular Courses
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Perfect for courses that will be delivered in a single language. 
                Quick to set up and manage.
              </p>
              <Link href="/courses/new">
                <Button variant="outline" size="sm">
                  Create Regular Course
                </Button>
              </Link>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-600" />
                Multilingual Courses
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Ideal for reaching a broader audience. Support for English and Telugu 
                with easy translation management.
              </p>
              <Link href="/courses/new/multilingual">
                <Button size="sm">
                  Create Multilingual Course
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  )
}
