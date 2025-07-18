"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Course } from "@/data/models/course"
import { createCourse, deleteCourse, getCourses, updateCourse } from "@/data/services/course-service"
import { getPrograms } from "@/data/services/program-service"
import { getSubjects } from "@/data/services/subject-service"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface CourseManagerProps {
  collegeId: string
}

type Medium = 'English' | 'Telugu'

export function CourseManager({ collegeId }: CourseManagerProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [programs, setPrograms] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Course | null>(null)
  const [form, setForm] = useState({
    title: "",
    description: "",
    instructorId: "",
    programId: "",
    subjectId: "",
    year: 1,
    medium: "English" as Medium
  })

  useEffect(() => {
    loadPrograms()
    loadCourses()
  }, [collegeId])

  useEffect(() => {
    if (form.programId) {
      loadSubjects(form.programId)
    } else {
      setSubjects([])
    }
  }, [form.programId])

  async function loadPrograms() {
    try {
      const data = await getPrograms(collegeId)
      setPrograms(data)
    } catch {
      toast.error("Failed to load programs")
    }
  }

  async function loadSubjects(programId: string) {
    try {
      const data = await getSubjects(collegeId, programId)
      setSubjects(data)
    } catch {
      toast.error("Failed to load subjects")
    }
  }

  async function loadCourses() {
    setLoading(true)
    try {
      const data = await getCourses(collegeId)
      setCourses(data)
    } catch {
      toast.error("Failed to load courses")
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditing(null)
    setForm({ title: "", description: "", instructorId: "", programId: "", subjectId: "", year: 1, medium: "English" })
    setDialogOpen(true)
  }

  function openEdit(course: Course) {
    setEditing(course)
    setForm({
      title: course.title,
      description: course.description,
      instructorId: course.instructorId,
      programId: course.programId,
      subjectId: course.subjectId,
      year: course.year,
      medium: course.medium as Medium
    })
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (editing) {
        await updateCourse(collegeId, editing.id!, { ...form, medium: form.medium as Medium })
        toast.success("Course updated")
      } else {
        await createCourse(collegeId, {
          ...form,
          medium: form.medium as Medium,
          collegeId,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: "admin"
        })
        toast.success("Course created")
      }
      setDialogOpen(false)
      loadCourses()
    } catch {
      toast.error("Failed to save course")
    }
  }

  async function handleDelete(course: Course) {
    if (!confirm(`Delete course '${course.title}'?`)) return
    try {
      await deleteCourse(collegeId, course.id!)
      toast.success("Course deleted")
      loadCourses()
    } catch {
      toast.error("Failed to delete course")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Courses</h2>
        <Button onClick={openCreate}>Add Course</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {courses.map(course => (
          <Card key={course.id}>
            <CardHeader>
              <CardTitle>{course.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 text-muted-foreground text-sm">{course.description}</div>
              <div className="mb-2 text-sm">Program: {programs.find(p => p.id === course.programId)?.name || "-"}</div>
              <div className="mb-2 text-sm">Subject: {subjects.find(s => s.id === course.subjectId)?.name || "-"}</div>
              <div className="mb-2 text-sm">Year: {course.year}</div>
              <div className="mb-2 text-sm">Medium: {course.medium}</div>
              <div className="mb-2 text-sm">Instructor ID: {course.instructorId}</div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(course)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(course)}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Course" : "Add Course"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <Label>Program</Label>
              <Select value={form.programId} onValueChange={val => setForm(f => ({ ...f, programId: val, subjectId: "" }))} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map(prog => (
                    <SelectItem key={prog.id} value={prog.id}>{prog.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subject</Label>
              <Select value={form.subjectId} onValueChange={val => setForm(f => ({ ...f, subjectId: val }))} required disabled={!form.programId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(sub => (
                    <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Year</Label>
              <Input type="number" min={1} value={form.year} onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))} required />
            </div>
            <div>
              <Label>Medium</Label>
              <Select value={form.medium} onValueChange={val => setForm(f => ({ ...f, medium: val as Medium }))} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select medium" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Telugu">Telugu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Instructor ID</Label>
              <Input value={form.instructorId} onChange={e => setForm(f => ({ ...f, instructorId: e.target.value }))} required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editing ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
