'use client'

import { AdminLayout } from '@/components/AdminLayout'
import { AuthGuard } from '@/components/AuthGuard'
import { ProgramManager } from '@/components/ProgramManager'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { getAuthHeaders, UserRole } from '@/data/config/firebase-auth'
import { Program } from '@/data/models/program'
import { getCollegeById } from '@/data/services/college-service'
import { getCollegePrograms } from '@/data/services/program-service'
import {
    ArrowLeft,
    BookOpen,
    Building2,
    Clock,
    Filter,
    Globe,
    GraduationCap,
    Search,
    Settings,
    Users
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function CollegeProgramsPage() {
  const router = useRouter()
  const { userProfile } = useAuth()
  const [programs, setPrograms] = useState<Program[]>([])
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [languageFilter, setLanguageFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [collegeName, setCollegeName] = useState('')
  const [isAdministrator, setIsAdministrator] = useState(false)
  const [activeTab, setActiveTab] = useState('browse')

  useEffect(() => {
    loadPrograms()
    checkAdministratorStatus()
  }, [userProfile])

  useEffect(() => {
    filterPrograms()
  }, [programs, searchTerm, departmentFilter, languageFilter, categoryFilter])

  const checkAdministratorStatus = async () => {
    if (!userProfile?.collegeId || userProfile.role !== UserRole.INSTRUCTOR) {
      setIsAdministrator(false)
      return
    }
    
    try {
      const response = await fetch(`/api/colleges/${userProfile.collegeId}/check-admin`, {
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const data = await response.json()
        setIsAdministrator(data.isAdministrator || false)
      }
    } catch (error) {
      console.error('Error checking administrator status:', error)
      setIsAdministrator(false)
    }
  }

  const loadPrograms = async () => {
    if (!userProfile?.collegeId) {
      setError('No college association found. Please update your profile.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Load college name and programs
      const [collegeData, programsData] = await Promise.all([
        getCollegeById(userProfile.collegeId),
        getCollegePrograms(userProfile.collegeId)
      ])
      
      if (collegeData) {
        setCollegeName(collegeData.name)
      }
      
      setPrograms(programsData)
    } catch (error) {
      console.error('Error loading programs:', error)
      setError('Failed to load programs. Please try again.')
      toast.error('Failed to load programs')
    } finally {
      setLoading(false)
    }
  }

  const filterPrograms = () => {
    let filtered = programs

    // Filter by search term (program name, description, program code)
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(program =>
        program.name.toLowerCase().includes(term) ||
        program.description.toLowerCase().includes(term)
      )
    }

    // Filter by department - skip since we don't have department names, only IDs
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(program => program.departmentId === departmentFilter)
    }

    // Filter by language - use medium instead
    if (languageFilter !== 'all') {
      filtered = filtered.filter(program => program.medium === languageFilter)
    }

    // Filter by category - skip since Program doesn't have category
    if (categoryFilter !== 'all') {
      // Category filter not applicable to current Program model
      filtered = filtered
    }

    setFilteredPrograms(filtered)
  }

  const getDurationText = (program: Program) => {
    return `${program.years} years`
  }

  const getDurationBadgeVariant = (program: Program) => {
    if (program.years <= 2) return 'secondary'
    if (program.years <= 4) return 'default'
    return 'destructive'
  }

  // Helper functions to get unique filter values
  const getUniqueDepartments = () => {
    const departments = programs
      .map(program => program.departmentId)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index)
    return departments as string[]
  }

  const getUniqueLanguages = () => {
    const languages = programs
      .map(program => program.medium)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index)
    return languages as string[]
  }

  const getUniqueCategories = () => {
    // Categories not available in current Program model
    return []
  }

  const ProgramCard = ({ program }: { program: Program }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{program.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <CardDescription className="text-sm">
                {getDurationText(program)}
              </CardDescription>
            </div>
          </div>
          <Badge variant={getDurationBadgeVariant(program)}>
            {getDurationText(program)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {program.description}
        </p>
        
        {/* Program Details */}
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="capitalize">years</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-green-600" />
            <span>Active</span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-purple-600" />
            <span className="text-xs">{program.departmentId}</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-orange-600" />
            <span className="text-xs">{program.medium}</span>
          </div>
        </div>

        {/* Program Metadata */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Created: {(program.createdAt instanceof Date ? program.createdAt : (program.createdAt as any)?.toDate?.() || new Date(program.createdAt as any)).toLocaleDateString()}</span>
            <span>Updated: {(program.updatedAt instanceof Date ? program.updatedAt : (program.updatedAt as any)?.toDate?.() || new Date(program.updatedAt as any)).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <AuthGuard requiredRoles={[UserRole.INSTRUCTOR, UserRole.STUDENT]}>
        <AdminLayout>
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading programs...</span>
            </div>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  if (error) {
    return (
      <AuthGuard requiredRoles={[UserRole.INSTRUCTOR, UserRole.STUDENT]}>
        <AdminLayout>
          <div className="container mx-auto px-4 py-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Programs Unavailable</h3>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={loadPrograms}>
                      Try Again
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/college')}>
                      Back to College
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredRoles={[UserRole.INSTRUCTOR, UserRole.STUDENT]}>
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Link href="/college">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to College
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Academic Programs</h1>
                <p className="text-muted-foreground">
                  {collegeName ? `Explore programs offered by ${collegeName}` : 'Explore academic programs offered by your college'}
                </p>
              </div>
            </div>
          </div>

          {/* Tabbed Interface */}
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-2 lg:w-auto">
              <TabsTrigger value="browse" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Browse Programs
              </TabsTrigger>
              {isAdministrator && (
                <TabsTrigger value="manage" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Manage Programs
                </TabsTrigger>
              )}
            </TabsList>

            {/* Browse Programs Tab */}
            <TabsContent value="browse" className="space-y-6">
              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters
                  </CardTitle>
                  <CardDescription>Filter and search through available programs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                      <Label htmlFor="search">Search Programs</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="search"
                          placeholder="Search by name, description, or code..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Department Filter */}
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Departments" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          {getUniqueDepartments().map(department => (
                            <SelectItem key={department} value={department}>
                              {department}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Language Filter */}
                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select value={languageFilter} onValueChange={setLanguageFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Languages" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Languages</SelectItem>
                          {getUniqueLanguages().map(language => (
                            <SelectItem key={language} value={language}>
                              {language}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Category Filter */}
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {getUniqueCategories().map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Programs Statistics */}
              {programs.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-primary">{programs.length}</div>
                      <p className="text-xs text-muted-foreground">Total Programs</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-blue-600">{getUniqueDepartments().length || 'N/A'}</div>
                      <p className="text-xs text-muted-foreground">Departments</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-green-600">{getUniqueLanguages().length || 'N/A'}</div>
                      <p className="text-xs text-muted-foreground">Languages</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-purple-600">{getUniqueCategories().length || 'N/A'}</div>
                      <p className="text-xs text-muted-foreground">Categories</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Results Summary */}
              <div>
                <p className="text-sm text-muted-foreground">
                  Showing {filteredPrograms.length} of {programs.length} programs
                </p>
              </div>

              {/* Programs Grid */}
              {filteredPrograms.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-16">
                      <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-semibold mb-2">No programs found</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchTerm || departmentFilter !== 'all' || languageFilter !== 'all' || categoryFilter !== 'all'
                          ? 'Try adjusting your search criteria to find more programs.'
                          : programs.length === 0 
                            ? 'This college has not yet published any academic programs.'
                            : 'No academic programs match your current filters.'
                        }
                      </p>
                      {(searchTerm || departmentFilter !== 'all' || languageFilter !== 'all' || categoryFilter !== 'all') && (
                        <Button 
                          className="mt-4" 
                          variant="outline"
                          onClick={() => {
                            setSearchTerm('')
                            setDepartmentFilter('all')
                            setLanguageFilter('all')
                            setCategoryFilter('all')
                          }}
                        >
                          Clear Filters
                        </Button>
                      )}
                      {programs.length === 0 && isAdministrator && (
                        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-2">
                            Want to add programs for your college?
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setActiveTab('manage')}
                          >
                            Switch to Manage Tab
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPrograms.map(program => (
                    <ProgramCard key={program.id} program={program} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Manage Programs Tab */}
            {isAdministrator && userProfile?.collegeId && (
              <TabsContent value="manage" className="space-y-6">
                <ProgramManager 
                  collegeId={userProfile.collegeId}
                  collegeName={collegeName}
                  isAdministrator={isAdministrator}
                />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}
