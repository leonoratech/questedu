interface BaseEntity {
  id?: string
}

class BaseService<T extends BaseEntity> {
  protected baseUrl: string

  constructor(endpoint: string) {
    this.baseUrl = `/api/${endpoint}`
  }

  async getAll(): Promise<T[]> {
    const response = await fetch(this.baseUrl, {
      method: 'GET',
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch data')
    }

    return response.json()
  }

  async getById(id: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'GET',
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch data')
    }

    return response.json()
  }

  async create(data: Omit<T, 'id'>): Promise<T> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create data')
    }

    return response.json()
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update data')
    }

    return response.json()
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to delete data')
    }
  }
}

export { BaseService }
