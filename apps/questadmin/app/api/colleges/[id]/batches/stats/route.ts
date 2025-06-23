import { isCollegeAdministrator } from '@/lib/college-admin-auth'
import { getCurrentUser } from '@/lib/server-auth'
import { collection, getDocs, query, where } from 'firebase/firestore'
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

// GET /api/colleges/[id]/batches/stats
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: collegeId } = await params

    // Check if user is a college administrator for this college
    const isAdmin = await isCollegeAdministrator(user.uid, collegeId)
    if (!isAdmin && user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get all active batches for this college
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
        ...data,
        status: currentStatus,
        currentStudentCount: data.currentStudentCount || 0
      }
    })

    // Calculate statistics with real-time status
    const stats = {
      totalBatches: batches.length,
      activeBatches: batches.filter(batch => batch.status === 'active').length,
      upcomingBatches: batches.filter(batch => batch.status === 'upcoming').length,
      completedBatches: batches.filter(batch => batch.status === 'completed').length,
      totalStudents: batches.reduce((sum, batch) => sum + (batch.currentStudentCount || 0), 0)
    }

    return NextResponse.json({ 
      success: true,
      stats
    })
  } catch (error) {
    console.error('Error fetching batch statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch batch statistics' },
      { status: 500 }
    )
  }
}
