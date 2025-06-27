import { College } from '@/data/models/college'
import { UserRole } from '@/data/models/user-model'
import { CollegeAdministratorRepository } from '@/data/repository/college-administrators-service'
import { CollegeRepository } from '@/data/repository/college-service'
import { requireAuth, requireRole } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Allow all authenticated users to view colleges for selection purposes
  const authResult = await requireAuth()(request)

  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  try {
    const url = new URL(request.url)
    const search = url.searchParams.get('search')

    // Fetch colleges from the database
    const collegesRepo = new CollegeRepository()
    const colleges = await collegesRepo.searchColleges(search);

    colleges.forEach((college: any) => {
      college.createdAt = college.createdAt?.toDate?.() || college.createdAt
      college.updatedAt = college.updatedAt?.toDate?.() || college.updatedAt
    })

    // Get administrator counts for all colleges
    const collegeIds = colleges.map((college: any) => college.id);
    const collegeAdminRepo = new CollegeAdministratorRepository();
    // Fetch administrator counts for each college
    const adminCounts = await collegeAdminRepo.getAdministratorCounts(collegeIds);

    // Add administrator counts to each college
    const collegesWithCounts = colleges.map((college: any) => ({
      ...college,
      administratorCount: adminCounts[college.id]?.administratorCount || 0,
      coAdministratorCount: adminCounts[college.id]?.coAdministratorCount || 0
    }))

    // Filter colleges by search term if provided
    const filteredColleges = search
      ? collegesWithCounts.filter(college => {
        const collegeName = (college as any).name;
        return collegeName && collegeName.toString().toLowerCase().includes(search.toLowerCase());
      })
      : collegesWithCounts

    return NextResponse.json({
      success: true,
      colleges: filteredColleges
    })
  } catch (error) {
    console.error('Error fetching colleges:', error)
    return NextResponse.json(
      { error: 'Failed to fetch colleges' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Require superadmin role for college management
  const authResult = await requireRole(UserRole.SUPERADMIN)(request)

  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  try {
    const body = await request.json()
    const { user } = authResult

    const collegeData = {
      ...body,
      isActive: true,
      createdBy: user.uid
    }

    const collegesRepo = new CollegeRepository()
    //TODO: Validate college data here if needed
    const createdCollege: any = await collegesRepo.CreateOrUpdate(collegeData);
    createdCollege.createdAt = createdCollege.createdAt?.toDate?.() || createdCollege.createdAt;
    createdCollege.updatedAt = createdCollege.updatedAt?.toDate?.() || createdCollege.updatedAt;
    return NextResponse.json({
      success: true,
      college: createdCollege as College
    })
  } catch (error) {
    console.error('Error creating college:', error)
    return NextResponse.json(
      { error: 'Failed to create college' },
      { status: 500 }
    )
  }
}
