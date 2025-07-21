import { Program } from '@/data/models/program'

export class ProgramService {
  private baseUrl = '/api/programs'

  async getPrograms(departmentId?: string): Promise<Program[]> {
    try {
      const url = new URL(this.baseUrl, window.location.origin)
      if (departmentId) {
        url.searchParams.set('departmentId', departmentId)
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
        throw new Error(error.message || 'Failed to fetch programs')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching programs:', error)
      throw error
    }
  }

  async getProgram(id: string): Promise<Program> {
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
        throw new Error(error.message || 'Failed to fetch program')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching program:', error)
      throw error
    }
  }

  async createProgram(program: Omit<Program, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isActive'>): Promise<Program> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(program),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create program')
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating program:', error)
      throw error
    }
  }

  async updateProgram(id: string, program: Partial<Program>): Promise<Program> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(program),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update program')
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating program:', error)
      throw error
    }
  }

  async deleteProgram(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete program')
      }
    } catch (error) {
      console.error('Error deleting program:', error)
      throw error
    }
  }
}

export const programService = new ProgramService()
