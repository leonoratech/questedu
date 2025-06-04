import { AdminLayout } from '@/components/AdminLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    BookOpen,
    Clock,
    Eye,
    Play,
    Star,
    Users
} from 'lucide-react'

// Mock data for active courses
const activeCourses = [
  {
    id: 1,
    title: 'Advanced React Development',
    instructor: 'John Doe',
    currentStudents: 234,
    totalCapacity: 300,
    rating: 4.8,
    totalRatings: 45,
    startDate: '2024-03-01',
    endDate: '2024-06-01',
    progress: 65,
    status: 'ongoing',
    nextSession: '2024-04-15T10:00:00Z'
  },
  {
    id: 2,
    title: 'Python for Data Science',
    instructor: 'Jane Smith',
    currentStudents: 189,
    totalCapacity: 250,
    rating: 4.7,
    totalRatings: 32,
    startDate: '2024-02-15',
    endDate: '2024-05-15',
    progress: 80,
    status: 'ongoing',
    nextSession: '2024-04-16T14:00:00Z'
  },
  {
    id: 3,
    title: 'UI/UX Design Fundamentals',
    instructor: 'Mike Johnson',
    currentStudents: 156,
    totalCapacity: 200,
    rating: 4.5,
    totalRatings: 28,
    startDate: '2024-03-15',
    endDate: '2024-06-15',
    progress: 45,
    status: 'ongoing',
    nextSession: '2024-04-17T16:00:00Z'
  },
  {
    id: 4,
    title: 'Node.js Backend Development',
    instructor: 'Sarah Wilson',
    currentStudents: 98,
    totalCapacity: 150,
    rating: 4.6,
    totalRatings: 21,
    startDate: '2024-04-01',
    endDate: '2024-07-01',
    progress: 25,
    status: 'ongoing',
    nextSession: '2024-04-18T11:00:00Z'
  }
]

function ActiveCourseCard({ course }: { course: typeof activeCourses[0] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{course.title}</CardTitle>
            <CardDescription className="mt-1">
              Instructor: {course.instructor}
            </CardDescription>
          </div>
          <Badge variant="default">
            {course.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Course Progress */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Course Progress</span>
              <span className="font-medium">{course.progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>

          {/* Course Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{course.currentStudents}/{course.totalCapacity}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4" />
              <span>{course.rating} ({course.totalRatings})</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Next: {new Date(course.nextSession).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>{new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Course Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Capacity: {Math.round((course.currentStudents / course.totalCapacity) * 100)}% filled
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
              <Button variant="outline" size="sm">
                <Play className="h-4 w-4 mr-2" />
                Manage
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ActiveCoursesPage() {
  return (
    <AdminLayout title="Active Courses">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Active Courses</h1>
            <p className="text-muted-foreground">Currently running courses on the platform</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCourses.length}</div>
              <p className="text-xs text-muted-foreground">
                Currently running
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Enrolled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeCourses.reduce((acc, course) => acc + course.currentStudents, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Students enrolled
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(activeCourses.reduce((acc, course) => acc + course.progress, 0) / activeCourses.length)}%
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
                {(activeCourses.reduce((acc, course) => acc + course.rating, 0) / activeCourses.length).toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                Student satisfaction
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Active Courses List */}
        <div className="space-y-4">
          {activeCourses.map((course) => (
            <ActiveCourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
