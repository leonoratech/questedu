/**
 * Rich Text Image Upload Service
 * Handles image uploads for rich text editors (essays, content creation)
 * Uses server-side API routes following the established architecture pattern
 */

import { getAuthHeaders } from '@/data/config/firebase-auth';

interface ImageUploadResult {
  url: string;
  thumbnailUrl?: string;
  storagePath: string;
  width?: number;
  height?: number;
}

interface UploadOptions {
  courseId?: string;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  imageType?: 'course-image' | 'rich-text-content';
}

export class RichTextImageService {
  /**
   * Upload an image for rich text content
   * Uses the existing course images API with appropriate categorization
   */
  static async uploadImage(
    file: File,
    options: UploadOptions = {}
  ): Promise<ImageUploadResult> {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('Image size must be less than 5MB');
      }

      // Get current user from auth context
      const headers = await getAuthHeaders();
      
      // Remove Content-Type header when sending FormData - browser will set it automatically with boundary
      const { 'Content-Type': _, ...formDataHeaders } = headers;
      
      // Extract user ID from headers (this is set by getAuthHeaders)
      const authHeader = formDataHeaders.Authorization;
      if (!authHeader) {
        throw new Error('User must be authenticated to upload images');
      }

      // Create form data with rich text specific defaults
      const formData = new FormData();
      formData.append('file', file);
      
      // Use course ID if provided, otherwise use a special identifier for rich text content
      const courseId = options.courseId || `rich-text-content-${Date.now()}`;
      formData.append('courseId', courseId);
      
      // Extract instructor ID from the auth headers (this should be available from the backend)
      // The backend will extract the actual user ID from the JWT token
      formData.append('instructorId', 'from-auth-token');
      
      // Rich text images typically need smaller dimensions than course cover images
      formData.append('quality', (options.quality || 0.85).toString());
      formData.append('maxWidth', (options.maxWidth || 800).toString());
      formData.append('maxHeight', (options.maxHeight || 600).toString());
      
      // Add image type for proper categorization in storage
      formData.append('imageType', options.imageType || 'rich-text-content');

      console.log('Uploading rich text image via API:', { 
        courseId, 
        fileName: file.name, 
        size: file.size,
        imageType: options.imageType || 'rich-text-content'
      });

      // Upload via the existing course images API route
      const response = await fetch('/api/courses/images', {
        method: 'POST',
        headers: formDataHeaders, // Use headers without Content-Type
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const result = await response.json();
      
      if (!result.data) {
        throw new Error('Invalid response format from image upload');
      }

      console.log('Rich text image uploaded successfully:', result.data);

      return {
        url: result.data.url,
        thumbnailUrl: result.data.thumbnailUrl,
        storagePath: result.data.storagePath,
        width: result.data.width,
        height: result.data.height,
      };
    } catch (error) {
      console.error('Error uploading rich text image:', error);
      throw error;
    }
  }

  /**
   * Delete an uploaded image
   * Uses the existing course images API for deletion
   */
  static async deleteImage(storagePath: string, courseId?: string): Promise<void> {
    try {
      // Get auth headers (Content-Type is fine for DELETE requests)
      const headers = await getAuthHeaders();
      
      if (!headers.Authorization) {
        throw new Error('User must be authenticated to delete images');
      }

      const url = new URL('/api/courses/images', window.location.origin);
      url.searchParams.set('storagePath', storagePath);
      url.searchParams.set('courseId', courseId || 'rich-text-content');

      const response = await fetch(url.toString(), {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete image');
      }

      console.log('Rich text image deleted successfully:', storagePath);
    } catch (error) {
      console.error('Error deleting rich text image:', error);
      throw error;
    }
  }

  /**
   * Validate image file before upload
   */
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Only JPEG, PNG, and WebP images are allowed',
      };
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Image size must be less than 5MB',
      };
    }

    return { valid: true };
  }

  /**
   * Get image dimensions from file
   */
  static getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load image'));
      };

      img.src = objectUrl;
    });
  }
}
