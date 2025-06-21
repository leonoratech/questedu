'use client'

import { AdminLayout } from '@/components/AdminLayout'
import { AuthGuard } from '@/components/AuthGuard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { UserRole } from '@/data/config/firebase-auth'
import { College, createCollege, deleteCollege, getColleges, updateCollege } from '@/data/services/college-service'
import { Edit, Globe, Mail, MapPin, Phone, Plus, School, Search, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface CollegeFormData {
  name: string
  accreditation: string
  affiliation: string
  address: {
    street: string
    city: string
    state: string
    country: string
    postalCode: string
  }
  contact: {
    phone: string
    email: string
    website: string
  }
  website: string
  principalName: string
  description: string
}

function CollegeCard({ college, onEdit, onDelete }: { 
  college: College
  onEdit: (college: College) => void
  onDelete: (college: College) => void
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <School className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{college.name}</CardTitle>
              {college.principalName && (
                <CardDescription>Principal: {college.principalName}</CardDescription>
              )}
            </div>
          </div>
          <Badge variant={college.isActive ? 'default' : 'secondary'}>
            {college.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* College Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {college.accreditation && (
              <div>
                <div className="text-xs text-muted-foreground">Accreditation</div>
                <div className="text-sm font-medium">{college.accreditation}</div>
              </div>
            )}
            {college.affiliation && (
              <div>
                <div className="text-xs text-muted-foreground">Affiliation</div>
                <div className="text-sm font-medium">{college.affiliation}</div>
              </div>
            )}
          </div>

          {/* Address */}
          {college.address && (
            <div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                <MapPin className="h-3 w-3" />
                Address
              </div>
              <div className="text-sm">
                {[
                  college.address.street,
                  college.address.city,
                  college.address.state,
                  college.address.country,
                  college.address.postalCode
                ].filter(Boolean).join(', ')}
              </div>
            </div>
          )}

          {/* Contact Info */}
          <div className="flex flex-wrap gap-4">
            {college.contact?.phone && (
              <div className="flex items-center gap-1 text-sm">
                <Phone className="h-3 w-3 text-muted-foreground" />
                {college.contact.phone}
              </div>
            )}
            {college.contact?.email && (
              <div className="flex items-center gap-1 text-sm">
                <Mail className="h-3 w-3 text-muted-foreground" />
                {college.contact.email}
              </div>
            )}
            {college.contact?.website && (
              <div className="flex items-center gap-1 text-sm">
                <Globe className="h-3 w-3 text-muted-foreground" />
                <a href={college.contact.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Website
                </a>
              </div>
            )}
          </div>

          {/* Description */}
          {college.description && (
            <div className="text-sm text-muted-foreground">
              {college.description}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" size="sm" onClick={() => onEdit(college)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDelete(college)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CollegeFormDialog({ 
  open, 
  onOpenChange, 
  college, 
  onSave 
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  college?: College | null
  onSave: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CollegeFormData>({
    name: '',
    accreditation: '',
    affiliation: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: ''
    },
    contact: {
      phone: '',
      email: '',
      website: ''
    },
    website: '',
    principalName: '',
    description: ''
  })

  useEffect(() => {
    if (college) {
      setFormData({
        name: college.name,
        accreditation: college.accreditation || '',
        affiliation: college.affiliation || '',
        address: {
          street: college.address?.street || '',
          city: college.address?.city || '',
          state: college.address?.state || '',
          country: college.address?.country || '',
          postalCode: college.address?.postalCode || ''
        },
        contact: {
          phone: college.contact?.phone || '',
          email: college.contact?.email || '',
          website: college.contact?.website || ''
        },
        website: college.website || '',
        principalName: college.principalName || '',
        description: college.description || ''
      })
    } else {
      // Reset form for new college
      setFormData({
        name: '',
        accreditation: '',
        affiliation: '',
        address: {
          street: '',
          city: '',
          state: '',
          country: '',
          postalCode: ''
        },
        contact: {
          phone: '',
          email: '',
          website: ''
        },
        website: '',
        principalName: '',
        description: ''
      })
    }
  }, [college, open])

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof CollegeFormData] as any,
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setLoading(true)
    try {
      const collegeData = {
        ...formData,
        // Clean up empty address and contact fields
        address: Object.values(formData.address).some(v => v.trim()) ? formData.address : undefined,
        contact: Object.values(formData.contact).some(v => v.trim()) ? formData.contact : undefined,
      }

      if (college) {
        await updateCollege(college.id!, collegeData)
      } else {
        await createCollege(collegeData)
      }
      
      onSave()
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving college:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{college ? 'Edit College' : 'Add New College'}</DialogTitle>
          <DialogDescription>
            {college ? 'Update college information' : 'Create a new college/university entry'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Basic Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="name">College/University Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter college/university name"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accreditation">Accreditation</Label>
                <Input
                  id="accreditation"
                  value={formData.accreditation}
                  onChange={(e) => handleInputChange('accreditation', e.target.value)}
                  placeholder="e.g., NAAC A+"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="affiliation">Affiliation</Label>
                <Input
                  id="affiliation"
                  value={formData.affiliation}
                  onChange={(e) => handleInputChange('affiliation', e.target.value)}
                  placeholder="e.g., State University"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="principalName">Principal/Chancellor Name</Label>
              <Input
                id="principalName"
                value={formData.principalName}
                onChange={(e) => handleInputChange('principalName', e.target.value)}
                placeholder="Enter principal or chancellor name"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Address</h3>
            
            <div className="space-y-2">
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                value={formData.address.street}
                onChange={(e) => handleInputChange('address.street', e.target.value)}
                placeholder="Enter street address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.address.city}
                  onChange={(e) => handleInputChange('address.city', e.target.value)}
                  placeholder="Enter city"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.address.state}
                  onChange={(e) => handleInputChange('address.state', e.target.value)}
                  placeholder="Enter state"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.address.country}
                  onChange={(e) => handleInputChange('address.country', e.target.value)}
                  placeholder="Enter country"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={formData.address.postalCode}
                  onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                  placeholder="Enter postal code"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.contact.phone}
                  onChange={(e) => handleInputChange('contact.phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) => handleInputChange('contact.email', e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.contact.website}
                onChange={(e) => handleInputChange('contact.website', e.target.value)}
                placeholder="Enter website URL"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter college description (optional)"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name.trim()}>
              {loading ? 'Saving...' : college ? 'Update College' : 'Create College'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function CollegesPage() {
  const [colleges, setColleges] = useState<College[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCollege, setEditingCollege] = useState<College | null>(null)

  useEffect(() => {
    loadColleges()
  }, [])

  const loadColleges = async () => {
    try {
      setLoading(true)
      const data = await getColleges()
      setColleges(data)
    } catch (error) {
      console.error('Error loading colleges:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (college: College) => {
    setEditingCollege(college)
    setDialogOpen(true)
  }

  const handleDelete = async (college: College) => {
    if (confirm(`Are you sure you want to delete ${college.name}?`)) {
      await deleteCollege(college.id!)
      loadColleges()
    }
  }

  const handleAddNew = () => {
    setEditingCollege(null)
    setDialogOpen(true)
  }

  const filteredColleges = colleges.filter(college =>
    college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    college.principalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    college.accreditation?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <AuthGuard requiredRole={UserRole.SUPERADMIN}>
        <AdminLayout>
          <div className="space-y-6">
            <div className="h-8 bg-muted rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredRole={UserRole.SUPERADMIN}>
      <AdminLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">College Management</h1>
              <p className="text-muted-foreground">Manage colleges and universities in the system</p>
            </div>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add College
            </Button>
          </div>

          {/* Search */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search colleges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredColleges.length} of {colleges.length} colleges
            </div>
          </div>

          {/* Colleges Grid */}
          {filteredColleges.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <School className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Colleges Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? 'No colleges match your search criteria.' : 'Get started by adding your first college.'}
                  </p>
                  {!searchTerm && (
                    <Button onClick={handleAddNew}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add College
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredColleges.map((college) => (
                <CollegeCard
                  key={college.id}
                  college={college}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {/* Form Dialog */}
          <CollegeFormDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            college={editingCollege}
            onSave={loadColleges}
          />
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}
