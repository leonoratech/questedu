import { getAuthHeaders } from '@/data/config/firebase-auth'
import { Batch, BatchStats, CreateBatchRequest } from '@/data/models/batch'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  batches?: Batch[]
  batch?: Batch
  stats?: BatchStats
  error?: string
  message?: string
}

/**
 * Get all batches for a college
 */
export async function getCollegeBatches(collegeId: string): Promise<Batch[]> {
  try {
    const response = await fetch(`/api/colleges/${collegeId}/batches`, {
      headers: getAuthHeaders(),
    })
    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to fetch college batches:', data.error)
      return []
    }

    return data.batches || []
  } catch (error) {
    console.error('Error fetching college batches:', error)
    return []
  }
}

/**
 * Get batches by program ID
 */
export async function getProgramBatches(collegeId: string, programId: string): Promise<Batch[]> {
  try {
    const response = await fetch(`/api/colleges/${collegeId}/programs/${programId}/batches`, {
      headers: getAuthHeaders(),
    })
    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to fetch program batches:', data.error)
      return []
    }

    return data.batches || []
  } catch (error) {
    console.error('Error fetching program batches:', error)
    return []
  }
}

/**
 * Get batch by ID
 */
export async function getBatchById(collegeId: string, batchId: string): Promise<Batch | null> {
  try {
    const response = await fetch(`/api/colleges/${collegeId}/batches/${batchId}`, {
      headers: getAuthHeaders(),
    })
    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to fetch batch:', data.error)
      return null
    }

    return data.batch || null
  } catch (error) {
    console.error('Error fetching batch:', error)
    return null
  }
}

/**
 * Create a new batch
 */
export async function createBatch(
  collegeId: string,
  batchData: CreateBatchRequest
): Promise<Batch | null> {
  try {
    const response = await fetch(`/api/colleges/${collegeId}/batches`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(batchData),
    })
    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to create batch:', data.error)
      return null
    }

    return data.batch || null
  } catch (error) {
    console.error('Error creating batch:', error)
    return null
  }
}

/**
 * Update an existing batch
 */
export async function updateBatch(
  collegeId: string,
  batchId: string,
  updates: Partial<CreateBatchRequest & { status: string }>
): Promise<boolean> {
  try {
    const response = await fetch(`/api/colleges/${collegeId}/batches/${batchId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    })
    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to update batch:', data.error)
      return false
    }

    return data.success || false
  } catch (error) {
    console.error('Error updating batch:', error)
    return false
  }
}

/**
 * Delete a batch
 */
export async function deleteBatch(
  collegeId: string,
  batchId: string
): Promise<boolean> {
  try {
    const response = await fetch(`/api/colleges/${collegeId}/batches/${batchId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to delete batch:', data.error)
      return false
    }

    return data.success || false
  } catch (error) {
    console.error('Error deleting batch:', error)
    return false
  }
}

/**
 * Get batch statistics for a college
 */
export async function getBatchStats(collegeId: string): Promise<BatchStats | null> {
  try {
    const response = await fetch(`/api/colleges/${collegeId}/batches/stats`, {
      headers: getAuthHeaders(),
    })
    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to fetch batch stats:', data.error)
      return null
    }

    return data.stats || null
  } catch (error) {
    console.error('Error fetching batch stats:', error)
    return null
  }
}

/**
 * Get available instructors for batch assignment
 */
export async function getAvailableInstructors(collegeId: string): Promise<any[]> {
  try {
    const response = await fetch(`/api/colleges/${collegeId}/instructors`, {
      headers: getAuthHeaders(),
    })
    const data: ApiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Failed to fetch instructors:', data.error)
      return []
    }

    return data.data || []
  } catch (error) {
    console.error('Error fetching instructors:', error)
    return []
  }
}
