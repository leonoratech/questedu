import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch
} from 'firebase/firestore'
import { serverDb } from '../../app/api/firebase-server'

/**
 * Comprehensive course deletion service that removes all related data
 */
export async function deleteCourseWithCascade(courseId: string): Promise<{
  success: boolean
  error?: string
  deletedItems?: {
    course: boolean
    topics: number
    questions: number
    enrollments: number
  }
}> {
  try {
    const deletedItems = {
      course: false,
      topics: 0,
      questions: 0,
      enrollments: 0
    }

    // Use batched writes for consistency
    const batch = writeBatch(serverDb)

    // 1. Check if course exists
    const courseRef = doc(serverDb, 'courses', courseId)
    const courseSnap = await getDoc(courseRef)
    
    if (!courseSnap.exists()) {
      return {
        success: false,
        error: 'Course not found'
      }
    }

    // 2. Delete all course topics
    try {
      const topicsQuery = query(
        collection(serverDb, 'courseTopics'),
        where('courseId', '==', courseId)
      )
      const topicsSnapshot = await getDocs(topicsQuery)
      
      topicsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref)
        deletedItems.topics++
      })
    } catch (error) {
      console.error('Error deleting course topics:', error)
    }

    // 3. Delete all course questions and their answers
    try {
      const questionsQuery = query(
        collection(serverDb, 'courseQuestions'),
        where('courseId', '==', courseId)
      )
      const questionsSnapshot = await getDocs(questionsQuery)
      
      questionsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref)
        deletedItems.questions++
      })

      // Delete question answers if they exist in a separate collection
      const answersQuery = query(
        collection(serverDb, 'question_answers'),
        where('courseId', '==', courseId)
      )
      const answersSnapshot = await getDocs(answersQuery)
      
      answersSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref)
      })
    } catch (error) {
      console.error('Error deleting course questions:', error)
    }

    // 4. Delete any course enrollments/registrations
    try {
      const enrollmentsQuery = query(
        collection(serverDb, 'enrollments'),
        where('courseId', '==', courseId)
      )
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery)
      
      enrollmentsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref)
        deletedItems.enrollments++
      })
    } catch (error) {
      console.error('Error deleting course enrollments:', error)
    }

    // 5. Delete any course assignments
    try {
      const assignmentsQuery = query(
        collection(serverDb, 'assignments'),
        where('courseId', '==', courseId)
      )
      const assignmentsSnapshot = await getDocs(assignmentsQuery)
      
      assignmentsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref)
      })
    } catch (error) {
      console.error('Error deleting course assignments:', error)
    }

    // 6. Delete any course materials
    try {
      const materialsQuery = query(
        collection(serverDb, 'course_materials'),
        where('courseId', '==', courseId)
      )
      const materialsSnapshot = await getDocs(materialsQuery)
      
      materialsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref)
      })
    } catch (error) {
      console.error('Error deleting course materials:', error)
    }

    // 7. Delete any course progress records
    try {
      const progressQuery = query(
        collection(serverDb, 'student_progress'),
        where('courseId', '==', courseId)
      )
      const progressSnapshot = await getDocs(progressQuery)
      
      progressSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref)
      })
    } catch (error) {
      console.error('Error deleting course progress:', error)
    }

    // 8. Finally, delete the course itself
    batch.delete(courseRef)
    deletedItems.course = true

    // Commit all deletions
    await batch.commit()

    return {
      success: true,
      deletedItems
    }

  } catch (error) {
    console.error('Error in cascading course deletion:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Get a count of all related items that would be deleted
 */
export async function getCourseRelatedItemsCounts(courseId: string): Promise<{
  topics: number
  questions: number
  enrollments: number
  assignments: number
  materials: number
  progressRecords: number
}> {
  const counts = {
    topics: 0,
    questions: 0,
    enrollments: 0,
    assignments: 0,
    materials: 0,
    progressRecords: 0
  }

  try {
    // Count topics
    const topicsQuery = query(
      collection(serverDb, 'courseTopics'),
      where('courseId', '==', courseId)
    )
    const topicsSnapshot = await getDocs(topicsQuery)
    counts.topics = topicsSnapshot.size

    // Count questions
    const questionsQuery = query(
      collection(serverDb, 'courseQuestions'),
      where('courseId', '==', courseId)
    )
    const questionsSnapshot = await getDocs(questionsQuery)
    counts.questions = questionsSnapshot.size

    // Count enrollments
    const enrollmentsQuery = query(
      collection(serverDb, 'enrollments'),
      where('courseId', '==', courseId)
    )
    const enrollmentsSnapshot = await getDocs(enrollmentsQuery)
    counts.enrollments = enrollmentsSnapshot.size

    // Count assignments
    const assignmentsQuery = query(
      collection(serverDb, 'assignments'),
      where('courseId', '==', courseId)
    )
    const assignmentsSnapshot = await getDocs(assignmentsQuery)
    counts.assignments = assignmentsSnapshot.size

    // Count materials
    const materialsQuery = query(
      collection(serverDb, 'course_materials'),
      where('courseId', '==', courseId)
    )
    const materialsSnapshot = await getDocs(materialsQuery)
    counts.materials = materialsSnapshot.size

    // Count progress records
    const progressQuery = query(
      collection(serverDb, 'student_progress'),
      where('courseId', '==', courseId)
    )
    const progressSnapshot = await getDocs(progressQuery)
    counts.progressRecords = progressSnapshot.size

  } catch (error) {
    console.error('Error counting related items:', error)
  }

  return counts
}
