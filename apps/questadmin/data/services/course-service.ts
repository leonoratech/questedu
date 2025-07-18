import { Course } from '../models/course'

export async function getCourses(collegeId: string, programId?: string, subjectId?: string): Promise<Course[]> {
  let url = `/api/colleges/${collegeId}/courses`
  const params = []
  if (programId) params.push(`programId=${programId}`)
  if (subjectId) params.push(`subjectId=${subjectId}`)
  if (params.length) url += `?${params.join('&')}`
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to fetch courses')
  return await response.json()
}

export async function createCourse(collegeId: string, data: Omit<Course, 'id'>): Promise<Course> {
  const response = await fetch(`/api/colleges/${collegeId}/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) throw new Error('Failed to create course')
  return await response.json()
}

export async function updateCourse(collegeId: string, id: string, updates: Partial<Course>): Promise<void> {
  const response = await fetch(`/api/colleges/${collegeId}/courses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  })
  if (!response.ok) throw new Error('Failed to update course')
}

export async function deleteCourse(collegeId: string, id: string): Promise<void> {
  const response = await fetch(`/api/colleges/${collegeId}/courses/${id}`, {
    method: 'DELETE'
  })
  if (!response.ok) throw new Error('Failed to delete course')
}
