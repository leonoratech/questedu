import { DepartmentRepository } from '@/data/repository/department-service'
import { requireAuth } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const departmentRepo = new DepartmentRepository()

const UpdateDepartmentSchema = z.object({
  name: z.enum(['Arts', 'Science', 'Vocational']).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
})

export async function PUT(
  req: NextRequest,
  { params }: any
) {
  const auth = await requireAuth()(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id } = params
  const body = await req.json()
  const parsed = UpdateDepartmentSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  await departmentRepo.updateDepartment(id, { ...parsed.data, updatedAt: new Date() })
  return NextResponse.json({ success: true })
}

export async function DELETE(
  req: NextRequest,
  { params }: any
) {
  const auth = await requireAuth()(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id } = params
  await departmentRepo.deleteDepartment(id)
  return NextResponse.json({ success: true })
}
