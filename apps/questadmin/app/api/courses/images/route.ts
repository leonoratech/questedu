/**
 * Course Image Upload API Route
 * Server-side image upload using configurable storage providers
 */

import { adminDb } from '@/data/repository/firebase-admin';
import { requireAuth } from '@/lib/server-auth';
import { StorageFactory } from '@/lib/storage';
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { z } from 'zod';

const uploadSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  instructorId: z.string().min(1, 'Instructor ID is required'),
  quality: z.number().min(0.1).max(1).optional().default(0.8),
  maxWidth: z.number().positive().optional().default(1200),
  maxHeight: z.number().positive().optional().default(800),
  imageType: z.enum(['course-image', 'rich-text-content']).optional().default('course-image'),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Validate storage configuration
    const configValidation = StorageFactory.validateConfiguration();
    if (!configValidation.isValid) {
      console.error('Storage configuration error:', configValidation.error);
      return NextResponse.json(
        { error: 'Storage service unavailable' },
        { status: 503 }
      );
    }

    // Require authentication using standard helper
    const authResult = await requireAuth()(request);

    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const courseId = formData.get('courseId') as string;
    let instructorId = formData.get('instructorId') as string;
    const quality = parseFloat(formData.get('quality') as string) || 0.8;
    const maxWidth = parseInt(formData.get('maxWidth') as string) || 1200;
    const maxHeight = parseInt(formData.get('maxHeight') as string) || 800;
    const imageType = formData.get('imageType') as string || 'course-image';

    // If instructorId is 'from-auth-token', extract it from the authenticated user
    if (instructorId === 'from-auth-token') {
      instructorId = user.uid;
    }

    // Validate input
    const validationResult = uploadSchema.safeParse({
      courseId,
      instructorId,
      quality,
      maxWidth,
      maxHeight,
      imageType,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    // Validate file
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'Image size must be less than 5MB' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPEG, PNG, and WebP images are allowed' },
        { status: 400 }
      );
    }

    // Verify user has permission to upload for this course
    // Skip course validation for temporary course IDs (during course creation)
    const isTemporaryCourse = courseId.startsWith('temp-');
    
    if (!isTemporaryCourse) {
      const courseDoc = await adminDb.collection('courses').doc(courseId).get();
      if (!courseDoc.exists) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }

      const courseData = courseDoc.data();
      if (courseData?.instructorId !== user.uid && user.role !== 'superadmin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    // For temporary courses, we only verify the instructorId matches the authenticated user
    else if (instructorId !== user.uid && user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Process and resize image
    const processedImageBuffer = await processImage(file, { quality, maxWidth, maxHeight });
    const thumbnailBuffer = await createThumbnail(file, {
      maxWidth: 300,
      maxHeight: 200,
      quality: 0.8,
    });

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${courseId}_${timestamp}.${fileExtension}`;

    // Configure storage paths based on image type
    let storagePath: string;
    let thumbnailPath: string;

    if (imageType === 'rich-text-content') {
      // Rich text content images go in a separate folder structure
      storagePath = `courses/${user.uid}/rich-text-images/${fileName}`;
      thumbnailPath = `courses/${user.uid}/rich-text-thumbnails/thumb_${fileName}`;
    } else {
      // Course cover images use the existing structure
      storagePath = `courses/${user.uid}/images/${fileName}`;
      thumbnailPath = `courses/${user.uid}/thumbnails/thumb_${fileName}`;
    }

    // Get storage provider
    const storageProvider = StorageFactory.getStorageProvider();

    // Upload using configured storage provider
    const result = await storageProvider.uploadFile(
      file,
      storagePath,
      thumbnailPath,
      processedImageBuffer,
      thumbnailBuffer,
      {
        courseId,
        instructorId,
        imageType,
        uploadedBy: user.uid,
        uploadedAt: new Date().toISOString(),
      }
    );

    console.log('Upload successful, returning result:', result);
    
    const response = { data: result };
    console.log('API response:', response);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Image upload error:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Failed to upload image';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Check for specific error types
      if (error.message.includes('Supabase')) {
        statusCode = 503;
        errorMessage = 'Storage service error: ' + error.message;
      } else if (error.message.includes('validation')) {
        statusCode = 400;
        errorMessage = 'Validation error: ' + error.message;
      } else if (error.message.includes('permission') || error.message.includes('auth')) {
        statusCode = 403;
        errorMessage = 'Authentication error: ' + error.message;
      }
    }
    
    console.error('Returning error response:', { error: errorMessage, status: statusCode });
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

/**
 * Delete course image
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    // Validate storage configuration
    const configValidation = StorageFactory.validateConfiguration();
    if (!configValidation.isValid) {
      console.error('Storage configuration error:', configValidation.error);
      return NextResponse.json(
        { error: 'Storage service unavailable' },
        { status: 503 }
      );
    }

    // Require authentication using standard helper
    const authResult = await requireAuth()(request);

    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;

    const { searchParams } = new URL(request.url);
    const storagePath = searchParams.get('storagePath');
    const courseId = searchParams.get('courseId');

    if (!storagePath || !courseId) {
      return NextResponse.json(
        { error: 'Storage path and course ID are required' },
        { status: 400 }
      );
    }

    // Verify user has permission
    // Skip course validation for temporary course IDs (during course creation)
    const isTemporaryCourse = courseId.startsWith('temp-');
    
    if (!isTemporaryCourse) {
      const courseDoc = await adminDb.collection('courses').doc(courseId).get();
      if (!courseDoc.exists) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }

      const courseData = courseDoc.data();
      if (courseData?.instructorId !== user.uid && user.role !== 'superadmin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    // For temporary courses, we allow deletion by the authenticated user
    // since these are images uploaded during course creation that haven't been saved yet

    // Delete using configured storage provider
    const storageProvider = StorageFactory.getStorageProvider();
    await storageProvider.deleteFile(storagePath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Image deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}

/**
 * Process and resize image using sharp
 */
async function processImage(
  file: File,
  options: { quality: number; maxWidth: number; maxHeight: number }
): Promise<Buffer> {
  const { quality, maxWidth, maxHeight } = options;
  
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  return await sharp(buffer)
    .resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .jpeg({ quality: Math.round(quality * 100) })
    .toBuffer();
}

/**
 * Create thumbnail from image file using sharp
 */
async function createThumbnail(
  file: File,
  options: { maxWidth: number; maxHeight: number; quality: number }
): Promise<Buffer> {
  const { maxWidth, maxHeight, quality } = options;
  
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  return await sharp(buffer)
    .resize(maxWidth, maxHeight, {
      fit: 'cover',
      position: 'center'
    })
    .jpeg({ quality: Math.round(quality * 100) })
    .toBuffer();
}
