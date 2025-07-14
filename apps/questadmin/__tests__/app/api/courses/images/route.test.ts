/**
 * Integration tests for Course Images API Route
 */

import { DELETE, POST } from '@/app/api/courses/images/route';
import { NextRequest } from 'next/server';
import { createMockFile, MockStorageProvider } from '../../lib/storage/test-utils';

// Mock the storage factory
const mockStorageProvider = new MockStorageProvider();
jest.mock('@/lib/storage/storage-factory', () => ({
  StorageFactory: {
    validateConfiguration: jest.fn(() => ({ isValid: true })),
    getStorageProvider: jest.fn(() => mockStorageProvider),
  },
}));

// Mock server auth
jest.mock('@/lib/server-auth', () => ({
  requireAuth: jest.fn((request) => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'Unauthorized', status: 401 };
    }
    return {
      user: {
        uid: 'test-user-123',
        role: 'instructor',
        collegeId: 'test-college',
      },
    };
  }),
}));

// Mock Firebase Admin DB
const mockCourseData = {
  exists: true,
  data: () => ({
    instructorId: 'test-user-123',
    title: 'Test Course',
    imageUrl: 'https://example.com/old-image.jpg',
  }),
};

jest.mock('@/data/repository/firebase-admin', () => ({
  adminDb: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve(mockCourseData)),
        update: jest.fn(() => Promise.resolve()),
      })),
    })),
  },
}));

// Mock sharp for image processing
jest.mock('sharp', () => {
  const mockSharp = {
    resize: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    toBuffer: jest.fn(() => Promise.resolve(Buffer.from('processed image'))),
  };
  return jest.fn(() => mockSharp);
});

describe('/api/courses/images', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorageProvider.setConfigured(true);
    mockStorageProvider.setShouldThrowError(false);

    // Reset mock course data
    mockCourseData.exists = true;
  });

  describe('POST /api/courses/images', () => {
    const createFormData = (overrides: any = {}) => {
      const formData = new FormData();
      const file = createMockFile();
      
      formData.append('image', file);
      formData.append('courseId', overrides.courseId || 'test-course-123');
      formData.append('instructorId', overrides.instructorId || 'test-user-123');
      
      if (overrides.quality !== undefined) {
        formData.append('quality', overrides.quality.toString());
      }
      if (overrides.maxWidth !== undefined) {
        formData.append('maxWidth', overrides.maxWidth.toString());
      }
      if (overrides.maxHeight !== undefined) {
        formData.append('maxHeight', overrides.maxHeight.toString());
      }
      
      return formData;
    };

    const createRequest = (formData: FormData, token: string = 'valid-token') => {
      return {
        formData: () => Promise.resolve(formData),
        headers: {
          get: (key: string) => {
            if (key === 'authorization') return `Bearer ${token}`;
            return null;
          },
        },
      } as NextRequest;
    };

    it('should upload image successfully', async () => {
      const formData = createFormData();
      const request = createRequest(formData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        url: expect.stringContaining('courses/test-course-123/images/'),
        fileName: 'test-image.jpg',
        storagePath: expect.stringContaining('courses/test-course-123/images/'),
        thumbnailUrl: expect.stringContaining('courses/test-course-123/thumbnails/'),
      });
    });

    it('should return 401 for unauthorized requests', async () => {
      const formData = createFormData();
      const request = createRequest(formData, ''); // No token

      const response = await POST(request);

      expect(response.status).toBe(401);
    });

    it('should return 400 for missing required fields', async () => {
      const formData = new FormData();
      // Missing image, courseId, and instructorId
      const request = createRequest(formData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toContain('required');
    });

    it('should return 400 for invalid file type', async () => {
      const formData = new FormData();
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      formData.append('image', file);
      formData.append('courseId', 'test-course-123');
      formData.append('instructorId', 'test-user-123');

      const request = createRequest(formData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toContain('Invalid file type');
    });

    it('should return 400 for file too large', async () => {
      const formData = new FormData();
      // Create a large file (mock size > 5MB)
      const largeContent = 'x'.repeat(6 * 1024 * 1024); // 6MB
      const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });
      formData.append('image', file);
      formData.append('courseId', 'test-course-123');
      formData.append('instructorId', 'test-user-123');

      const request = createRequest(formData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toContain('File size too large');
    });

    it('should return 404 for non-existent course', async () => {
      mockCourseData.exists = false;

      const formData = createFormData();
      const request = createRequest(formData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.error).toBe('Course not found');
    });

    it('should return 403 for unauthorized course access', async () => {
      // Mock course with different instructor
      mockCourseData.data = () => ({
        instructorId: 'different-instructor',
        title: 'Test Course',
      });

      const formData = createFormData();
      const request = createRequest(formData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(403);
      expect(responseData.error).toBe('Not authorized to modify this course');
    });

    it('should return 503 when storage is not configured', async () => {
      const { StorageFactory } = require('@/lib/storage/storage-factory');
      StorageFactory.validateConfiguration.mockReturnValueOnce({
        isValid: false,
        error: 'Storage not configured',
      });

      const formData = createFormData();
      const request = createRequest(formData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(503);
      expect(responseData.error).toBe('Storage service unavailable');
    });

    it('should handle storage upload errors', async () => {
      mockStorageProvider.setShouldThrowError(true);

      const formData = createFormData();
      const request = createRequest(formData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBe('Failed to upload image');
    });

    it('should accept custom quality and size parameters', async () => {
      const formData = createFormData({
        quality: 0.9,
        maxWidth: 1600,
        maxHeight: 1200,
      });
      const request = createRequest(formData);

      const response = await POST(request);

      expect(response.status).toBe(200);
      // Sharp should have been called with the custom parameters
      const sharp = require('sharp');
      expect(sharp).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/courses/images', () => {
    const createDeleteRequest = (body: any, token: string = 'valid-token') => {
      return {
        json: () => Promise.resolve(body),
        headers: {
          get: (key: string) => {
            if (key === 'authorization') return `Bearer ${token}`;
            return null;
          },
        },
      } as NextRequest;
    };

    it('should delete image successfully', async () => {
      const request = createDeleteRequest({
        courseId: 'test-course-123',
        instructorId: 'test-user-123',
      });

      const response = await DELETE(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.message).toBe('Image deleted successfully');
    });

    it('should return 401 for unauthorized requests', async () => {
      const request = createDeleteRequest({
        courseId: 'test-course-123',
        instructorId: 'test-user-123',
      }, ''); // No token

      const response = await DELETE(request);

      expect(response.status).toBe(401);
    });

    it('should return 400 for missing required fields', async () => {
      const request = createDeleteRequest({}); // Missing courseId and instructorId

      const response = await DELETE(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toContain('required');
    });

    it('should return 404 for non-existent course', async () => {
      mockCourseData.exists = false;

      const request = createDeleteRequest({
        courseId: 'test-course-123',
        instructorId: 'test-user-123',
      });

      const response = await DELETE(request);
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.error).toBe('Course not found');
    });

    it('should return 403 for unauthorized course access', async () => {
      // Mock course with different instructor
      mockCourseData.data = () => ({
        instructorId: 'different-instructor',
        title: 'Test Course',
        imageUrl: 'https://example.com/image.jpg',
      });

      const request = createDeleteRequest({
        courseId: 'test-course-123',
        instructorId: 'test-user-123',
      });

      const response = await DELETE(request);
      const responseData = await response.json();

      expect(response.status).toBe(403);
      expect(responseData.error).toBe('Not authorized to modify this course');
    });

    it('should handle courses without existing images', async () => {
      // Mock course without imageUrl
      mockCourseData.data = () => ({
        instructorId: 'test-user-123',
        title: 'Test Course',
      });

      const request = createDeleteRequest({
        courseId: 'test-course-123',
        instructorId: 'test-user-123',
      });

      const response = await DELETE(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.message).toBe('Image deleted successfully');
    });

    it('should handle storage deletion errors gracefully', async () => {
      mockStorageProvider.setShouldThrowError(true);

      const request = createDeleteRequest({
        courseId: 'test-course-123',
        instructorId: 'test-user-123',
      });

      const response = await DELETE(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBe('Failed to delete image');
    });
  });
});
