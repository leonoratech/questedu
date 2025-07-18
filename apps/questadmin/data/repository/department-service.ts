import { Department } from '../models/department'
import { adminDb } from './firebase-admin'

const DEPARTMENT_COLLECTION = 'departments'

export class DepartmentRepository {
  async getDepartments(collegeId: string): Promise<Department[]> {
    const snapshot = await adminDb.collection(DEPARTMENT_COLLECTION)
      .where('collegeId', '==', collegeId)
      .where('isActive', '==', true)
      .get()
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Department))
  }

  async createDepartment(data: Omit<Department, 'id'>): Promise<Department> {
    const ref = await adminDb.collection(DEPARTMENT_COLLECTION).add(data)
    return { id: ref.id, ...data }
  }

  async updateDepartment(id: string, updates: Partial<Department>): Promise<void> {
    await adminDb.collection(DEPARTMENT_COLLECTION).doc(id).update(updates)
  }

  async deleteDepartment(id: string): Promise<void> {
    await adminDb.collection(DEPARTMENT_COLLECTION).doc(id).delete()
  }
}
