'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Batch } from '@/data/models/batch'
import { Program } from '@/data/models/program'
import { getCollegePrograms } from '@/data/services/program-service'
import {
    GraduationCap,
    Plus
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
  const [programs, setPrograms] = useState<Program[]>([])
  const [instructors, setInstructors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null)
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
      const programsData = await getCollegePrograms(collegeId)
      setPrograms(programsData)
    } catch (error) {
      console.error('Error loading program data:', error)
      toast.error('Failed to load program information')
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
      // Batch creation logic here
    } catch (error) {
      console.error('Error saving batch:', error)
      toast.error(`Failed to ${editingBatch ? 'update' : 'create'} batch`)
    }
  }

  const handleEdit = (batch: Batch) => {
    setEditingBatch(batch)
    
    // Convert dates to ISO string format, handling both Date and Timestamp
    const startDateStr = batch.startDate instanceof Date 
      ? batch.startDate.toISOString().split('T')[0]
      : new Date(batch.startDate.toDate()).toISOString().split('T')[0]
    
    const endDateStr = batch.endDate instanceof Date 
      ? batch.endDate.toISOString().split('T')[0]
      : new Date(batch.endDate.toDate()).toISOString().split('T')[0]
    
    setFormData({
      name: batch.name,
      programId: batch.programId,
      startDate: startDateStr,
      endDate: endDateStr,
      ownerId: batch.ownerId,
      description: batch.description || '',
      maxStudents: batch.maxStudents?.toString() || ''
    })
    setDialogOpen(true)
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
          {/* No batches message */}
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
