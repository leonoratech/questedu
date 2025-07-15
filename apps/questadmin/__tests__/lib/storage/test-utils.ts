/**
 * Test utilities and mocks for storage provider testing
 */

import { FileMetadata, StorageProvider, UploadResult } from '@/lib/storage/storage-provider';

export const createMockFile = (name: string = 'test-image.jpg'): File => {
  const buffer = Buffer.from('fake image data');
  const blob = new Blob([buffer], { type: 'image/jpeg' });
  
  // Create a File-like object with the expected properties
  const file = Object.assign(blob, {
    name,
    lastModified: Date.now(),
    webkitRelativePath: '',
  });
  
  return file as File;
};

export const createMockMetadata = (): FileMetadata => ({
  courseId: 'test-course-123',
  instructorId: 'test-instructor-456',
  uploadedBy: 'test-user-789',
  uploadedAt: new Date().toISOString(),
});

export const createMockBuffers = () => ({
  processedBuffer: Buffer.from('processed image data'),
  thumbnailBuffer: Buffer.from('thumbnail image data'),
});

export const createMockUploadResult = (): UploadResult => ({
  url: 'https://example.com/image.jpg',
  fileName: 'test-image.jpg',
  storagePath: 'courses/test-course-123/images/test-image.jpg',
  thumbnailUrl: 'https://example.com/thumbnails/thumb_test-image.jpg',
});

export class MockStorageProvider implements StorageProvider {
  private configured: boolean;
  private shouldThrowError: boolean;

  constructor(configured: boolean = true, shouldThrowError: boolean = false) {
    this.configured = configured;
    this.shouldThrowError = shouldThrowError;
  }

  async uploadFile(
    file: File,
    storagePath: string,
    thumbnailPath: string,
    processedBuffer: Buffer,
    thumbnailBuffer: Buffer,
    metadata: FileMetadata
  ): Promise<UploadResult> {
    if (this.shouldThrowError) {
      throw new Error('Mock upload error');
    }

    return {
      url: `https://mock-storage.com/${storagePath}`,
      fileName: file.name,
      storagePath,
      thumbnailUrl: `https://mock-storage.com/${thumbnailPath}`,
    };
  }

  async deleteFile(storagePath: string): Promise<void> {
    if (this.shouldThrowError) {
      throw new Error('Mock delete error');
    }
    // Mock implementation - no actual deletion
  }

  getPublicUrl(storagePath: string): string {
    return `https://mock-storage.com/${storagePath}`;
  }

  isConfigured(): boolean {
    return this.configured;
  }

  setConfigured(configured: boolean): void {
    this.configured = configured;
  }

  setShouldThrowError(shouldThrow: boolean): void {
    this.shouldThrowError = shouldThrow;
  }
}
