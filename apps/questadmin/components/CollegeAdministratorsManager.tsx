'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
    assignCollegeAdministrator,
    CollegeAdministrator,
    CollegeAdministratorRole,
    getAvailableInstructors,
    getCollegeAdministrators,
    removeCollegeAdministrator,
    updateCollegeAdministrator
} from '@/data/services/college-service'
import { Crown, Plus, Shield, Trash2, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface CollegeAdministratorsManagerProps {
  collegeId: string
  collegeName: string
  onUpdate?: () => void
}

interface InstructorOption {
  id: string
  uid: string
  email: string
  displayName: string
  firstName: string
  lastName: string
  department?: string
}

export function CollegeAdministratorsManager({
  collegeId,
  collegeName,
  onUpdate
}: CollegeAdministratorsManagerProps) {
  const [administrators, setAdministrators] = useState<CollegeAdministrator[]>([])
  const [availableInstructors, setAvailableInstructors] = useState<InstructorOption[]>([])
  const [loading, setLoading] = useState(true)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedInstructor, setSelectedInstructor] = useState('')
  const [selectedRole, setSelectedRole] = useState<CollegeAdministratorRole>(CollegeAdministratorRole.CO_ADMINISTRATOR)
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    loadData()
  }, [collegeId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [admins, instructors] = await Promise.all([
        getCollegeAdministrators(collegeId),
        getAvailableInstructors(collegeId)
      ])
      setAdministrators(admins)
      setAvailableInstructors(instructors)
    } catch (error) {
      console.error('Error loading administrators data:', error)
      toast.error('Failed to load administrators data')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignAdministrator = async () => {
    if (!selectedInstructor || !selectedRole) {
      toast.error('Please select an instructor and role')
      return
    }

    try {
      setAssigning(true)
      const result = await assignCollegeAdministrator(collegeId, selectedInstructor, selectedRole)
      
      if (result) {
        toast.success('Administrator assigned successfully')
        setAssignDialogOpen(false)
        setSelectedInstructor('')
        setSelectedRole(CollegeAdministratorRole.CO_ADMINISTRATOR)
        await loadData()
        onUpdate?.()
      } else {
        toast.error('Failed to assign administrator')
      }
    } catch (error) {
      console.error('Error assigning administrator:', error)
      toast.error('Failed to assign administrator')
    } finally {
      setAssigning(false)
    }
  }

  const handleRemoveAdministrator = async (administrator: CollegeAdministrator) => {
    if (!administrator.id) return

    if (!confirm(`Remove ${administrator.instructorName} as ${administrator.role}?`)) {
      return
    }

    try {
      const success = await removeCollegeAdministrator(collegeId, administrator.id)
      
      if (success) {
        toast.success('Administrator removed successfully')
        await loadData()
        onUpdate?.()
      } else {
        toast.error('Failed to remove administrator')
      }
    } catch (error) {
      console.error('Error removing administrator:', error)
      toast.error('Failed to remove administrator')
    }
  }

  const handleChangeRole = async (administrator: CollegeAdministrator, newRole: CollegeAdministratorRole) => {
    if (!administrator.id) return

    try {
      const success = await updateCollegeAdministrator(collegeId, administrator.id, { role: newRole })
      
      if (success) {
        toast.success('Administrator role updated successfully')
        await loadData()
        onUpdate?.()
      } else {
        toast.error('Failed to update administrator role')
      }
    } catch (error) {
      console.error('Error updating administrator role:', error)
      toast.error('Failed to update administrator role')
    }
  }

  const getRoleIcon = (role: CollegeAdministratorRole) => {
    switch (role) {
      case CollegeAdministratorRole.ADMINISTRATOR:
        return <Crown className="h-4 w-4 text-yellow-600" />
      case CollegeAdministratorRole.CO_ADMINISTRATOR:
        return <Shield className="h-4 w-4 text-blue-600" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const getRoleBadgeVariant = (role: CollegeAdministratorRole) => {
    switch (role) {
      case CollegeAdministratorRole.ADMINISTRATOR:
        return 'default' as const
      case CollegeAdministratorRole.CO_ADMINISTRATOR:
        return 'secondary' as const
      default:
        return 'outline' as const
    }
  }

  const formatRoleDisplay = (role: CollegeAdministratorRole) => {
    switch (role) {
      case CollegeAdministratorRole.ADMINISTRATOR:
        return 'Administrator'
      case CollegeAdministratorRole.CO_ADMINISTRATOR:
        return 'Co-Administrator'
      default:
        return role
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>College Administrators</CardTitle>
          <CardDescription>Loading...</CardDescription>
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
                <Users className="h-5 w-5" />
                College Administrators
              </CardTitle>
              <CardDescription>
                Manage administrators and co-administrators for {collegeName}
              </CardDescription>
            </div>
            <Button 
              onClick={() => setAssignDialogOpen(true)}
              disabled={availableInstructors.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Assign Administrator
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {administrators.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No administrators assigned yet</p>
              <p className="text-xs">Assign instructors as administrators to manage this college</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Assigned Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {administrators.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{admin.instructorName}</div>
                        <div className="text-sm text-muted-foreground">{admin.instructorEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(admin.role)}
                        <Badge variant={getRoleBadgeVariant(admin.role)}>
                          {formatRoleDisplay(admin.role)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(admin.assignedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select
                          value={admin.role}
                          onValueChange={(value) => handleChangeRole(admin, value as CollegeAdministratorRole)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={CollegeAdministratorRole.ADMINISTRATOR}>
                              Administrator
                            </SelectItem>
                            <SelectItem value={CollegeAdministratorRole.CO_ADMINISTRATOR}>
                              Co-Administrator
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveAdministrator(admin)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Assign Administrator Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign College Administrator</DialogTitle>
            <DialogDescription>
              Select an instructor to assign as administrator or co-administrator for {collegeName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instructor">Instructor</Label>
              <Select value={selectedInstructor} onValueChange={setSelectedInstructor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an instructor" />
                </SelectTrigger>
                <SelectContent>
                  {availableInstructors.map((instructor) => (
                    <SelectItem key={instructor.uid} value={instructor.uid}>
                      <div className="flex flex-col">
                        <span>{instructor.displayName}</span>
                        <span className="text-xs text-muted-foreground">
                          {instructor.email}
                          {instructor.department && ` • ${instructor.department}`}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableInstructors.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No available instructors. All instructors may already be assigned to this college.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as CollegeAdministratorRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CollegeAdministratorRole.ADMINISTRATOR}>
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-yellow-600" />
                      Administrator
                    </div>
                  </SelectItem>
                  <SelectItem value={CollegeAdministratorRole.CO_ADMINISTRATOR}>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      Co-Administrator
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setAssignDialogOpen(false)}
              disabled={assigning}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAssignAdministrator}
              disabled={!selectedInstructor || !selectedRole || assigning}
            >
              {assigning ? 'Assigning...' : 'Assign Administrator'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
