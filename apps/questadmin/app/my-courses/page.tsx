import { AdminLayout } from '@/components/AdminLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    BookOpen,
    Clock,
    Edit,
    Plus,
    Star,
    Trash2,
    Users
} from 'lucide-react'

// Mock data for my courses
const myCourses = [
  {
    id: 1,
    title: 'Advanced React Development',
    description: 'Master advanced React concepts including hooks, context, and performance optimization.',
    students: 234,
    rating: 4.8,
    totalRatings: 45,
    status: 'published',
    createdAt: '2024-03-15',
    duration: '12 hours',
    modules: 8
  },
  {
    id: 2,
    title: 'Python for Data Science',
    description: 'Complete guide to using Python for data analysis and machine learning.',
    students: 189,
    rating: 4.7,
    totalRatings: 32,
    status: 'published',
    createdAt: '2024-02-28',
    duration: '16 hours',
    modules: 10
  },
  {
    id: 3,
    title: 'UI/UX Design Fundamentals',
    description: 'Learn the principles of user interface and user experience design.',
    students: 0,
    rating: 0,
    totalRatings: 0,
    status: 'draft',
    createdAt: '2024-04-01',
    duration: '8 hours',
    modules: 6
  }
]

function CourseCard({ course }: { course: typeof myCourses[0] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{course.title}</CardTitle>
            <CardDescription className="mt-2">{course.description}</CardDescription>
          </div>
          <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
            {course.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Course Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{course.students} students</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4" />
              <span>{course.rating > 0 ? `${course.rating} (${course.totalRatings})` : 'No ratings'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>{course.modules} modules</span>
            </div>
          </div>

          {/* Course Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <span className="text-sm text-muted-foreground">
              Created on {new Date(course.createdAt).toLocaleDateString()}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function MyCoursesPage() {
  return (
    <AdminLayout title="My Courses">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
            <p className="text-muted-foreground">Manage courses you've created</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        </div>

        {/* Course Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myCourses.length}</div>
              <p className="text-xs text-muted-foreground">
                {myCourses.filter(c => c.status === 'published').length} published
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {myCourses.reduce((acc, course) => acc + course.students, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all courses
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(myCourses.filter(c => c.rating > 0).reduce((acc, course) => acc + course.rating, 0) / 
                  myCourses.filter(c => c.rating > 0).length || 0).toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                From student reviews
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Courses List */}
        <div className="space-y-4">
          {myCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
