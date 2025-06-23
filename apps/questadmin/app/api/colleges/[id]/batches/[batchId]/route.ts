import { isCollegeAdministrator } from '@/lib/college-admin-auth'
import { getCurrentUser } from '@/lib/server-auth'
import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { serverDb } from '../../../../firebase-server'

// Utility function to calculate batch status
function calculateBatchStatus(startDate: Date, endDate: Date): string {
  const now = new Date()
  
  if (endDate <= now) {
    return 'completed'
  } else if (startDate <= now && endDate > now) {
    return 'active'
  } else {
    return 'upcoming'
  }
}

// Utility function to validate dates
function validateBatchDates(startDate: string, endDate: string): { isValid: boolean; error?: string } {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  // Check if dates are valid
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { isValid: false, error: 'Invalid date format' }
  }
  
  // Check if start date is before end date
  if (start >= end) {
    return { isValid: false, error: 'End date must be after start date' }
  }
  
  // Check if dates are not too far in the past
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  
  if (end < oneYearAgo) {
    return { isValid: false, error: 'Batch end date cannot be more than one year in the past' }
  }
  
  return { isValid: true }
}

// GET /api/colleges/[id]/batches/[batchId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; batchId: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: collegeId, batchId } = await params

    // Check if user is a college administrator for this college
    const isAdmin = await isCollegeAdministrator(user.uid, collegeId)
    if (!isAdmin && user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const batchRef = doc(serverDb, 'batches', batchId)
    const batchDoc = await getDoc(batchRef)

    if (!batchDoc.exists()) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
    }

    const batchData = batchDoc.data()
    
    // Verify batch belongs to the college
    if (batchData.collegeId !== collegeId) {
      return NextResponse.json({ error: 'Batch does not belong to this college' }, { status: 400 })
    }

    const startDate = batchData.startDate?.toDate?.() || batchData.startDate
    const endDate = batchData.endDate?.toDate?.() || batchData.endDate
    
    // Calculate current status based on dates
    const currentStatus = calculateBatchStatus(new Date(startDate), new Date(endDate))

    const batch = {
      id: batchDoc.id,
      ...batchData,
      startDate,
      endDate,
      status: currentStatus, // Use calculated status
      createdAt: batchData.createdAt?.toDate?.() || batchData.createdAt,
      updatedAt: batchData.updatedAt?.toDate?.() || batchData.updatedAt,
    }

    return NextResponse.json({ success: true, batch })

  } catch (error) {
    console.error('Error fetching batch:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/colleges/[id]/batches/[batchId]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; batchId: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: collegeId, batchId } = await params
    const updates = await request.json()

    // Check if user is a college administrator for this college
    const isAdmin = await isCollegeAdministrator(user.uid, collegeId)
    if (!isAdmin && user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const batchRef = doc(serverDb, 'batches', batchId)
    const batchDoc = await getDoc(batchRef)

    if (!batchDoc.exists()) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
    }

    const batchData = batchDoc.data()
    
    // Verify batch belongs to the college
    if (batchData.collegeId !== collegeId) {
      return NextResponse.json({ error: 'Batch does not belong to this college' }, { status: 400 })
    }

    // Validate dates if being updated
    if (updates.startDate || updates.endDate) {
      const currentStart = batchData.startDate?.toDate?.() || batchData.startDate
      const currentEnd = batchData.endDate?.toDate?.() || batchData.endDate
      
      const newStartDate = updates.startDate || currentStart.toISOString().split('T')[0]
      const newEndDate = updates.endDate || currentEnd.toISOString().split('T')[0]
      
      const dateValidation = validateBatchDates(newStartDate, newEndDate)
      if (!dateValidation.isValid) {
        return NextResponse.json(
          { error: dateValidation.error },
          { status: 400 }
        )
      }
      
      if (updates.startDate) {
        updates.startDate = new Date(updates.startDate)
      }
      if (updates.endDate) {
        updates.endDate = new Date(updates.endDate)
      }
    }

    // Validate batch name if being updated
    if (updates.name && (updates.name.length < 3 || updates.name.length > 100)) {
      return NextResponse.json(
        { error: 'Batch name must be between 3 and 100 characters' },
        { status: 400 }
      )
    }

    // Validate max students if being updated
    if (updates.maxStudents && (isNaN(Number(updates.maxStudents)) || Number(updates.maxStudents) < 1 || Number(updates.maxStudents) > 1000)) {
      return NextResponse.json(
        { error: 'Maximum students must be a number between 1 and 1000' },
        { status: 400 }
      )
    }

    // Calculate new status if dates are being updated
    if (updates.startDate || updates.endDate) {
      const finalStartDate = updates.startDate || (batchData.startDate?.toDate?.() || batchData.startDate)
      const finalEndDate = updates.endDate || (batchData.endDate?.toDate?.() || batchData.endDate)
      updates.status = calculateBatchStatus(new Date(finalStartDate), new Date(finalEndDate))
    }

    // Update the batch
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    }

    // Convert maxStudents to number if provided
    if (updateData.maxStudents) {
      updateData.maxStudents = Number(updateData.maxStudents)
    }

    await updateDoc(batchRef, updateData)

    return NextResponse.json({
      success: true,
      message: 'Batch updated successfully'
    })

  } catch (error) {
    console.error('Error updating batch:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/colleges/[id]/batches/[batchId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; batchId: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: collegeId, batchId } = await params

    // Check if user is a college administrator for this college
    const isAdmin = await isCollegeAdministrator(user.uid, collegeId)
    if (!isAdmin && user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const batchRef = doc(serverDb, 'batches', batchId)
    const batchDoc = await getDoc(batchRef)

    if (!batchDoc.exists()) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
    }

    const batchData = batchDoc.data()
    
    // Verify batch belongs to the college
    if (batchData.collegeId !== collegeId) {
      return NextResponse.json({ error: 'Batch does not belong to this college' }, { status: 400 })
    }

    // Soft delete by setting isActive to false
    await updateDoc(batchRef, {
      isActive: false,
      updatedAt: serverTimestamp()
    })

    return NextResponse.json({
      success: true,
      message: 'Batch deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting batch:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
