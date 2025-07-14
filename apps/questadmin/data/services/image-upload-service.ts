/**
 * Image Upload Service
 * Client-side service for uploading course images via API routes
 */

import { getAuthHeaders } from '@/data/config/firebase-auth';

export interface ImageUploadOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface ImageUploadResult {
  url: string;
  fileName: string;
  storagePath: string;
  thumbnailUrl?: string;
}

/**
 * Upload course image via API route
 */
export async function uploadCourseImage(
  file: File,
  courseId: string,
  instructorId: string,
  options: ImageUploadOptions = {}
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

    // Prepare form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('courseId', courseId);
    formData.append('instructorId', instructorId);
    formData.append('quality', (options.quality || 0.8).toString());
    formData.append('maxWidth', (options.maxWidth || 1200).toString());
    formData.append('maxHeight', (options.maxHeight || 800).toString());

    // Get auth headers
    const headers = await getAuthHeaders();

    console.log('Uploading course image via API:', { courseId, fileName: file.name, size: file.size });

    // Upload via API route
    const response = await fetch('/api/courses/images', {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload image');
    }

    const { data } = await response.json();
    console.log('Image uploaded successfully:', data);

    return data;
  } catch (error) {
    console.error('Error uploading course image:', error);
    throw error;
  }
}

/**
 * Upload course image with progress tracking via API
 */
export async function uploadCourseImageWithProgress(
  file: File,
  courseId: string,
  instructorId: string,
  onProgress: (progress: number) => void,
  options: ImageUploadOptions = {}
): Promise<ImageUploadResult> {
  try {
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('Image size must be less than 5MB');
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('courseId', courseId);
    formData.append('instructorId', instructorId);
    formData.append('quality', (options.quality || 0.8).toString());
    formData.append('maxWidth', (options.maxWidth || 1200).toString());
    formData.append('maxHeight', (options.maxHeight || 800).toString());

    // Get auth headers
    const headers = await getAuthHeaders();

    // Create XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Set timeout (30 seconds)
      xhr.timeout = 30000;

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('timeout', () => {
        console.error('Upload timeout after 30 seconds');
        reject(new Error('Upload timeout: The request took too long to complete'));
      });

      xhr.addEventListener('load', () => {
        console.log('XHR Load Event:', {
          status: xhr.status,
          statusText: xhr.statusText,
          readyState: xhr.readyState,
          responseURL: xhr.responseURL,
          contentType: xhr.getResponseHeader('content-type')
        });
        
        // Log response text for debugging
        console.log('Response Text (first 500 chars):', xhr.responseText.substring(0, 500));

        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            // Check if response is empty
            if (!xhr.responseText.trim()) {
              console.error('Empty response received');
              reject(new Error('Empty response from server'));
              return;
            }

            // Check content type
            const contentType = xhr.getResponseHeader('content-type');
            if (contentType && !contentType.includes('application/json')) {
              console.warn('Unexpected content type:', contentType);
              console.warn('Response might not be JSON:', xhr.responseText.substring(0, 200));
            }

            const response = JSON.parse(xhr.responseText);
            console.log('Successfully parsed response:', response);
            
            // Validate response structure
            if (!response || typeof response !== 'object') {
              console.error('Invalid response format: not an object', response);
              reject(new Error('Invalid response format: response is not an object'));
              return;
            }
            
            if (!response.data) {
              console.error('Response missing data property:', response);
              reject(new Error('Invalid response format: missing data property'));
              return;
            }

            // Validate data structure
            const { data } = response;
            if (!data.url || !data.fileName || !data.storagePath) {
              console.error('Incomplete upload result:', data);
              reject(new Error('Incomplete upload result: missing required fields'));
              return;
            }

            console.log('Upload successful, resolving with:', data);
            resolve(data);
            
          } catch (parseError) {
            console.error('JSON parse error:', {
              error: parseError,
              responseText: xhr.responseText,
              responseLength: xhr.responseText.length,
              responseType: typeof xhr.responseText
            });
            reject(new Error(`Invalid response format: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`));
          }
        } else {
          console.error('HTTP error status:', {
            status: xhr.status,
            statusText: xhr.statusText,
            responseText: xhr.responseText
          });
          
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.error || `Upload failed with status ${xhr.status}`));
          } catch (parseError) {
            reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        console.error('Network error during upload');
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        console.error('Upload was aborted');
        reject(new Error('Upload was aborted'));
      });

      xhr.open('POST', '/api/courses/images');
      
      // Set auth headers
      if (headers.Authorization) {
        xhr.setRequestHeader('Authorization', headers.Authorization);
      }

      xhr.send(formData);
    });
  } catch (error) {
    console.error('Error uploading course image with progress:', error);
    throw error;
  }
}

/**
 * Delete course image via API route
 */
export async function deleteCourseImage(storagePath: string, courseId: string): Promise<void> {
  try {
    // Get auth headers
    const headers = await getAuthHeaders();

    const response = await fetch(`/api/courses/images?storagePath=${encodeURIComponent(storagePath)}&courseId=${courseId}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete image');
    }

    console.log('Image deleted successfully:', storagePath);
  } catch (error) {
    console.error('Error deleting course image:', error);
    throw error;
  }
}

/**
 * Validate image file (client-side validation)
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'Image size must be less than 5MB' };
  }

  // Check file format
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
  }

  return { valid: true };
}
