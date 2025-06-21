import { requireAuth, requireRole } from '@/lib/server-auth'
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, where } from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { serverDb, UserRole } from '../firebase-server'

// Helper function to get administrator counts for colleges
async function getAdministratorCounts(collegeIds: string[]) {
  if (collegeIds.length === 0) return {}
  
  const adminCounts: Record<string, { administratorCount: number; coAdministratorCount: number }> = {}
  
  // Initialize counts
  collegeIds.forEach(id => {
    adminCounts[id] = { administratorCount: 0, coAdministratorCount: 0 }
  })
  
  try {
    // Get all active administrators for these colleges
    const adminRef = collection(serverDb, 'collegeAdministrators')
    const adminQuery = query(
      adminRef,
      where('collegeId', 'in', collegeIds),
      where('isActive', '==', true)
    )
    
    const adminSnapshot = await getDocs(adminQuery)
    
    adminSnapshot.docs.forEach(doc => {
      const data = doc.data()
      const collegeId = data.collegeId
      const role = data.role
      
      if (adminCounts[collegeId]) {
        if (role === 'administrator') {
          adminCounts[collegeId].administratorCount++
        } else if (role === 'co_administrator') {
          adminCounts[collegeId].coAdministratorCount++
        }
      }
    })
  } catch (error) {
    console.error('Error fetching administrator counts:', error)
  }
  
  return adminCounts
}

export async function GET(request: NextRequest) {
  // Allow all authenticated users to view colleges for selection purposes
  const authResult = await requireAuth()(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  try {
    const url = new URL(request.url)
    const search = url.searchParams.get('search')
    
    const collegesRef = collection(serverDb, 'colleges')
    let collegesQuery = query(collegesRef, orderBy('name'))
    
    // If search term provided, filter by name (case-insensitive)
    if (search) {
      const searchTerm = search.toLowerCase()
      collegesQuery = query(
        collegesRef,
        orderBy('name'),
        where('name', '>=', searchTerm),
        where('name', '<=', searchTerm + '\uf8ff')
      )
    }
    
    const snapshot = await getDocs(collegesQuery)
    const colleges = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      }
    })
    
    // Get administrator counts for all colleges
    const collegeIds = colleges.map(college => college.id)
    const adminCounts = await getAdministratorCounts(collegeIds)
    
    // Add administrator counts to each college
    const collegesWithCounts = colleges.map(college => ({
      ...college,
      administratorCount: adminCounts[college.id]?.administratorCount || 0,
      coAdministratorCount: adminCounts[college.id]?.coAdministratorCount || 0
    }))
    
    // Filter colleges by search term if provided
    const filteredColleges = search 
      ? collegesWithCounts.filter(college => {
          const collegeName = (college as any).name;
          return collegeName && collegeName.toString().toLowerCase().includes(search.toLowerCase());
        })
      : collegesWithCounts
    
    return NextResponse.json({ 
      success: true,
      colleges: filteredColleges
    })
  } catch (error) {
    console.error('Error fetching colleges:', error)
    return NextResponse.json(
      { error: 'Failed to fetch colleges' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Require superadmin role for college management
  const authResult = await requireRole(UserRole.SUPERADMIN)(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  try {
    const body = await request.json()
    const { user } = authResult
    
    const collegeData = {
      ...body,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: user.uid
    }
    
    const collegesRef = collection(serverDb, 'colleges')
    const docRef = await addDoc(collegesRef, collegeData)
    
    return NextResponse.json({
      success: true,
      college: {
        id: docRef.id,
        ...collegeData,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
  } catch (error) {
    console.error('Error creating college:', error)
    return NextResponse.json(
      { error: 'Failed to create college' },
      { status: 500 }
    )
  }
}
