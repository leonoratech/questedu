'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import { getAuthHeaders } from '@/data/config/firebase-auth'
import { CreateSubjectRequest, InstructorOption, Subject, SubjectsByPeriod } from '@/data/models/subject'
import { BookOpen, Calendar, Edit, Plus, Trash2, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface SubjectManagerProps {
  programId: string
  collegeId: string
  programName: string
  maxPeriods: number
  semesterType: 'years' | 'semesters'
}

export function SubjectManager({ 
  programId, 
  collegeId, 
  programName, 
  maxPeriods, 
  semesterType 
}: SubjectManagerProps) {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [instructors, setInstructors] = useState<InstructorOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [activeTab, setActiveTab] = useState('1')

  // Form state
  const [formData, setFormData] = useState<CreateSubjectRequest>({
    name: '',
    yearOrSemester: 1,
    instructorId: '',
    isDefaultEnrollment: true,
    description: '',
    credits: 3,
    prerequisites: []
  })

  // Fetch subjects and instructors
  useEffect(() => {
    if (programId && collegeId) {
      fetchSubjects()
      fetchInstructors()
    }
  }, [programId, collegeId])

  const fetchSubjects = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/colleges/${collegeId}/programs/${programId}/subjects`, {
        headers: getAuthHeaders(),
      })
      
      if (response.ok) {
        const data = await response.json()
        setSubjects(data.subjects || [])
      } else {
        throw new Error('Failed to fetch subjects')
      }
    } catch (error) {
      console.error('Error fetching subjects:', error)
      toast.error('Failed to load subjects')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchInstructors = async () => {
    try {
      const response = await fetch(`/api/colleges/${collegeId}/instructors`, {
        headers: getAuthHeaders(),
      })
      
      if (response.ok) {
        const data = await response.json()
        setInstructors(data.data || []) // Note: API returns data.data, not data.instructors
      } else {
        throw new Error('Failed to fetch instructors')
      }
    } catch (error) {
      console.error('Error fetching instructors:', error)
      toast.error('Failed to load instructors')
    }
  }

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsLoading(true)
      const response = await fetch(`/api/colleges/${collegeId}/programs/${programId}/subjects`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Subject created successfully')
        setIsCreateModalOpen(false)
        resetForm()
        fetchSubjects()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create subject')
      }
    } catch (error) {
      console.error('Error creating subject:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create subject')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSubject) return
    
    try {
      setIsLoading(true)
      const response = await fetch(`/api/colleges/${collegeId}/programs/${programId}/subjects/${editingSubject.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Subject updated successfully')
        setIsEditModalOpen(false)
        setEditingSubject(null)
        resetForm()
        fetchSubjects()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update subject')
      }
    } catch (error) {
      console.error('Error updating subject:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update subject')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSubject = async (subjectId: string, subjectName: string) => {
    if (!confirm(`Are you sure you want to delete "${subjectName}"? This action cannot be undone.`)) {
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/colleges/${collegeId}/programs/${programId}/subjects/${subjectId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        toast.success('Subject deleted successfully')
        fetchSubjects()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete subject')
      }
    } catch (error) {
      console.error('Error deleting subject:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete subject')
    } finally {
      setIsLoading(false)
    }
  }

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject)
    setFormData({
      name: subject.name,
      yearOrSemester: subject.yearOrSemester,
      instructorId: subject.instructorId,
      isDefaultEnrollment: subject.isDefaultEnrollment,
      description: subject.description || '',
      credits: subject.credits || 3,
      prerequisites: subject.prerequisites || []
    })
    setIsEditModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      yearOrSemester: 1,
      instructorId: '',
      isDefaultEnrollment: true,
      description: '',
      credits: 3,
      prerequisites: []
    })
  }

  // Group subjects by year/semester
  const subjectsByPeriod: SubjectsByPeriod = subjects.reduce((acc, subject) => {
    if (!acc[subject.yearOrSemester]) {
      acc[subject.yearOrSemester] = []
    }
    acc[subject.yearOrSemester].push(subject)
    return acc
  }, {} as SubjectsByPeriod)

  // Generate period labels
  const periodLabels = Array.from({ length: maxPeriods }, (_, i) => i + 1)

  const getInstructorName = (instructorId: string) => {
    const instructor = instructors.find(i => i.id === instructorId)
    return instructor ? instructor.name : 'Unknown Instructor'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Subjects for {programName}
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage subjects organized by {semesterType} for this program
          </p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Subject</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Subject Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Advanced Mathematics"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="yearOrSemester">{semesterType === 'years' ? 'Year' : 'Semester'}</Label>
                  <Select 
                    value={formData.yearOrSemester.toString()} 
                    onValueChange={(value) => setFormData({ ...formData, yearOrSemester: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {periodLabels.map(period => (
                        <SelectItem key={period} value={period.toString()}>
                          {semesterType === 'years' ? `Year ${period}` : `Semester ${period}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instructor">Instructor</Label>
                  <Select 
                    value={formData.instructorId} 
                    onValueChange={(value) => setFormData({ ...formData, instructorId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select instructor" />
                    </SelectTrigger>
                    <SelectContent>
                      {instructors.map(instructor => (
                        <SelectItem key={instructor.id} value={instructor.id}>
                          {instructor.name} {instructor.department && `(${instructor.department})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="credits">Credits</Label>
                  <Input
                    id="credits"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the subject..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isDefaultEnrollment"
                  checked={formData.isDefaultEnrollment}
                  onCheckedChange={(checked) => setFormData({ ...formData, isDefaultEnrollment: checked })}
                />
                <Label htmlFor="isDefaultEnrollment">
                  Default Enrollment (students are automatically enrolled)
                </Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Subject'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Subjects organized by period */}
      {isLoading ? (
        <div className="text-center py-8">Loading subjects...</div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6">
            {periodLabels.map(period => (
              <TabsTrigger key={period} value={period.toString()}>
                {semesterType === 'years' ? `Year ${period}` : `Sem ${period}`}
                {subjectsByPeriod[period] && (
                  <Badge variant="secondary" className="ml-2">
                    {subjectsByPeriod[period].length}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {periodLabels.map(period => (
            <TabsContent key={period} value={period.toString()}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {semesterType === 'years' ? `Year ${period}` : `Semester ${period}`} Subjects
                  </CardTitle>
                  <CardDescription>
                    {subjectsByPeriod[period]?.length || 0} subjects in this {semesterType.slice(0, -1)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {subjectsByPeriod[period]?.length ? (
                    <div className="space-y-4">
                      {subjectsByPeriod[period].map(subject => (
                        <Card key={subject.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold">{subject.name}</h4>
                                  <Badge variant={subject.isDefaultEnrollment ? "default" : "secondary"}>
                                    {subject.isDefaultEnrollment ? "Default" : "Optional"}
                                  </Badge>
                                  {subject.credits && (
                                    <Badge variant="outline">{subject.credits} credits</Badge>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                  <div className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    {subject.instructorName || getInstructorName(subject.instructorId)}
                                  </div>
                                </div>

                                {subject.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {subject.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-2 ml-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditModal(subject)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteSubject(subject.id!, subject.name)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No subjects added for this {semesterType.slice(0, -1)} yet.</p>
                      <p className="text-sm">Click "Add Subject" to create the first subject.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Edit Subject Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateSubject} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Subject Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Advanced Mathematics"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-yearOrSemester">{semesterType === 'years' ? 'Year' : 'Semester'}</Label>
                <Select 
                  value={formData.yearOrSemester.toString()} 
                  onValueChange={(value) => setFormData({ ...formData, yearOrSemester: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {periodLabels.map(period => (
                      <SelectItem key={period} value={period.toString()}>
                        {semesterType === 'years' ? `Year ${period}` : `Semester ${period}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-instructor">Instructor</Label>
                <Select 
                  value={formData.instructorId} 
                  onValueChange={(value) => setFormData({ ...formData, instructorId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select instructor" />
                  </SelectTrigger>
                  <SelectContent>
                    {instructors.map(instructor => (
                      <SelectItem key={instructor.id} value={instructor.id}>
                        {instructor.name} {instructor.department && `(${instructor.department})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-credits">Credits</Label>
                <Input
                  id="edit-credits"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the subject..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isDefaultEnrollment"
                checked={formData.isDefaultEnrollment}
                onCheckedChange={(checked) => setFormData({ ...formData, isDefaultEnrollment: checked })}
              />
              <Label htmlFor="edit-isDefaultEnrollment">
                Default Enrollment (students are automatically enrolled)
              </Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsEditModalOpen(false)
                  setEditingSubject(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Subject'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
