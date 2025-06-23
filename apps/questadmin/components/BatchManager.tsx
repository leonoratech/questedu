'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Batch, BatchStats, BatchStatus, CreateBatchRequest, InstructorOption } from '@/data/models/batch'
import { Program } from '@/data/models/program'
import { createBatch, deleteBatch, getAvailableInstructors, getBatchStats, getCollegeBatches, updateBatch } from '@/data/services/batch-service'
import { getCollegePrograms } from '@/data/services/program-service'
import {
    Calendar,
    ChevronDown,
    ChevronUp,
    Clock,
    Edit,
    GraduationCap,
    Plus,
    Trash2,
    User,
    Users
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface BatchManagerProps {
  collegeId: string
  collegeName: string
  isAdministrator: boolean
}

interface BatchFormData {
  name: string
  programId: string
  startDate: string
  endDate: string
  ownerId: string
  description: string
  maxStudents: string
}

export function BatchManager({ collegeId, collegeName, isAdministrator }: BatchManagerProps) {
  const [batches, setBatches] = useState<Batch[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [instructors, setInstructors] = useState<InstructorOption[]>([])
  const [stats, setStats] = useState<BatchStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null)
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null)
  const [formData, setFormData] = useState<BatchFormData>({
    name: '',
    programId: '',
    startDate: '',
    endDate: '',
    ownerId: '',
    description: '',
    maxStudents: ''
  })

  useEffect(() => {
    if (isAdministrator) {
      loadData()
    }
  }, [collegeId, isAdministrator])

  const loadData = async () => {
    try {
      setLoading(true)
      const [batchesData, programsData, instructorsData, statsData] = await Promise.all([
        getCollegeBatches(collegeId),
        getCollegePrograms(collegeId),
        getAvailableInstructors(collegeId),
        getBatchStats(collegeId)
      ])
      
      setBatches(batchesData)
      setPrograms(programsData)
      setInstructors(instructorsData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading batch data:', error)
      toast.error('Failed to load batch information')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.programId || !formData.startDate || !formData.endDate || !formData.ownerId) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const batchData: CreateBatchRequest = {
        name: formData.name,
        programId: formData.programId,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        ownerId: formData.ownerId,
        description: formData.description,
        maxStudents: formData.maxStudents ? Number(formData.maxStudents) : undefined
      }

      let success = false
      
      if (editingBatch) {
        success = await updateBatch(collegeId, editingBatch.id!, batchData)
        if (success) {
          toast.success('Batch updated successfully')
        }
      } else {
        const newBatch = await createBatch(collegeId, batchData)
        success = !!newBatch
        if (success) {
          toast.success('Batch created successfully')
        }
      }

      if (success) {
        setDialogOpen(false)
        resetForm()
        loadData()
      } else {
        toast.error(`Failed to ${editingBatch ? 'update' : 'create'} batch`)
      }
    } catch (error) {
      console.error('Error saving batch:', error)
      toast.error(`Failed to ${editingBatch ? 'update' : 'create'} batch`)
    }
  }

  const handleEdit = (batch: Batch) => {
    setEditingBatch(batch)
    setFormData({
      name: batch.name,
      programId: batch.programId,
      startDate: new Date(batch.startDate).toISOString().split('T')[0],
      endDate: new Date(batch.endDate).toISOString().split('T')[0],
      ownerId: batch.ownerId,
      description: batch.description || '',
      maxStudents: batch.maxStudents?.toString() || ''
    })
    setDialogOpen(true)
  }

  const handleDelete = async (batch: Batch) => {
    if (!confirm(`Are you sure you want to delete "${batch.name}"?`)) return

    try {
      const success = await deleteBatch(collegeId, batch.id!)
      if (success) {
        toast.success('Batch deleted successfully')
        loadData()
      } else {
        toast.error('Failed to delete batch')
      }
    } catch (error) {
      console.error('Error deleting batch:', error)
      toast.error('Failed to delete batch')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      programId: '',
      startDate: '',
      endDate: '',
      ownerId: '',
      description: '',
      maxStudents: ''
    })
    setEditingBatch(null)
  }

  const handleAddNew = () => {
    resetForm()
    setDialogOpen(true)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case BatchStatus.ACTIVE:
        return 'default'
      case BatchStatus.UPCOMING:
        return 'secondary'
      case BatchStatus.COMPLETED:
        return 'outline'
      case BatchStatus.CANCELLED:
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getProgramName = (programId: string) => {
    const program = programs.find(p => p.id === programId)
    return program?.name || 'Unknown Program'
  }

  const getInstructorName = (instructorId: string) => {
    const instructor = instructors.find(i => i.id === instructorId)
    return instructor?.name || 'Unknown Instructor'
  }

  if (!isAdministrator) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
            <p className="text-muted-foreground">
              Only college administrators can manage batches.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Total Batches</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalBatches}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Active Batches</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{stats.activeBatches}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Upcoming</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">{stats.upcomingBatches}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Total Students</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{stats.totalStudents}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Batches List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Batch Management</CardTitle>
              <CardDescription>
                Manage batch instances for {collegeName}
              </CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create Batch
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {batches.length === 0 ? (
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Batches Found</h3>
              <p className="text-muted-foreground mb-4">
                Create your first batch to get started.
              </p>
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Batch
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {batches.map((batch) => (
                <Card key={batch.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{batch.name}</h3>
                          <Badge variant={getStatusBadgeVariant(batch.status)}>
                            {batch.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" />
                            {getProgramName(batch.programId)}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {getInstructorName(batch.ownerId)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(batch.startDate)} - {formatDate(batch.endDate)}
                          </div>
                        </div>
                        
                        {batch.maxStudents && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <Users className="h-3 w-3" />
                            {batch.currentStudentCount || 0} / {batch.maxStudents} students
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedBatch(expandedBatch === batch.id ? null : batch.id!)}
                        >
                          {expandedBatch === batch.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(batch)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(batch)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedBatch === batch.id && batch.description && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium mb-2">Description</h4>
                        <p className="text-sm text-muted-foreground">{batch.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBatch ? 'Edit Batch' : 'Create New Batch'}</DialogTitle>
            <DialogDescription>
              {editingBatch ? 'Update batch information' : 'Create a new batch instance for a program'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Batch Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., BCA - Start 1/Jul/2025"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="program">Program *</Label>
                <Select value={formData.programId} onValueChange={(value) => setFormData(prev => ({ ...prev, programId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select program" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((program) => (
                      <SelectItem key={program.id} value={program.id!}>
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="owner">Batch Owner (Instructor) *</Label>
                <Select value={formData.ownerId} onValueChange={(value) => setFormData(prev => ({ ...prev, ownerId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select instructor" />
                  </SelectTrigger>
                  <SelectContent>
                    {instructors.map((instructor) => (
                      <SelectItem key={instructor.id} value={instructor.id}>
                        {instructor.name} ({instructor.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxStudents">Max Students</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  min="1"
                  value={formData.maxStudents}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxStudents: e.target.value }))}
                  placeholder="Optional limit"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description of the batch"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingBatch ? 'Update Batch' : 'Create Batch'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
