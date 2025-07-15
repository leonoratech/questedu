'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CourseAssociation } from '@/data/models/course'
import { Program } from '@/data/models/program'
import { Subject } from '@/data/models/subject'
import { College, getColleges } from '@/data/services/college-service'
import { AssociateCourseRequest, courseAssociationService } from '@/data/services/course-association-service'
import { getCollegePrograms } from '@/data/services/program-service'
import { getSubjectsByProgram } from '@/data/services/subject-service'
import { BookOpen, Building2, Calendar, GraduationCap, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface CourseAssociationManagerProps {
  courseId: string
  currentAssociation?: CourseAssociation
  onAssociationUpdate: (association: CourseAssociation | null) => void
  disabled?: boolean
}

export function CourseAssociationManager({
  courseId,
  currentAssociation,
  onAssociationUpdate,
  disabled = false
}: CourseAssociationManagerProps) {
  const [colleges, setColleges] = useState<College[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [selectedCollege, setSelectedCollege] = useState<string>(currentAssociation?.collegeId || '')
  const [selectedProgram, setSelectedProgram] = useState<string>(currentAssociation?.programId || '')
  const [selectedYear, setSelectedYear] = useState<number>(currentAssociation?.yearOrSemester || 1)
  const [selectedSubject, setSelectedSubject] = useState<string>(currentAssociation?.subjectId || '')

  // Load colleges on mount
  useEffect(() => {
    loadColleges()
  }, [])

  // Load programs when college is selected
  useEffect(() => {
    if (selectedCollege) {
      loadPrograms(selectedCollege)
    } else {
      setPrograms([])
      setSelectedProgram('')
    }
  }, [selectedCollege])

  // Load subjects when program and year are selected
  useEffect(() => {
    if (selectedProgram && selectedYear) {
      loadSubjects(selectedProgram, selectedYear)
    } else {
      setSubjects([])
      setSelectedSubject('')
    }
  }, [selectedProgram, selectedYear])

  const loadColleges = async () => {
    try {
      setLoading(true)
      const collegeList = await getColleges()
      setColleges(collegeList)
    } catch (error: any) {
      console.error('Error loading colleges:', error)
      toast.error(error.message || 'Failed to load colleges')
    } finally {
      setLoading(false)
    }
  }

  const loadPrograms = async (collegeId: string) => {
    try {
      setLoading(true)
      const programList = await getCollegePrograms(collegeId)
      setPrograms(programList)
    } catch (error: any) {
      console.error('Error loading programs:', error)
      toast.error(error.message || 'Failed to load programs')
    } finally {
      setLoading(false)
    }
  }

  const loadSubjects = async (programId: string, yearOrSemester: number) => {
    try {
      setLoading(true)
      // Note: Need to pass collegeId as well
      const subjectList = await getSubjectsByProgram(programId, selectedCollege)
      // Filter by year/semester
      const filteredSubjects = subjectList.filter(subject => subject.yearOrSemester === yearOrSemester)
      setSubjects(filteredSubjects)
    } catch (error: any) {
      console.error('Error loading subjects:', error)
      toast.error(error.message || 'Failed to load subjects')
    } finally {
      setLoading(false)
    }
  }

  const handleAssociate = async () => {
    if (!selectedCollege || !selectedProgram || !selectedSubject) {
      toast.error('Please select all required fields')
      return
    }

    try {
      setSaving(true)
      
      const associationData: AssociateCourseRequest = {
        collegeId: selectedCollege,
        programId: selectedProgram,
        yearOrSemester: selectedYear,
        subjectId: selectedSubject
      }

      const association = await courseAssociationService.associateCourse(courseId, associationData)
      onAssociationUpdate(association)
      toast.success('Course associated successfully!')
    } catch (error: any) {
      console.error('Error associating course:', error)
      toast.error(error.message || 'Failed to associate course')
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveAssociation = async () => {
    try {
      setSaving(true)
      await courseAssociationService.removeAssociation(courseId)
      onAssociationUpdate(null)
      
      // Reset form
      setSelectedCollege('')
      setSelectedProgram('')
      setSelectedYear(1)
      setSelectedSubject('')
      
      toast.success('Course association removed')
    } catch (error: any) {
      console.error('Error removing association:', error)
      toast.error(error.message || 'Failed to remove association')
    } finally {
      setSaving(false)
    }
  }

  const getYearOptions = () => {
    const selectedProgramData = programs.find(p => p.id === selectedProgram)
    if (!selectedProgramData) return []
    
    const options = []
    for (let i = 1; i <= selectedProgramData.yearsOrSemesters; i++) {
      options.push({
        value: i,
        label: `${selectedProgramData.semesterType === 'years' ? 'Year' : 'Semester'} ${i}`
      })
    }
    return options
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Course Association
        </CardTitle>
        <CardDescription>
          Associate this course with a specific program, year/semester, and subject (optional)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentAssociation && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h4 className="font-medium text-blue-900">Current Association</h4>
                <div className="space-y-1 text-sm text-blue-700">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>{currentAssociation.collegeName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    <span>{currentAssociation.programName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Year/Semester {currentAssociation.yearOrSemester}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{currentAssociation.subjectName}</span>
                  </div>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveAssociation}
                disabled={disabled || saving}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {!currentAssociation && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="college">College</Label>
              <Select
                value={selectedCollege}
                onValueChange={setSelectedCollege}
                disabled={disabled || loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select college" />
                </SelectTrigger>
                <SelectContent>
                  {colleges.map((college) => (
                    <SelectItem key={college.id} value={college.id!}>
                      {college.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="program">Program</Label>
              <Select
                value={selectedProgram}
                onValueChange={setSelectedProgram}
                disabled={disabled || loading || !selectedCollege}
              >
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

            <div className="space-y-2">
              <Label htmlFor="year">Year/Semester</Label>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
                disabled={disabled || loading || !selectedProgram}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year/semester" />
                </SelectTrigger>
                <SelectContent>
                  {getYearOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
                disabled={disabled || loading || !selectedProgram || !selectedYear}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id!}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {!currentAssociation && (
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleAssociate}
              disabled={disabled || loading || saving || !selectedCollege || !selectedProgram || !selectedSubject}
            >
              {saving ? 'Associating...' : 'Associate Course'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
