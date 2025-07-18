import { Department } from '../models/department'

export async function getDepartments(collegeId: string): Promise<Department[]> {
  const response = await fetch(`/api/colleges/${collegeId}/departments`)
  if (!response.ok) throw new Error('Failed to fetch departments')
  return await response.json()
}

export async function createDepartment(collegeId: string, data: Omit<Department, 'id'>): Promise<Department> {
  const response = await fetch(`/api/colleges/${collegeId}/departments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) throw new Error('Failed to create department')
  return await response.json()
}

export async function updateDepartment(collegeId: string, id: string, updates: Partial<Department>): Promise<void> {
  const response = await fetch(`/api/colleges/${collegeId}/departments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  })
  if (!response.ok) throw new Error('Failed to update department')
}

export async function deleteDepartment(collegeId: string, id: string): Promise<void> {
  const response = await fetch(`/api/colleges/${collegeId}/departments/${id}`, {
    method: 'DELETE'
  })
  if (!response.ok) throw new Error('Failed to delete department')
}
