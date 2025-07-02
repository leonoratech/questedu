import { CollegeAdministratorRepository } from '@/data/repository/college-administrators-service'

/**
 * Check if a user is a college administrator or co-administrator for a specific college
 */
export async function isCollegeAdministrator(userId: string, collegeId: string): Promise<boolean> {
  try {
    console.log(`Checking college administrator status for userId: ${userId}, collegeId: ${collegeId}`)
    
    const collegeAdminRepo = new CollegeAdministratorRepository()
    const isAdmin = await collegeAdminRepo.checkUserAssignedAsAdmin(collegeId, userId)
    
    console.log(`College administrator check result: ${isAdmin}`)
    
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
    const collegeAdminRepo = new CollegeAdministratorRepository()
    return await collegeAdminRepo.getUserFirstAdminCollege(userId)
  } catch (error) {
    console.error('Error checking college administrator status:', error)
    return { isAdmin: false }
  }
}
