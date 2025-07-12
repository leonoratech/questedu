import { CourseCategoryRepository } from '@/data/repository/course-category-repository'
import { CourseDifficultyRepository } from '@/data/repository/course-difficulty-repository'
import { requireAuth } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Require authentication for master data access
  const authResult = await requireAuth()(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  // Master data is accessible to all authenticated users
  const { user } = authResult

  try {
    const categoryRepo = new CourseCategoryRepository()
    const difficultyRepo = new CourseDifficultyRepository()

    const [categories, difficulties] = await Promise.all([
      categoryRepo.getActiveCategories(),
      difficultyRepo.getActiveDifficulties()
    ])

    return NextResponse.json({
      categories,
      difficulties
    })
  } catch (error) {
    console.error('Error fetching master data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch master data' },
      { status: 500 }
    )
  }
}
