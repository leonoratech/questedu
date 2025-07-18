import { Program } from '@/data/models/program'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  programs?: Program[]
  program?: Program
  error?: string
  message?: string
}

/**
 * Fetch-based program service for new API
 */
export async function getPrograms(collegeId: string, departmentId?: string): Promise<Program[]> {
  const url = departmentId
    ? `/api/colleges/${collegeId}/programs?departmentId=${departmentId}`
    : `/api/colleges/${collegeId}/programs`
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to fetch programs')
  return await response.json()
}

export async function createProgram(collegeId: string, data: Omit<Program, 'id'>): Promise<Program> {
  const response = await fetch(`/api/colleges/${collegeId}/programs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) throw new Error('Failed to create program')
  return await response.json()
}

export async function updateProgram(collegeId: string, id: string, updates: Partial<Program>): Promise<void> {
  const response = await fetch(`/api/colleges/${collegeId}/programs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  })
  if (!response.ok) throw new Error('Failed to update program')
}

export async function deleteProgram(collegeId: string, id: string): Promise<void> {
  const response = await fetch(`/api/colleges/${collegeId}/programs/${id}`, {
    method: 'DELETE'
  })
  if (!response.ok) throw new Error('Failed to delete program')
}

export { getPrograms as getCollegePrograms }
