"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Department } from "@/data/models/department"
import { createDepartment, deleteDepartment, getDepartments, updateDepartment } from "@/data/services/department-service"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface DepartmentManagerProps {
  collegeId: string
}

const DEPARTMENT_TYPES: Array<'Arts' | 'Science' | 'Vocational'> = ['Arts', 'Science', 'Vocational']

export function DepartmentManager({ collegeId }: DepartmentManagerProps) {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Department | null>(null)
  const [form, setForm] = useState({ name: "Arts" as 'Arts' | 'Science' | 'Vocational', description: "" })

  useEffect(() => {
    loadDepartments()
  }, [collegeId])

  async function loadDepartments() {
    setLoading(true)
    try {
      const data = await getDepartments(collegeId)
      setDepartments(data)
    } catch {
      toast.error("Failed to load departments")
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditing(null)
    setForm({ name: "Arts", description: "" })
    setDialogOpen(true)
  }

  function openEdit(dep: Department) {
    setEditing(dep)
    setForm({ name: dep.name, description: dep.description || "" })
    setDialogOpen(true)
  }

  // Fix: Add required fields for createDepartment
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (editing) {
        await updateDepartment(collegeId, editing.id, form)
        toast.success("Department updated")
      } else {
        await createDepartment(collegeId, {
          ...form,          
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: "admin"
        })
        toast.success("Department created")
      }
      setDialogOpen(false)
      loadDepartments()
    } catch {
      toast.error("Failed to save department")
    }
  }

  async function handleDelete(dep: Department) {
    if (!confirm(`Delete department '${dep.name}'?`)) return
    try {
      await deleteDepartment(collegeId, dep.id)
      toast.success("Department deleted")
      loadDepartments()
    } catch {
      toast.error("Failed to delete department")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Departments</h2>
        <Button onClick={openCreate}>Add Department</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {departments.map(dep => (
          <Card key={dep.id}>
            <CardHeader>
              <CardTitle>{dep.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 text-muted-foreground text-sm">{dep.description}</div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(dep)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(dep)}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Department" : "Add Department"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Department Type</Label>
              <Select value={form.name} onValueChange={(value) => setForm(f => ({ ...f, name: value as 'Arts' | 'Science' | 'Vocational' }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department type" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENT_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editing ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
