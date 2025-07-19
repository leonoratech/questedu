'use client'

import { SubjectManager } from '@/components/SubjectManager'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Department } from '@/data/models/department'
import { Program } from '@/data/models/program'
import { getDepartments } from '@/data/services/department-service'
import { createProgram, deleteProgram, getCollegePrograms, updateProgram } from '@/data/services/program-service'
import { BookOpen, ChevronDown, ChevronRight, Edit, GraduationCap, Plus, Trash2, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface ProgramManagerProps {
  collegeId: string
  collegeName: string
  isAdministrator: boolean
}

interface ProgramFormData {
  name: string
  departmentId: string
  years: number
  description: string
  medium: string
}

const initialFormData: ProgramFormData = {
  name: '',
  departmentId: '',
  years: 1,
  description: '',
  medium: 'English'
}

export function ProgramManager({ collegeId, collegeName, isAdministrator }: ProgramManagerProps) {
  const [programs, setPrograms] = useState<Program[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)
  const [formData, setFormData] = useState<ProgramFormData>(initialFormData)
  const [saving, setSaving] = useState(false)
  const [expandedPrograms, setExpandedPrograms] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadDepartments()
    loadPrograms()
  }, [collegeId])

  const toggleProgramExpansion = (programId: string) => {
    const newExpanded = new Set(expandedPrograms)
    if (newExpanded.has(programId)) {
      newExpanded.delete(programId)
    } else {
      newExpanded.add(programId)
    }
    setExpandedPrograms(newExpanded)
  }

  const loadDepartments = async () => {
    try {
      const data = await getDepartments(collegeId)
      setDepartments(data)
    } catch {
      toast.error('Failed to load departments')
    }
  }

  const loadPrograms = async () => {
    setLoading(true)
    try {
      const data = await getCollegePrograms(collegeId)
      setPrograms(data)
    } catch (error) {
      console.error('Error loading programs:', error)
      toast.error('Failed to load programs')
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = () => {
    setEditingProgram(null)
    setFormData(initialFormData)
    setDialogOpen(true)
  }

  const handleEdit = (program: Program) => {
    setEditingProgram(program)
    setFormData({
      name: program.name,
      departmentId: program.departmentId,
      years: program.years,
      description: program.description,
      medium: program.medium
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.description.trim() || formData.years < 1) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setSaving(true)
      
      if (editingProgram) {
        // Update existing program
        await updateProgram(collegeId, editingProgram.id!, {
          ...formData,
          medium: formData.medium as 'English' | 'Telugu'
        })
        toast.success('Program updated successfully')
        setDialogOpen(false)
        await loadPrograms()
      } else {
        // Create new program
        const result = await createProgram(collegeId, {
          ...formData,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'admin',
          medium: formData.medium as 'English' | 'Telugu'
        })
        if (result) {
          toast.success('Program created successfully')
          setDialogOpen(false)
          await loadPrograms()
        } else {
          toast.error('Failed to create program')
        }
      }
    } catch (error) {
      console.error('Error saving program:', error)
      toast.error('Failed to save program')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (program: Program) => {
    if (!confirm(`Are you sure you want to delete "${program.name}"?`)) {
      return
    }

    try {
      await deleteProgram(collegeId, program.id!)
      toast.success('Program deleted successfully')
      await loadPrograms()
    } catch (error) {
      console.error('Error deleting program:', error)
      toast.error('Failed to delete program')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Academic Programs
          </CardTitle>
          <CardDescription>Loading programs...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Academic Programs
              </CardTitle>
              <CardDescription>
                Programs offered by {collegeName}
              </CardDescription>
            </div>
            {isAdministrator && (
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add Program
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {programs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No programs available yet</p>
              {isAdministrator && (
                <p className="text-xs">Add the first program to get started</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {programs.map((program) => (
                <Card key={program.id} className="border-l-4 border-l-primary">
                  <Collapsible 
                    open={expandedPrograms.has(program.id!)} 
                    onOpenChange={() => toggleProgramExpansion(program.id!)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                {expandedPrograms.has(program.id!) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                            <BookOpen className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">{program.name}</CardTitle>
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {program.departmentId}
                            </Badge>
                          </div>
                          <CardDescription className="line-clamp-2 ml-9">
                            {program.description}
                          </CardDescription>
                        </div>
                        
                        {isAdministrator && (
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(program)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(program)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="ml-9 border-t pt-4">
                          {isAdministrator ? (
                            <SubjectManager
                              programId={program.id!}
                              collegeId={collegeId}
                              programName={program.name}
                            />
                          ) : (
                            <div className="text-center py-6 text-muted-foreground">
                              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">Subject details are only available to administrators</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Program Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingProgram ? 'Edit Program' : 'Add New Program'}
            </DialogTitle>
            <DialogDescription>
              {editingProgram 
                ? 'Update the program information'
                : 'Create a new academic program for your college'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Program Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Bachelor of Computer Applications (BCA)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="years">Duration (in years) *</Label>
                <Input
                  id="years"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.years}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    years: parseInt(e.target.value) || 1 
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medium">Medium *</Label>
                <Select 
                  value={formData.medium} 
                  onValueChange={(value) => setFormData({ ...formData, medium: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                    <SelectItem value="Bilingual">Bilingual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the program, its objectives, and what students will learn..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select 
                value={formData.departmentId} 
                onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={department.id || ''}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : (editingProgram ? 'Update Program' : 'Create Program')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
