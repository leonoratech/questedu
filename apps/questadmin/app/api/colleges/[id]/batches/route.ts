import { isCollegeAdministrator } from '@/lib/college-admin-auth'
import { requireAuth } from '@/lib/server-auth'
import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { serverDb } from '../../../firebase-server'

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
  
  // Check if dates are not too far in the past (allow some flexibility for data entry)
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  
  if (end < oneYearAgo) {
    return { isValid: false, error: 'Batch end date cannot be more than one year in the past' }
  }
  
  return { isValid: true }
}

// GET /api/colleges/[id]/batches - Get all batches for a college
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth()(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  try {
    const { id: collegeId } = await params
    const { user } = authResult

    // Check if user is a college administrator for this college or superadmin
    if (user.role !== 'superadmin') {
      const isAdmin = await isCollegeAdministrator(user.uid, collegeId)
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'Only college administrators can view batches' },
          { status: 403 }
        )
      }
    }

    // Get all batches for this college
    const batchesRef = collection(serverDb, 'batches')
    const batchesQuery = query(
      batchesRef,
      where('collegeId', '==', collegeId),
      where('isActive', '==', true)
    )
    
    const snapshot = await getDocs(batchesQuery)
    const batches = snapshot.docs.map(doc => {
      const data = doc.data()
      const startDate = data.startDate?.toDate?.() || data.startDate
      const endDate = data.endDate?.toDate?.() || data.endDate
      
      // Calculate current status based on dates
      const currentStatus = calculateBatchStatus(new Date(startDate), new Date(endDate))
      
      return {
        id: doc.id,
        ...data,
        startDate,
        endDate,
        status: currentStatus, // Use calculated status instead of stored status
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      }
    })

    // Sort batches by start date (most recent first)
    batches.sort((a, b) => {
      const dateA = new Date(a.startDate)
      const dateB = new Date(b.startDate)
      return dateB.getTime() - dateA.getTime()
    })

    return NextResponse.json({ 
      success: true,
      batches
    })
  } catch (error) {
    console.error('Error fetching college batches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch college batches' },
      { status: 500 }
    )
  }
}

// POST /api/colleges/[id]/batches - Create a new batch
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth()(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  try {
    const { id: collegeId } = await params
    const { user } = authResult
    const { name, programId, startDate, endDate, ownerId, description, maxStudents } = await request.json()

    // Validate required fields
    if (!name || !programId || !startDate || !endDate || !ownerId) {
      return NextResponse.json(
        { error: 'Name, program, start date, end date, and owner are required' },
        { status: 400 }
      )
    }

    // Validate batch name length
    if (name.length < 3 || name.length > 100) {
      return NextResponse.json(
        { error: 'Batch name must be between 3 and 100 characters' },
        { status: 400 }
      )
    }

    // Validate dates
    const dateValidation = validateBatchDates(startDate, endDate)
    if (!dateValidation.isValid) {
      return NextResponse.json(
        { error: dateValidation.error },
        { status: 400 }
      )
    }

    // Validate max students if provided
    if (maxStudents && (isNaN(Number(maxStudents)) || Number(maxStudents) < 1 || Number(maxStudents) > 1000)) {
      return NextResponse.json(
        { error: 'Maximum students must be a number between 1 and 1000' },
        { status: 400 }
      )
    }

    // Check if user is a college administrator for this college or superadmin
    if (user.role !== 'superadmin') {
      const isAdmin = await isCollegeAdministrator(user.uid, collegeId)
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'Only college administrators can create batches' },
          { status: 403 }
        )
      }
    }

    // Parse dates after validation
    const start = new Date(startDate)
    const end = new Date(endDate)

    // Determine batch status based on dates
    const status = calculateBatchStatus(start, end)

    // Create batch
    const batchData = {
      name,
      programId,
      collegeId,
      startDate: start,
      endDate: end,
      ownerId,
      description: description || '',
      maxStudents: maxStudents ? Number(maxStudents) : null,
      status,
      currentStudentCount: 0,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: user.uid
    }

    const docRef = await addDoc(collection(serverDb, 'batches'), batchData)

    return NextResponse.json({
      success: true,
      batch: {
        id: docRef.id,
        ...batchData,
        startDate: start,
        endDate: end,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
  } catch (error) {
    console.error('Error creating batch:', error)
    return NextResponse.json(
      { error: 'Failed to create batch' },
      { status: 500 }
    )
  }
}
