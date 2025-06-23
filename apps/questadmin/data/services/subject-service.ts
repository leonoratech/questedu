import { serverDb as db } from '@/app/api/firebase-server'
import { CreateSubjectRequest, InstructorOption, Subject, UpdateSubjectRequest } from '@/data/models/subject'
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
    writeBatch
} from 'firebase/firestore'

const SUBJECTS_COLLECTION = 'subjects'
const USERS_COLLECTION = 'users'

/**
 * Get all subjects for a specific program
 */
export async function getSubjectsByProgram(programId: string): Promise<Subject[]> {
  try {
    // Use a simpler query while indexes are building, then sort client-side
    const q = query(
      collection(db, SUBJECTS_COLLECTION),
      where('programId', '==', programId),
      where('isActive', '==', true)
    )
    
    const querySnapshot = await getDocs(q)
    const subjects: Subject[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      subjects.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Subject)
    })
    
    // Sort client-side to avoid requiring complex index while indexes are building
    return subjects.sort((a, b) => {
      // First sort by yearOrSemester
      if (a.yearOrSemester !== b.yearOrSemester) {
        return a.yearOrSemester - b.yearOrSemester
      }
      // Then sort by name
      return a.name.localeCompare(b.name)
    })
  } catch (error) {
    console.error('Error fetching subjects by program:', error)
    throw new Error('Failed to fetch subjects')
  }
}

/**
 * Get all subjects for a specific college
 */
export async function getSubjectsByCollege(collegeId: string): Promise<Subject[]> {
  try {
    // Use a simpler query while indexes are building, then sort client-side
    const q = query(
      collection(db, SUBJECTS_COLLECTION),
      where('collegeId', '==', collegeId),
      where('isActive', '==', true)
    )
    
    const querySnapshot = await getDocs(q)
    const subjects: Subject[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      subjects.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Subject)
    })
    
    // Sort client-side to avoid requiring complex index while indexes are building
    return subjects.sort((a, b) => {
      // First sort by yearOrSemester
      if (a.yearOrSemester !== b.yearOrSemester) {
        return a.yearOrSemester - b.yearOrSemester
      }
      // Then sort by name
      return a.name.localeCompare(b.name)
    })
  } catch (error) {
    console.error('Error fetching subjects by college:', error)
    throw new Error('Failed to fetch subjects')
  }
}

/**
 * Get a specific subject by ID
 */
export async function getSubjectById(subjectId: string): Promise<Subject | null> {
  try {
    const docRef = doc(db, SUBJECTS_COLLECTION, subjectId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Subject
    }
    
    return null
  } catch (error) {
    console.error('Error fetching subject by ID:', error)
    throw new Error('Failed to fetch subject')
  }
}

/**
 * Create a new subject
 */
export async function createSubject(
  request: CreateSubjectRequest, 
  programId: string, 
  collegeId: string, 
  createdBy: string
): Promise<string> {
  try {
    // Get instructor name for caching
    const instructorName = await getInstructorName(request.instructorId)
    
    const subjectData = {
      ...request,
      programId,
      collegeId,
      instructorName,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy
    }
    
    const docRef = await addDoc(collection(db, SUBJECTS_COLLECTION), subjectData)
    return docRef.id
  } catch (error) {
    console.error('Error creating subject:', error)
    throw new Error('Failed to create subject')
  }
}

/**
 * Update an existing subject
 */
export async function updateSubject(request: UpdateSubjectRequest, updatedBy: string): Promise<void> {
  try {
    const { id, ...updateData } = request
    
    // Get instructor name if instructorId is being updated
    let instructorName: string | undefined
    if (updateData.instructorId) {
      instructorName = await getInstructorName(updateData.instructorId)
    }
    
    const docRef = doc(db, SUBJECTS_COLLECTION, id)
    await updateDoc(docRef, {
      ...updateData,
      ...(instructorName && { instructorName }),
      updatedAt: serverTimestamp(),
      updatedBy
    })
  } catch (error) {
    console.error('Error updating subject:', error)
    throw new Error('Failed to update subject')
  }
}

/**
 * Delete a subject (soft delete by setting isActive to false)
 */
export async function deleteSubject(subjectId: string, deletedBy: string): Promise<void> {
  try {
    const docRef = doc(db, SUBJECTS_COLLECTION, subjectId)
    await updateDoc(docRef, {
      isActive: false,
      updatedAt: serverTimestamp(),
      deletedBy,
      deletedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error deleting subject:', error)
    throw new Error('Failed to delete subject')
  }
}

/**
 * Get available instructors for a college (for subject assignment)
 */
export async function getAvailableInstructors(collegeId: string): Promise<InstructorOption[]> {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('role', '==', 'instructor'),
      where('collegeId', '==', collegeId),
      orderBy('firstName', 'asc')
    )
    
    const querySnapshot = await getDocs(q)
    const instructors: InstructorOption[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      instructors.push({
        id: doc.id,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        department: data.department
      })
    })
    
    return instructors
  } catch (error) {
    console.error('Error fetching available instructors:', error)
    throw new Error('Failed to fetch instructors')
  }
}

/**
 * Get instructor name by ID (for caching)
 */
export async function getInstructorName(instructorId: string): Promise<string> {
  try {
    const docRef = doc(db, USERS_COLLECTION, instructorId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      return `${data.firstName} ${data.lastName}`
    }
    
    return 'Unknown Instructor'
  } catch (error) {
    console.error('Error fetching instructor name:', error)
    return 'Unknown Instructor'
  }
}

/**
 * Bulk update subjects for a program (useful for reordering or mass updates)
 */
export async function bulkUpdateSubjects(subjects: UpdateSubjectRequest[], updatedBy: string): Promise<void> {
  try {
    const batch = writeBatch(db)
    
    for (const subject of subjects) {
      const { id, ...updateData } = subject
      const docRef = doc(db, SUBJECTS_COLLECTION, id)
      
      batch.update(docRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
        updatedBy
      })
    }
    
    await batch.commit()
  } catch (error) {
    console.error('Error bulk updating subjects:', error)
    throw new Error('Failed to update subjects')
  }
}

/**
 * Get subjects count by program
 */
export async function getSubjectsCountByProgram(programId: string): Promise<number> {
  try {
    const q = query(
      collection(db, SUBJECTS_COLLECTION),
      where('programId', '==', programId),
      where('isActive', '==', true)
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.size
  } catch (error) {
    console.error('Error getting subjects count:', error)
    return 0
  }
}

/**
 * Check if an instructor is assigned to any subject in a program
 */
export async function isInstructorAssignedToProgram(instructorId: string, programId: string): Promise<boolean> {
  try {
    const q = query(
      collection(db, SUBJECTS_COLLECTION),
      where('programId', '==', programId),
      where('instructorId', '==', instructorId),
      where('isActive', '==', true)
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.size > 0
  } catch (error) {
    console.error('Error checking instructor assignment:', error)
    return false
  }
}
