import { serverDb } from '@/app/api/firebase-server'
import { collection, getDocs, query, where } from 'firebase/firestore'

/**
 * Check if a user is a college administrator or co-administrator for a specific college
 */
export async function isCollegeAdministrator(userId: string, collegeId: string): Promise<boolean> {
  try {
    console.log(`Checking college administrator status for userId: ${userId}, collegeId: ${collegeId}`)
    
    const adminRef = collection(serverDb, 'collegeAdministrators')
    const adminQuery = query(
      adminRef,
      where('instructorId', '==', userId),
      where('collegeId', '==', collegeId),
      where('isActive', '==', true)
    )
    
    const adminSnapshot = await getDocs(adminQuery)
    const isAdmin = !adminSnapshot.empty
    
    console.log(`College administrator check result: ${isAdmin}`)
    if (isAdmin) {
      const adminData = adminSnapshot.docs[0].data()
      console.log(`Administrator data:`, { 
        id: adminSnapshot.docs[0].id,
        instructorId: adminData.instructorId,
        collegeId: adminData.collegeId,
        isActive: adminData.isActive,
        role: adminData.role 
      })
    }
    
    return isAdmin
  } catch (error) {
    console.error('Error checking college administrator status:', error)
    return false
  }
}

/**
 * Check if a user is a college administrator or co-administrator for any college
 */
export async function isAnyCollegeAdministrator(userId: string): Promise<{ isAdmin: boolean; collegeId?: string }> {
  try {
    const adminRef = collection(serverDb, 'collegeAdministrators')
    const adminQuery = query(
      adminRef,
      where('instructorId', '==', userId),
      where('isActive', '==', true)
    )
    
    const adminSnapshot = await getDocs(adminQuery)
    if (adminSnapshot.empty) {
      return { isAdmin: false }
    }
    
    // Return the first college they're an admin of
    const firstAdmin = adminSnapshot.docs[0].data()
    return { isAdmin: true, collegeId: firstAdmin.collegeId }
  } catch (error) {
    console.error('Error checking college administrator status:', error)
    return { isAdmin: false }
  }
}
