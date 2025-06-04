import { CourseManagement } from '@/components/course-management'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">QuestAdmin</h1>
          <p className="text-muted-foreground mt-2">Manage courses for QuestEdu</p>
        </div>
        <CourseManagement />
      </div>
    </main>
  )
}
