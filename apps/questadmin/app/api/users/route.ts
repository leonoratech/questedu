import { requireRole } from '@/lib/server-auth'
import {
    collection,
    limit as firestoreLimit,
    getCountFromServer,
    getDocs,
    orderBy,
    query,
    QueryConstraint,
    where
} from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { serverDb, UserRole } from '../firebase-server'

export async function GET(request: NextRequest) {
  // Require admin role for user management
  const authResult = await requireRole(UserRole.ADMIN)(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }
  try {
    const url = new URL(request.url)
    const role = url.searchParams.get('role') as UserRole | null
    const search = url.searchParams.get('search')
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100) // Cap at 100
    const stats = url.searchParams.get('stats') === 'true'
    
    // Validate role parameter
    if (role && !Object.values(UserRole).includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role parameter' },
        { status: 400 }
      )
    }
    
    if (stats) {
      // Return user statistics
      const usersRef = collection(serverDb, 'users')
      
      const totalQuery = query(usersRef)
      const totalSnapshot = await getCountFromServer(totalQuery)
      
      const adminQuery = query(usersRef, where('role', '==', UserRole.ADMIN))
      const adminSnapshot = await getCountFromServer(adminQuery)
      
      const instructorQuery = query(usersRef, where('role', '==', UserRole.INSTRUCTOR))
      const instructorSnapshot = await getCountFromServer(instructorQuery)
      
      const studentQuery = query(usersRef, where('role', '==', UserRole.STUDENT))
      const studentSnapshot = await getCountFromServer(studentQuery)

      // Get active users (isActive = true)
      const activeQuery = query(usersRef, where('isActive', '==', true))
      const activeSnapshot = await getCountFromServer(activeQuery)

      // Get users created this month
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const newUsersQuery = query(usersRef, where('createdAt', '>=', startOfMonth))
      const newUsersSnapshot = await getCountFromServer(newUsersQuery)

      return NextResponse.json({
        success: true,
        stats: {
          total: totalSnapshot.data().count,
          admins: adminSnapshot.data().count,
          instructors: instructorSnapshot.data().count,
          students: studentSnapshot.data().count,
          active: activeSnapshot.data().count,
          newThisMonth: newUsersSnapshot.data().count
        }
      })
    }
    
    let constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')]
    
    if (role) {
      constraints.unshift(where('role', '==', role))
    }
    
    if (search) {
      // Note: This is a simple search implementation
      // For better search, consider using a search service
      constraints.unshift(where('email', '>=', search))
      constraints.unshift(where('email', '<=', search + '\uf8ff'))
    }
    
    if (limit) {
      constraints.push(firestoreLimit(limit))
    }
    
    const usersQuery = query(collection(serverDb, 'users'), ...constraints)
    const snapshot = await getDocs(usersQuery)
    
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json({
      success: true,
      users
    })

  } catch (error: any) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'An error occurred fetching users' },
      { status: 500 }
    )
  }
}
