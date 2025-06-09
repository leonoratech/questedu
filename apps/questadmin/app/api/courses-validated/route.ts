import { ApiResponse, Course, CourseStatus, CreateCourseRequest } from '@/lib/data-models';
import { CourseValidator } from '@/lib/data-validation';
import { getCourseService } from '@/lib/firebase-services';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/courses-validated
 * Fetch courses with validation
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const instructorId = searchParams.get('instructorId');
    const status = searchParams.get('status');
    const level = searchParams.get('level');
    const limitParam = searchParams.get('limit');
    
    // Use the Firebase service to fetch courses
    const courseService = getCourseService();
    const courses = await courseService.getCourses({
      instructorId: instructorId || undefined,
      status: status || undefined,
      level: level || undefined,
      limit: limitParam ? parseInt(limitParam) : undefined,
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
    const body: CreateCourseRequest = await request.json();

    // Validate the request body
    const validator = new CourseValidator();
    const validationResult = validator.validatePartial(body);

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
      level: body.level,
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
      
      // Duration
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
