/**
 * Course Image Upload API Route
 * Server-side image upload using Firebase Admin SDK
 */

import { adminDb } from '@/data/repository/firebase-admin';
import { requireAuth } from '@/lib/server-auth';
import { getStorage } from 'firebase-admin/storage';
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { z } from 'zod';

const uploadSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  instructorId: z.string().min(1, 'Instructor ID is required'),
  quality: z.number().min(0.1).max(1).optional().default(0.8),
  maxWidth: z.number().positive().optional().default(1200),
  maxHeight: z.number().positive().optional().default(800),
});

interface ImageUploadResult {
  url: string;
  fileName: string;
  storagePath: string;
  thumbnailUrl?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
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
    const instructorId = formData.get('instructorId') as string;
    const quality = parseFloat(formData.get('quality') as string) || 0.8;
    const maxWidth = parseInt(formData.get('maxWidth') as string) || 1200;
    const maxHeight = parseInt(formData.get('maxHeight') as string) || 800;

    // Validate input
    const validationResult = uploadSchema.safeParse({
      courseId,
      instructorId,
      quality,
      maxWidth,
      maxHeight,
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
    const courseDoc = await adminDb.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const courseData = courseDoc.data();
    if (courseData?.instructorId !== user.uid && user.role !== 'superadmin') {
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

    // Upload to Firebase Storage using Admin SDK
    const storage = getStorage();
    const bucket = storage.bucket();

    // Upload main image
    const storagePath = `courses/${user.uid}/images/${fileName}`;
    const fileUpload = bucket.file(storagePath);
    
    await fileUpload.save(processedImageBuffer, {
      metadata: {
        contentType: 'image/jpeg',
        metadata: {
          courseId,
          instructorId,
          uploadedBy: user.uid,
          uploadedAt: new Date().toISOString(),
        },
      },
    });

    // Make file publicly readable
    await fileUpload.makePublic();

    // Upload thumbnail
    const thumbnailPath = `courses/${user.uid}/thumbnails/thumb_${fileName}`;
    const thumbnailUpload = bucket.file(thumbnailPath);
    
    await thumbnailUpload.save(thumbnailBuffer, {
      metadata: {
        contentType: 'image/jpeg',
        metadata: {
          courseId,
          instructorId,
          uploadedBy: user.uid,
          uploadedAt: new Date().toISOString(),
        },
      },
    });

    await thumbnailUpload.makePublic();

    // Get public URLs
    const imageUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
    const thumbnailUrl = `https://storage.googleapis.com/${bucket.name}/${thumbnailPath}`;

    const result: ImageUploadResult = {
      url: imageUrl,
      fileName,
      storagePath,
      thumbnailUrl,
    };

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

/**
 * Delete course image
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
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
    const courseDoc = await adminDb.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const courseData = courseDoc.data();
    if (courseData?.instructorId !== user.uid && user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete from Firebase Storage
    const storage = getStorage();
    const bucket = storage.bucket();

    try {
      await bucket.file(storagePath).delete();
      
      // Also try to delete thumbnail if it exists
      const thumbnailPath = storagePath.replace('/images/', '/thumbnails/').replace(/([^/]+)$/, 'thumb_$1');
      try {
        await bucket.file(thumbnailPath).delete();
      } catch (thumbnailError) {
        console.warn('Could not delete thumbnail:', thumbnailError);
      }
    } catch (error) {
      console.warn('File not found or already deleted:', error);
    }

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
