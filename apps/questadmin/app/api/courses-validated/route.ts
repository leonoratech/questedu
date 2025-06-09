import { ApiResponse, Course, CourseLevel, CourseStatus, CreateCourseRequest } from '@/lib/data-models';
import { CourseValidator } from '@/lib/data-validation';
import { UserRole } from '@/lib/firebase-auth';
import { getCourseService } from '@/lib/firebase-services';
import { requireAuth, requireRole } from '@/lib/server-auth';
import { CourseQuerySchema, CreateCourseSchema } from '@/lib/validation-schemas';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Convert string level to CourseLevel enum
 */
function normalizeLevel(level: string): CourseLevel {
  switch (level.toLowerCase()) {
    case 'beginner':
      return CourseLevel.BEGINNER;
    case 'intermediate':
      return CourseLevel.INTERMEDIATE;
    case 'advanced':
      return CourseLevel.ADVANCED;
    default:
      return CourseLevel.BEGINNER; // Default fallback
  }
}

/**
 * GET /api/courses-validated
 * Fetch courses with validation
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication to view courses
    const authResult = await requireAuth()(request)
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { searchParams } = new URL(request.url);
    
    // Validate query parameters
    const queryValidation = CourseQuerySchema.safeParse({
      instructorId: searchParams.get('instructorId'),
      status: searchParams.get('status'),
      level: searchParams.get('level'),
      limit: searchParams.get('limit'),
    })

    if (!queryValidation.success) {
      return NextResponse.json({
        error: 'Invalid query parameters',
        details: queryValidation.error.issues
      }, { status: 400 })
    }

    const { instructorId, status, level, limit } = queryValidation.data
    
    // Use the Firebase service to fetch courses
    const courseService = getCourseService();
    const courses = await courseService.getCourses({
      instructorId: instructorId || undefined,
      status: status || undefined,
      level: level || undefined,
      limit: limit || undefined,
      orderBy: 'updatedAt',
      orderDirection: 'desc'
    });

    // Validate each course using our validation system
    const validator = new CourseValidator();
    const validatedCourses: Course[] = [];
    const validationErrors: string[] = [];

    for (const course of courses) {
      const result = validator.validate(course);
      if (result.isValid) {
        validatedCourses.push(course);
      } else {
        validationErrors.push(`Course ${course.id}: ${result.errors.join(', ')}`);
      }
    }

    const response: ApiResponse<Course[]> = {
      data: validatedCourses,
      success: true,
      message: `Retrieved ${validatedCourses.length} valid courses`,
      timestamp: new Date().toISOString(),
      ...(validationErrors.length > 0 && { 
        warnings: [`${validationErrors.length} courses failed validation`] 
      })
    };

    return NextResponse.json(response);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    const response: ApiResponse<null> = {
      data: null,
      success: false,
      message: 'Failed to fetch courses',
      error: errorMessage,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * POST /api/courses-validated
 * Create a new course with validation
 */
export async function POST(request: NextRequest) {
  try {
    // Require instructor or admin role to create courses
    const authResult = await requireRole(UserRole.INSTRUCTOR)(request)
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const body: CreateCourseRequest = await request.json();

    // Validate the request body using Zod schema
    const schemaValidation = CreateCourseSchema.safeParse(body)
    if (!schemaValidation.success) {
      return NextResponse.json({
        error: 'Invalid course data',
        details: schemaValidation.error.issues
      }, { status: 400 })
    }

    // Validate the request body using CourseValidator for additional business logic
    const validator = new CourseValidator();
    
    // Convert level to proper enum and duration to string before validation
    const normalizedData = {
      ...schemaValidation.data,
      level: normalizeLevel(schemaValidation.data.level || 'beginner'),
      duration: schemaValidation.data.duration ? `${schemaValidation.data.duration} hours` : 'TBD',
      status: CourseStatus.DRAFT
    };
    
    const validationResult = validator.validatePartial(normalizedData);

    if (!validationResult.isValid) {
      const response: ApiResponse<null> = {
        data: null,
        success: false,
        message: 'Validation failed',
        error: `Validation errors: ${validationResult.errors.join(', ')}`,
        timestamp: new Date().toISOString()
      };

      return NextResponse.json(response, { status: 400 });
    }

    // Create the course using Firebase service
    const courseService = getCourseService();
    
    // Prepare full course data with all required fields
    const courseData = {
      // Basic course information from request
      title: body.title,
      description: body.description,
      instructor: body.instructor_id, // Will be updated with actual instructor name
      instructorId: body.instructor_id,
      category: body.category,
      subcategory: body.category, // Default subcategory to category
      level: normalizeLevel(body.level || 'beginner'),
      price: body.price,
      currency: body.currency || 'USD',
      originalPrice: body.price, // Default original price to current price
      
      // Course status and publication
      status: CourseStatus.DRAFT,
      isPublished: false,
      featured: body.isFeatured || false,
      
      // Course metrics with default values
      rating: 0,
      ratingCount: 0,
      enrollmentCount: 0,
      completionCount: 0,
      
      // Course content arrays with defaults
      tags: body.tags || [],
      skills: [],
      prerequisites: body.prerequisites || [],
      whatYouWillLearn: body.objectives || [],
      targetAudience: [],
      
      // Media and resources
      courseImage: '',
      promoVideo: '',
      
      // Course delivery options
      language: body.language || 'English',
      subtitles: [],
      certificates: true,
      lifetimeAccess: true,
      mobileAccess: true,
      downloadableResources: false,
      
      // Content counts
      assignmentsCount: 0,
      articlesCount: 0,
      videosCount: 0,
      totalVideoLength: 0,
      
      // Duration - ensure it's a string
      duration: body.estimatedDuration ? `${body.estimatedDuration} hours` : 'TBD',
      
      // Admin fields
      lastModifiedBy: body.instructor_id,
      
      // SEO fields
      seoTitle: body.title,
      seoDescription: body.description,
      seoKeywords: body.tags || []
    };

    const courseId = await courseService.createCourse(courseData);

    // Fetch the created course to return it
    const createdCourse = await courseService.getCourse(courseId);

    const response: ApiResponse<Course> = {
      data: createdCourse!,
      success: true,
      message: 'Course created successfully',
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    const response: ApiResponse<null> = {
      data: null,
      success: false,
      message: 'Failed to create course',
      error: errorMessage,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 500 });
  }
}
