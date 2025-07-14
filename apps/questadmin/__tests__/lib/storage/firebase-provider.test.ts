/**
 * Unit tests for Firebase Storage Provider
 */

import { FirebaseStorageProvider } from '@/lib/storage/firebase-provider';
import { createMockBuffers, createMockFile, createMockMetadata } from './test-utils';

// Mock firebase-admin/storage
jest.mock('firebase-admin/storage', () => ({
  getStorage: jest.fn(() => ({
    bucket: jest.fn(() => ({
      file: jest.fn(() => ({
        save: jest.fn(),
        makePublic: jest.fn(),
        delete: jest.fn(),
      })),
      name: 'test-bucket.appspot.com',
    })),
  })),
}));

describe('FirebaseStorageProvider', () => {
  let provider: FirebaseStorageProvider;
  let mockBucket: any;
  let mockFile: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock implementations
    mockFile = {
      save: jest.fn().mockResolvedValue(undefined),
      makePublic: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    
    mockBucket = {
      file: jest.fn().mockReturnValue(mockFile),
      name: 'test-bucket.appspot.com',
    };
    
    const { getStorage } = require('firebase-admin/storage');
    getStorage.mockReturnValue({
      bucket: jest.fn().mockReturnValue(mockBucket),
    });
    
    provider = new FirebaseStorageProvider('test-project', 'custom-bucket');
  });

  describe('constructor', () => {
    it('should initialize with project ID', () => {
      const provider = new FirebaseStorageProvider('test-project');
      expect(provider).toBeInstanceOf(FirebaseStorageProvider);
    });

    it('should initialize with project ID and custom bucket', () => {
      const provider = new FirebaseStorageProvider('test-project', 'custom-bucket');
      expect(provider).toBeInstanceOf(FirebaseStorageProvider);
    });
  });

  describe('isConfigured', () => {
    it('should return true when project ID is provided', () => {
      expect(provider.isConfigured()).toBe(true);
    });

    it('should return false when project ID is empty', () => {
      const emptyProvider = new FirebaseStorageProvider('');
      expect(emptyProvider.isConfigured()).toBe(false);
    });
  });

  describe('uploadFile', () => {
    it('should upload file and thumbnail successfully', async () => {
      const file = createMockFile();
      const metadata = createMockMetadata();
      const { processedBuffer, thumbnailBuffer } = createMockBuffers();
      const storagePath = 'courses/test/images/test.jpg';
      const thumbnailPath = 'courses/test/thumbnails/thumb_test.jpg';

      const result = await provider.uploadFile(
        file,
        storagePath,
        thumbnailPath,
        processedBuffer,
        thumbnailBuffer,
        metadata
      );

      // Verify file operations were called
      expect(mockBucket.file).toHaveBeenCalledWith(storagePath);
      expect(mockBucket.file).toHaveBeenCalledWith(thumbnailPath);
      expect(mockFile.save).toHaveBeenCalledTimes(2);
      expect(mockFile.makePublic).toHaveBeenCalledTimes(2);

      // Verify result structure
      expect(result).toEqual({
        url: `https://storage.googleapis.com/${mockBucket.name}/${storagePath}`,
        fileName: file.name,
        storagePath,
        thumbnailUrl: `https://storage.googleapis.com/${mockBucket.name}/${thumbnailPath}`,
      });
    });

    it('should save files with correct metadata', async () => {
      const file = createMockFile();
      const metadata = createMockMetadata();
      const { processedBuffer, thumbnailBuffer } = createMockBuffers();

      await provider.uploadFile(
        file,
        'test/path.jpg',
        'test/thumb.jpg',
        processedBuffer,
        thumbnailBuffer,
        metadata
      );

      expect(mockFile.save).toHaveBeenCalledWith(processedBuffer, {
        metadata: {
          contentType: 'image/jpeg',
          metadata: {
            courseId: metadata.courseId,
            instructorId: metadata.instructorId,
            uploadedBy: metadata.uploadedBy,
            uploadedAt: metadata.uploadedAt,
          },
        },
      });
    });

    it('should handle upload errors', async () => {
      mockFile.save.mockRejectedValueOnce(new Error('Firebase upload failed'));

      const file = createMockFile();
      const metadata = createMockMetadata();
      const { processedBuffer, thumbnailBuffer } = createMockBuffers();

      await expect(
        provider.uploadFile(
          file,
          'test/path.jpg',
          'test/thumb.jpg',
          processedBuffer,
          thumbnailBuffer,
          metadata
        )
      ).rejects.toThrow('Failed to upload to Firebase Storage');
    });
  });

  describe('deleteFile', () => {
    it('should delete file and thumbnail successfully', async () => {
      const storagePath = 'courses/test/images/test.jpg';

      await provider.deleteFile(storagePath);

      expect(mockBucket.file).toHaveBeenCalledWith(storagePath);
      expect(mockBucket.file).toHaveBeenCalledWith('courses/test/thumbnails/thumb_test.jpg');
      expect(mockFile.delete).toHaveBeenCalledTimes(2);
    });

    it('should handle file not found errors gracefully', async () => {
      mockFile.delete.mockRejectedValue(new Error('File not found'));

      await expect(provider.deleteFile('test/path.jpg')).resolves.not.toThrow();
    });

    it('should handle general delete errors', async () => {
      const { getStorage } = require('firebase-admin/storage');
      getStorage.mockImplementationOnce(() => {
        throw new Error('Storage access denied');
      });

      await expect(provider.deleteFile('test/path.jpg')).rejects.toThrow(
        'Failed to delete from Firebase Storage'
      );
    });
  });

  describe('getPublicUrl', () => {
    it('should generate correct public URL with custom bucket', () => {
      const storagePath = 'courses/test/images/test.jpg';
      const url = provider.getPublicUrl(storagePath);

      expect(url).toBe(`https://storage.googleapis.com/custom-bucket/${storagePath}`);
    });

    it('should generate correct public URL with default bucket', () => {
      const providerWithoutBucket = new FirebaseStorageProvider('test-project');
      const storagePath = 'courses/test/images/test.jpg';
      const url = providerWithoutBucket.getPublicUrl(storagePath);

      expect(url).toBe(`https://storage.googleapis.com/test-project.appspot.com/${storagePath}`);
    });
  });
});
