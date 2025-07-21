'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Department } from '@/data/models/department'
import { Program } from '@/data/models/program'
import { useToast } from '@/hooks/use-toast'
import { departmentService } from '@/lib/services/department-service'
import { programService } from '@/lib/services/program-service'
import { ProgramData, ProgramSchema } from '@/lib/validations/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { BookOpen, Edit2, Plus, Trash2, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Textarea } from '../../../components/ui/textarea'

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDepartment, setSelectedDepartment] = useState<string>('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm<ProgramData>({
    resolver: zodResolver(ProgramSchema)
  })

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (selectedDepartment) {
      loadPrograms(selectedDepartment)
    } else {
      loadPrograms()
    }
  }, [selectedDepartment])

  const loadInitialData = async () => {
    try {
      const [programsData, departmentsData] = await Promise.all([
        programService.getPrograms(),
        departmentService.getDepartments()
      ])
      setPrograms(programsData)
      setDepartments(departmentsData)
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

  const loadPrograms = async (departmentId?: string) => {
    try {
      setLoading(true)
      const data = await programService.getPrograms(departmentId)
      setPrograms(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load programs',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: ProgramData) => {
    try {
      if (selectedProgram) {
        if (!selectedProgram.id) {
          throw new Error('Program ID is required for update')
        }
        await programService.updateProgram(selectedProgram.id, data)
        toast({
          title: 'Success',
          description: 'Program updated successfully'
        })
        setIsEditDialogOpen(false)
      } else {
        await programService.createProgram(data)
        toast({
          title: 'Success',
          description: 'Program created successfully'
        })
        setIsCreateDialogOpen(false)
      }
      
      reset()
      loadPrograms(selectedDepartment)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred',
        variant: 'destructive'
      })
    }
  }

  const handleEdit = (program: Program) => {
    setSelectedProgram(program)
    setValue('name', program.name)
    setValue('departmentId', program.departmentId)
    setValue('years', program.years)
    setValue('description', program.description)
    setValue('medium', program.medium)
    setIsEditDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedProgram || !selectedProgram.id) return

    try {
      await programService.deleteProgram(selectedProgram.id)
      toast({
        title: 'Success',
        description: 'Program deleted successfully'
      })
      setIsDeleteDialogOpen(false)
      setSelectedProgram(null)
      loadPrograms(selectedDepartment)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete program',
        variant: 'destructive'
      })
    }
  }

  const openCreateDialog = () => {
    reset()
    setSelectedProgram(null)
    setIsCreateDialogOpen(true)
  }

  const openDeleteDialog = (program: Program) => {
    setSelectedProgram(program)
    setIsDeleteDialogOpen(true)
  }

  const getDepartmentName = (departmentId: string) => {
    const department = departments.find(d => d.id === departmentId)
    return department?.name || 'Unknown Department'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading programs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Programs</h1>
          <p className="text-muted-foreground">
            Manage academic programs across departments
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Program
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <Label htmlFor="department-filter">Filter by Department:</Label>
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Departments</SelectItem>
            {departments.map((department) => 
              department.id ? (
                <SelectItem key={department.id} value={department.id}>
                  {department.name}
                </SelectItem>
              ) : null
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {programs.map((program) => (
          <Card key={program.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{program.name}</CardTitle>
                  <CardDescription>
                    {getDepartmentName(program.departmentId)}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(program)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeleteDialog(program)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {program.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Duration: {program.years} year{program.years !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {program.medium}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {programs.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No programs found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {selectedDepartment 
                ? "No programs found for the selected department." 
                : "Get started by creating your first program."
              }
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Program
            </Button>
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
              {selectedProgram ? 'Edit Program' : 'Create Program'}
            </DialogTitle>
            <DialogDescription>
              {selectedProgram 
                ? 'Update the program information below.'
                : 'Fill in the details to create a new program.'
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Program Name</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="e.g., MPC, HEC, CEC"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="departmentId">Department</Label>
              <Select onValueChange={(value) => setValue('departmentId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => 
                    department.id ? (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ) : null
                  )}
                </SelectContent>
              </Select>
              {errors.departmentId && (
                <p className="text-sm text-destructive">{errors.departmentId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="years">Duration (Years)</Label>
              <Input
                id="years"
                type="number"
                min="1"
                max="10"
                {...register('years', { valueAsNumber: true })}
                placeholder="e.g., 2"
              />
              {errors.years && (
                <p className="text-sm text-destructive">{errors.years.message}</p>
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Program description..."
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
                {isSubmitting ? 'Saving...' : selectedProgram ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Program</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedProgram?.name}"? This action cannot be undone.
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
