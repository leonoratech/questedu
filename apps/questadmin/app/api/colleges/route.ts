import { requireAuth, requireRole } from '@/lib/server-auth'
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, where } from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { serverDb, UserRole } from '../firebase-server'

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
    
    return NextResponse.json({ 
      success: true,
      colleges: colleges.filter(college => 
        search ? college.name.toLowerCase().includes(search.toLowerCase()) : true
      )
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
