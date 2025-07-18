'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { Subject } from '@/data/models/subject'
import { getPrograms } from '@/data/services/program-service'
import { createSubject, deleteSubject, getSubjects, updateSubject } from '@/data/services/subject-service'
import { BookOpen, Calendar, Edit, Trash2, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface SubjectManagerProps {
  collegeId: string
  programId?: string
  programName?: string
}

type Medium = 'English' | 'Telugu'

export function SubjectManager({ collegeId, programId, programName }: SubjectManagerProps) {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [programs, setPrograms] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [activeTab, setActiveTab] = useState('1')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    programId: '',
    year: 1,
    medium: 'English' as Medium,
    instructorId: '',
    description: '',
    credits: 0
  })

  // Fetch subjects and programs
  useEffect(() => {
    loadPrograms()
    loadSubjects()
  }, [collegeId])

  const loadPrograms = async () => {
    try {
      const data = await getPrograms(collegeId)
      setPrograms(data)
    } catch {
      toast.error('Failed to load programs')
    }
  }

  const loadSubjects = async () => {
    setIsLoading(true)
    try {
      const data = await getSubjects(collegeId)
      setSubjects(data)
    } catch {
      toast.error('Failed to load subjects')
    } finally {
      setIsLoading(false)
    }
  }

  const openCreateDialog = () => {
    setEditingSubject(null)
    setFormData({
      name: '',
      programId: '',
      year: 1,
      medium: 'English',
      instructorId: '',
      description: '',
      credits: 0
    })
    setDialogOpen(true)
  }

  const openEditDialog = (subject: Subject) => {
    setEditingSubject(subject)
    setFormData({
      name: subject.name,
      programId: subject.programId,
      year: subject.year,
      medium: subject.medium as Medium,
      instructorId: subject.instructorId,
      description: subject.description || '',
      credits: subject.credits || 0
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingSubject) {
        await updateSubject(collegeId, editingSubject.id!, { ...formData, medium: formData.medium as Medium })
        toast.success('Subject updated')
      } else {
        // Add required fields for create
        await createSubject(collegeId, {
          ...formData,
          medium: formData.medium as Medium,
          collegeId,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'admin'
        })
        toast.success('Subject created')
      }
      setDialogOpen(false)
      loadSubjects()
    } catch {
      toast.error('Failed to save subject')
    }
  }

  const handleDelete = async (subject: Subject) => {
    if (!confirm(`Delete subject '${subject.name}'?`)) return
    try {
      await deleteSubject(collegeId, subject.id!)
      toast.success('Subject deleted')
      loadSubjects()
    } catch {
      toast.error('Failed to delete subject')
    }
  }

  // Group subjects by year/semester
  const subjectsByPeriod = subjects.reduce((acc, subject) => {
    if (!acc[subject.year]) {
      acc[subject.year] = []
    }
    acc[subject.year].push(subject)
    return acc
  }, {} as Record<number, Subject[]>)

  // Generate period labels
  const periodLabels = Array.from({ length: 4 }, (_, i) => i + 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Subjects
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage subjects organized by year for this college
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingSubject ? 'Edit Subject' : 'Add New Subject'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div>
                <Label>Program</Label>
                <Select value={formData.programId} onValueChange={val => setFormData({ ...formData, programId: val })} required>
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
                <Label>Year</Label>
                <Input type="number" min={1} value={formData.year} onChange={e => setFormData({ ...formData, year: Number(e.target.value) })} required />
              </div>
              <div>
                <Label>Medium</Label>
                <Select value={formData.medium} onValueChange={val => setFormData({ ...formData, medium: val as Medium })} required>
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
                <Input value={formData.instructorId} onChange={e => setFormData({ ...formData, instructorId: e.target.value })} required />
              </div>
              <div>
                <Label>Credits</Label>
                <Input type="number" min={0} value={formData.credits} onChange={e => setFormData({ ...formData, credits: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit">{editingSubject ? "Update" : "Create"}</Button>
              </DialogFooter>
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
                Year {period}
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
                    Year {period} Subjects
                  </CardTitle>
                  <CardDescription>
                    {subjectsByPeriod[period]?.length || 0} subjects in this year
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
                                  {subject.credits && (
                                    <Badge variant="outline">{subject.credits} credits</Badge>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                  <div className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    {subject.instructorName || subject.instructorId}
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
                                  onClick={() => openEditDialog(subject)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(subject)}
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
                      <p>No subjects added for this year yet.</p>
                      <p className="text-sm">Click "Add Subject" to create the first subject.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}
