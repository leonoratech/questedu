import { DepartmentRepository } from '@/data/repository/department-service'
import { requireAuth } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const departmentRepo = new DepartmentRepository()

const DepartmentSchema = z.object({
  name: z.string().min(2),
  collegeId: z.string(),
  description: z.string().optional(),
})

export async function GET(
  req: NextRequest,
  { params }: any
) {
  const { collegeId } = params
  const departments = await departmentRepo.getDepartments(collegeId)
  return NextResponse.json(departments)
}

export async function POST(
  req: NextRequest,
  { params }: any
) {
  const auth = await requireAuth()(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { collegeId } = params
  const body = await req.json()
  const parsed = DepartmentSchema.safeParse({ ...body, collegeId })
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const department = await departmentRepo.createDepartment({ ...parsed.data, isActive: true, createdAt: new Date(), updatedAt: new Date(), createdBy: auth.user.uid })
  return NextResponse.json(department)
}
