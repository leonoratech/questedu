'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { College } from '@/data/models/college'
import { useToast } from '@/hooks/use-toast'
import { collegeService } from '@/lib/services/college-service'
import { CollegeSchema, type CollegeData } from '@/lib/validations/client'
import { Edit, Loader2, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function CollegesPage() {
  const [colleges, setColleges] = useState<College[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCollege, setEditingCollege] = useState<College | null>(null)
  const [formData, setFormData] = useState<CollegeData>({
    name: '',
    accreditation: '',
    affiliation: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
    },
    contact: {
      phone: '',
      email: '',
      website: '',
    },
    website: '',
    principalName: '',
    description: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    fetchColleges()
  }, [])

  const fetchColleges = async () => {
    try {
      const data = await collegeService.getAll()
      setColleges(data)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch colleges',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      accreditation: '',
      affiliation: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
      },
      contact: {
        phone: '',
        email: '',
        website: '',
      },
      website: '',
      principalName: '',
      description: '',
    })
    setErrors({})
    setEditingCollege(null)
  }

  const handleEdit = (college: College) => {
    setEditingCollege(college)
    setFormData({
      name: college.name,
      accreditation: college.accreditation,
      affiliation: college.affiliation,
      address: college.address,
      contact: college.contact,
      website: college.website,
      principalName: college.principalName,
      description: college.description,
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      CollegeSchema.parse(formData)
      setErrors({})
    } catch (error: any) {
      const fieldErrors: Record<string, string> = {}
      error.errors?.forEach((err: any) => {
        const path = err.path.join('.')
        fieldErrors[path] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    setSubmitting(true)
    try {
      if (editingCollege) {
        await collegeService.update(editingCollege.id!, formData)
        toast({
          title: 'Success',
          description: 'College updated successfully',
        })
      } else {
        await collegeService.create(formData)
        toast({
          title: 'Success',
          description: 'College created successfully',
        })
      }
      
      setDialogOpen(false)
      resetForm()
      fetchColleges()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save college',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (college: College) => {
    if (!confirm('Are you sure you want to delete this college?')) return

    try {
      await collegeService.delete(college.id!)
      toast({
        title: 'Success',
        description: 'College deleted successfully',
      })
      fetchColleges()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete college',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Colleges</h1>
          <p className="text-muted-foreground">
            Manage college information and settings
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add College
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCollege ? 'Edit College' : 'Add New College'}
              </DialogTitle>
              <DialogDescription>
                Enter the college information below
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">College Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="principalName">Principal Name</Label>
                  <Input
                    id="principalName"
                    value={formData.principalName}
                    onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                    className={errors.principalName ? 'border-red-500' : ''}
                  />
                  {errors.principalName && <p className="text-sm text-red-500">{errors.principalName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accreditation">Accreditation</Label>
                  <Input
                    id="accreditation"
                    value={formData.accreditation}
                    onChange={(e) => setFormData({ ...formData, accreditation: e.target.value })}
                    className={errors.accreditation ? 'border-red-500' : ''}
                  />
                  {errors.accreditation && <p className="text-sm text-red-500">{errors.accreditation}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="affiliation">Affiliation</Label>
                  <Input
                    id="affiliation"
                    value={formData.affiliation}
                    onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                    className={errors.affiliation ? 'border-red-500' : ''}
                  />
                  {errors.affiliation && <p className="text-sm text-red-500">{errors.affiliation}</p>}
                </div>
              </div>

              {/* Address Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Address</h3>
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={formData.address.street}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      address: { ...formData.address, street: e.target.value }
                    })}
                    className={errors['address.street'] ? 'border-red-500' : ''}
                  />
                  {errors['address.street'] && <p className="text-sm text-red-500">{errors['address.street']}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.address.city}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        address: { ...formData.address, city: e.target.value }
                      })}
                      className={errors['address.city'] ? 'border-red-500' : ''}
                    />
                    {errors['address.city'] && <p className="text-sm text-red-500">{errors['address.city']}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.address.state}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        address: { ...formData.address, state: e.target.value }
                      })}
                      className={errors['address.state'] ? 'border-red-500' : ''}
                    />
                    {errors['address.state'] && <p className="text-sm text-red-500">{errors['address.state']}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.address.country}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        address: { ...formData.address, country: e.target.value }
                      })}
                      className={errors['address.country'] ? 'border-red-500' : ''}
                    />
                    {errors['address.country'] && <p className="text-sm text-red-500">{errors['address.country']}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={formData.address.postalCode}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        address: { ...formData.address, postalCode: e.target.value }
                      })}
                      className={errors['address.postalCode'] ? 'border-red-500' : ''}
                    />
                    {errors['address.postalCode'] && <p className="text-sm text-red-500">{errors['address.postalCode']}</p>}
                  </div>
                </div>
              </div>

              {/* Contact Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.contact.phone}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        contact: { ...formData.contact, phone: e.target.value }
                      })}
                      className={errors['contact.phone'] ? 'border-red-500' : ''}
                    />
                    {errors['contact.phone'] && <p className="text-sm text-red-500">{errors['contact.phone']}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.contact.email}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        contact: { ...formData.contact, email: e.target.value }
                      })}
                      className={errors['contact.email'] ? 'border-red-500' : ''}
                    />
                    {errors['contact.email'] && <p className="text-sm text-red-500">{errors['contact.email']}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactWebsite">Contact Website</Label>
                    <Input
                      id="contactWebsite"
                      value={formData.contact.website}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        contact: { ...formData.contact, website: e.target.value }
                      })}
                      className={errors['contact.website'] ? 'border-red-500' : ''}
                    />
                    {errors['contact.website'] && <p className="text-sm text-red-500">{errors['contact.website']}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Main Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className={errors.website ? 'border-red-500' : ''}
                    />
                    {errors.website && <p className="text-sm text-red-500">{errors.website}</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingCollege ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {colleges.map((college) => (
          <Card key={college.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{college.name}</CardTitle>
                  <CardDescription>{college.principalName}</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(college)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(college)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Accreditation:</strong> {college.accreditation}</p>
                <p><strong>Affiliation:</strong> {college.affiliation}</p>
                <p><strong>Location:</strong> {college.address.city}, {college.address.state}</p>
                <p><strong>Contact:</strong> {college.contact.phone}</p>
                <p className="text-muted-foreground">{college.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {colleges.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No colleges found. Create your first college to get started.</p>
        </div>
      )}
    </div>
  )
}
