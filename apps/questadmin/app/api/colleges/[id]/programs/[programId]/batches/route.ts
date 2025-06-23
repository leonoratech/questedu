import { isCollegeAdministrator } from '@/lib/college-admin-auth'
import { getCurrentUser } from '@/lib/server-auth'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { serverDb } from '../../../../../firebase-server'

// GET /api/colleges/[id]/programs/[programId]/batches
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; programId: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: collegeId, programId } = await params

    // Check if user is a college administrator for this college
    const isAdmin = await isCollegeAdministrator(user.uid, collegeId)
    if (!isAdmin && user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get all batches for this program
    const batchesRef = collection(serverDb, 'batches')
    const batchesQuery = query(
      batchesRef,
      where('collegeId', '==', collegeId),
      where('programId', '==', programId),
      where('isActive', '==', true)
    )
    
    const snapshot = await getDocs(batchesQuery)
    const batches = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        startDate: data.startDate?.toDate?.() || data.startDate,
        endDate: data.endDate?.toDate?.() || data.endDate,
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
    console.error('Error fetching program batches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch program batches' },
      { status: 500 }
    )
  }
}
