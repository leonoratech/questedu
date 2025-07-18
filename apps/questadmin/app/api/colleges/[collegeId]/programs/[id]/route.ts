import { ProgramRepository } from '@/data/repository/program-service'
import { requireAuth } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const programRepo = new ProgramRepository()

const UpdateProgramSchema = z.object({
  name: z.string().min(2).optional(),
  departmentId: z.string().optional(),
  years: z.number().min(1).optional(),
  description: z.string().optional(),
  medium: z.enum(['English', 'Telugu']).optional(),
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
  const parsed = UpdateProgramSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  await programRepo.updateProgram(id, { ...parsed.data, updatedAt: new Date() })
  return NextResponse.json({ success: true })
}

export async function DELETE(
  req: NextRequest,
  { params }: any
) {
  const auth = await requireAuth()(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id } = params
  await programRepo.deleteProgram(id)
  return NextResponse.json({ success: true })
}
