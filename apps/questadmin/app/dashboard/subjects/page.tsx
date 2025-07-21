'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Department } from '@/data/models/department'
import { Program } from '@/data/models/program'
import { Subject } from '@/data/models/subject'
import { UserProfile } from '@/data/models/user-model'
import { useToast } from '@/hooks/use-toast'
import { authService } from '@/lib/services/auth-service'
import { departmentService } from '@/lib/services/department-service'
import { programService } from '@/lib/services/program-service'
import { subjectService } from '@/lib/services/subject-service'
import { SubjectData, SubjectSchema } from '@/lib/validations/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { BookOpen, Edit2, GraduationCap, Plus, Trash2, User as UserIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Textarea } from '../../../components/ui/textarea'

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [instructors, setInstructors] = useState<UserProfile[]>([])
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedProgram, setSelectedProgram] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<string>('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm<SubjectData>({
    resolver: zodResolver(SubjectSchema)
  })

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    loadSubjects()
  }, [selectedProgram, selectedYear])

  const loadInitialData = async () => {
    try {
      const [user, subjectsData, programsData, departmentsData] = await Promise.all([
        authService.getMe(),
        subjectService.getSubjects(),
        programService.getPrograms(),
        departmentService.getDepartments()
      ])
      
      setCurrentUser(user)
      setSubjects(subjectsData)
      setPrograms(programsData)
      setDepartments(departmentsData)

      // Load instructors only for superadmin
      if (user.role === 'superadmin') {
        // We'll need to create a user service method to get instructors
        // For now, we'll skip this or implement it later
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const loadSubjects = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (selectedProgram) params.programId = selectedProgram
      if (selectedYear) params.year = selectedYear
      
      const data = await subjectService.getSubjects(params)
      setSubjects(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load subjects',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: SubjectData) => {
    try {
      if (selectedSubject) {
        if (!selectedSubject.id) {
          throw new Error('Subject ID is required for update')
        }
        await subjectService.updateSubject(selectedSubject.id, data)
        toast({
          title: 'Success',
          description: 'Subject updated successfully'
        })
        setIsEditDialogOpen(false)
      } else {
        await subjectService.createSubject(data)
        toast({
          title: 'Success',
          description: 'Subject created successfully'
        })
        setIsCreateDialogOpen(false)
      }
      
      reset()
      loadSubjects()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred',
        variant: 'destructive'
      })
    }
  }

  const handleEdit = (subject: Subject) => {
    setSelectedSubject(subject)
    setValue('name', subject.name)
    setValue('programId', subject.programId)
    setValue('year', subject.year)
    setValue('medium', subject.medium)
    setValue('instructorId', subject.instructorId)
    setValue('description', subject.description || '')
    setIsEditDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedSubject || !selectedSubject.id) return

    try {
      await subjectService.deleteSubject(selectedSubject.id)
      toast({
        title: 'Success',
        description: 'Subject deleted successfully'
      })
      setIsDeleteDialogOpen(false)
      setSelectedSubject(null)
      loadSubjects()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete subject',
        variant: 'destructive'
      })
    }
  }

  const openCreateDialog = () => {
    reset()
    setSelectedSubject(null)
    // Pre-fill instructor for instructors
    if (currentUser?.role === 'instructor' && currentUser.id) {
      setValue('instructorId', currentUser.id)
    }
    setIsCreateDialogOpen(true)
  }

  const openDeleteDialog = (subject: Subject) => {
    setSelectedSubject(subject)
    setIsDeleteDialogOpen(true)
  }

  const getProgramName = (programId: string) => {
    const program = programs.find(p => p.id === programId)
    return program?.name || 'Unknown Program'
  }

  const getDepartmentName = (programId: string | undefined) => {
    if (!programId) return 'Unknown Department'
    const program = programs.find(p => p.id === programId)
    if (!program) return 'Unknown Department'
    const department = departments.find(d => d.id === program.departmentId)
    return department?.name || 'Unknown Department'
  }

  const canEditSubject = (subject: Subject) => {
    if (currentUser?.role === 'superadmin') return true
    if (currentUser?.role === 'instructor' && subject.instructorId === currentUser.id) return true
    return false
  }

  const canDeleteSubject = (subject: Subject) => {
    return currentUser?.role === 'superadmin'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading subjects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Subjects</h1>
          <p className="text-muted-foreground">
            Manage subjects across programs and years
          </p>
        </div>
        {(currentUser?.role === 'superadmin' || currentUser?.role === 'instructor') && (
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Subject
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="program-filter">Program:</Label>
          <Select value={selectedProgram} onValueChange={setSelectedProgram}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="All Programs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Programs</SelectItem>
              {programs.map((program) => 
                program.id ? (
                  <SelectItem key={program.id} value={program.id}>
                    {program.name} ({getDepartmentName(program.id)})
                  </SelectItem>
                ) : null
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Label htmlFor="year-filter">Year:</Label>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Years</SelectItem>
              <SelectItem value="1">Year 1</SelectItem>
              <SelectItem value="2">Year 2</SelectItem>
              <SelectItem value="3">Year 3</SelectItem>
              <SelectItem value="4">Year 4</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <Card key={subject.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{subject.name}</CardTitle>
                  <CardDescription>
                    {getProgramName(subject.programId)} - Year {subject.year}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  {canEditSubject(subject) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(subject)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                  {canDeleteSubject(subject) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteDialog(subject)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {subject.description && (
                  <p className="text-sm text-muted-foreground">
                    {subject.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {subject.medium}
                  </div>
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-1" />
                    {subject.instructorName || 'Instructor'}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {getDepartmentName(subject.programId)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {subjects.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No subjects found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {selectedProgram || selectedYear 
                ? "No subjects found for the selected filters." 
                : "Get started by creating your first subject."
              }
            </p>
            {(currentUser?.role === 'superadmin' || currentUser?.role === 'instructor') && (
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Subject
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false)
          setIsEditDialogOpen(false)
          reset()
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedSubject ? 'Edit Subject' : 'Create Subject'}
            </DialogTitle>
            <DialogDescription>
              {selectedSubject 
                ? 'Update the subject information below.'
                : 'Fill in the details to create a new subject.'
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Subject Name</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="e.g., Mathematics, English, Physics"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="programId">Program</Label>
              <Select onValueChange={(value) => setValue('programId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((program) => 
                    program.id ? (
                      <SelectItem key={program.id} value={program.id}>
                        {program.name} ({getDepartmentName(program.id)})
                      </SelectItem>
                    ) : null
                  )}
                </SelectContent>
              </Select>
              {errors.programId && (
                <p className="text-sm text-destructive">{errors.programId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Select onValueChange={(value) => setValue('year', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Year 1</SelectItem>
                  <SelectItem value="2">Year 2</SelectItem>
                  <SelectItem value="3">Year 3</SelectItem>
                  <SelectItem value="4">Year 4</SelectItem>
                </SelectContent>
              </Select>
              {errors.year && (
                <p className="text-sm text-destructive">{errors.year.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="medium">Medium of Instruction</Label>
              <Select onValueChange={(value) => setValue('medium', value as 'English' | 'Telugu')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select medium" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Telugu">Telugu</SelectItem>
                </SelectContent>
              </Select>
              {errors.medium && (
                <p className="text-sm text-destructive">{errors.medium.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructorId">Instructor</Label>
              {currentUser?.role === 'instructor' ? (
                <Input
                  value={currentUser.firstName + ' ' + currentUser.lastName}
                  disabled
                  className="bg-muted"
                />
              ) : (
                <Input
                  {...register('instructorId')}
                  placeholder="Instructor ID (for now - will be dropdown later)"
                />
              )}
              {errors.instructorId && (
                <p className="text-sm text-destructive">{errors.instructorId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Subject description..."
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false)
                  setIsEditDialogOpen(false)
                  reset()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : selectedSubject ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Subject</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedSubject?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
