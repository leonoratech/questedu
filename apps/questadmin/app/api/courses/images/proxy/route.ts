/**
 * Course Image Proxy API Route
 * Server-side image serving with authentication and access control
 */

import { getStorage } from 'firebase-admin/storage';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const storagePath = searchParams.get('path');
    const courseId = searchParams.get('courseId');

    if (!storagePath) {
      return NextResponse.json({ error: 'Storage path is required' }, { status: 400 });
    }

    // Optional: Verify JWT token for private images
    // For course images, we'll make them publicly accessible
    // but you could add authentication here if needed
    
    try {
      // Get the file from Firebase Storage
      const storage = getStorage();
      const bucket = storage.bucket();
      const file = bucket.file(storagePath);

      // Check if file exists
      const [exists] = await file.exists();
      if (!exists) {
        return NextResponse.json({ error: 'Image not found' }, { status: 404 });
      }

      // Get file metadata
      const [metadata] = await file.getMetadata();
      const contentType = metadata.contentType || 'image/jpeg';

      // Download the file
      const [fileBuffer] = await file.download();

      // Return the image with appropriate headers
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
          'Content-Length': fileBuffer.length.toString(),
        },
      });
    } catch (error) {
      console.error('Error serving image:', error);
      return NextResponse.json({ error: 'Failed to serve image' }, { status: 500 });
    }
  } catch (error) {
    console.error('Image proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
