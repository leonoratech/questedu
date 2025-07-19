import { DepartmentRepository } from '@/data/repository/department-service'
import { NextResponse } from 'next/server'

const departmentRepo = new DepartmentRepository()

export async function GET(req: Request, { params }: any) {
  const { collegeId } = params
  const departments = await departmentRepo.getDepartments(collegeId)
  return NextResponse.json(departments)
}
