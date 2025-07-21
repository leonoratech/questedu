import { Subject } from '@/data/models/subject'

export class SubjectService {
  private baseUrl = '/api/subjects'

  async getSubjects(params?: {
    programId?: string
    instructorId?: string
    year?: string
  }): Promise<Subject[]> {
    try {
      const url = new URL(this.baseUrl, window.location.origin)
      if (params?.programId) {
        url.searchParams.set('programId', params.programId)
      }
      if (params?.instructorId) {
        url.searchParams.set('instructorId', params.instructorId)
      }
      if (params?.year) {
        url.searchParams.set('year', params.year)
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch subjects')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching subjects:', error)
      throw error
    }
  }

  async getSubject(id: string): Promise<Subject> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch subject')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching subject:', error)
      throw error
    }
  }

  async createSubject(subject: Omit<Subject, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isActive'>): Promise<Subject> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(subject),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create subject')
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating subject:', error)
      throw error
    }
  }

  async updateSubject(id: string, subject: Partial<Subject>): Promise<Subject> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(subject),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update subject')
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating subject:', error)
      throw error
    }
  }

  async deleteSubject(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete subject')
      }
    } catch (error) {
      console.error('Error deleting subject:', error)
      throw error
    }
  }
}

export const subjectService = new SubjectService()
