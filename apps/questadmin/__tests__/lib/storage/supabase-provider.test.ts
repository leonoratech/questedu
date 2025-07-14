/**
 * Unit tests for Supabase Storage Provider
 */

import { SupabaseStorageProvider } from '@/lib/storage/supabase-provider';
import { createMockBuffers, createMockFile, createMockMetadata } from './test-utils';

// Mock @supabase/supabase-js
const mockSupabaseClient = {
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(),
      remove: jest.fn(),
      getPublicUrl: jest.fn(),
    })),
  },
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

describe('SupabaseStorageProvider', () => {
  let provider: SupabaseStorageProvider;
  let mockStorageBucket: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock implementations
    mockStorageBucket = {
      upload: jest.fn(),
      remove: jest.fn(),
      getPublicUrl: jest.fn(),
    };
    
    mockSupabaseClient.storage.from.mockReturnValue(mockStorageBucket);
    
    provider = new SupabaseStorageProvider(
      'https://test.supabase.co',
      'test-service-key',
      'test-bucket'
    );
  });

  describe('constructor', () => {
    it('should initialize with required parameters', () => {
      expect(provider).toBeInstanceOf(SupabaseStorageProvider);
      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('test-bucket');
    });
  });

  describe('isConfigured', () => {
    it('should return true when all parameters are provided', () => {
      expect(provider.isConfigured()).toBe(true);
    });

    it('should return false when URL is missing', () => {
      const emptyProvider = new SupabaseStorageProvider('', 'key', 'bucket');
      expect(emptyProvider.isConfigured()).toBe(false);
    });

    it('should return false when service key is missing', () => {
      const emptyProvider = new SupabaseStorageProvider('https://test.supabase.co', '', 'bucket');
      expect(emptyProvider.isConfigured()).toBe(false);
    });

    it('should return false when bucket is missing', () => {
      const emptyProvider = new SupabaseStorageProvider('https://test.supabase.co', 'key', '');
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

      // Mock successful uploads
      mockStorageBucket.upload.mockResolvedValueOnce({
        data: { path: storagePath },
        error: null,
      });
      
      mockStorageBucket.upload.mockResolvedValueOnce({
        data: { path: thumbnailPath },
        error: null,
      });

      // Mock public URL responses
      mockStorageBucket.getPublicUrl
        .mockReturnValueOnce({
          data: { publicUrl: `https://test.supabase.co/storage/v1/object/public/test-bucket/${storagePath}` },
        })
        .mockReturnValueOnce({
          data: { publicUrl: `https://test.supabase.co/storage/v1/object/public/test-bucket/${thumbnailPath}` },
        });

      const result = await provider.uploadFile(
        file,
        storagePath,
        thumbnailPath,
        processedBuffer,
        thumbnailBuffer,
        metadata
      );

      // Verify upload calls
      expect(mockStorageBucket.upload).toHaveBeenCalledWith(storagePath, processedBuffer, {
        contentType: 'image/jpeg',
        metadata: {
          courseId: metadata.courseId,
          instructorId: metadata.instructorId,
          uploadedBy: metadata.uploadedBy,
          uploadedAt: metadata.uploadedAt,
        },
        upsert: true,
      });

      expect(mockStorageBucket.upload).toHaveBeenCalledWith(thumbnailPath, thumbnailBuffer, {
        contentType: 'image/jpeg',
        metadata: {
          courseId: metadata.courseId,
          instructorId: metadata.instructorId,
          uploadedBy: metadata.uploadedBy,
          uploadedAt: metadata.uploadedAt,
        },
        upsert: true,
      });

      // Verify result structure
      expect(result).toEqual({
        url: `https://test.supabase.co/storage/v1/object/public/test-bucket/${storagePath}`,
        fileName: file.name,
        storagePath,
        thumbnailUrl: `https://test.supabase.co/storage/v1/object/public/test-bucket/${thumbnailPath}`,
      });
    });

    it('should handle main image upload errors', async () => {
      mockStorageBucket.upload.mockResolvedValueOnce({
        data: null,
        error: { message: 'Upload failed' },
      });

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
      ).rejects.toThrow('Failed to upload main image: Upload failed');
    });

    it('should handle thumbnail upload errors', async () => {
      // Main upload succeeds
      mockStorageBucket.upload.mockResolvedValueOnce({
        data: { path: 'test/path.jpg' },
        error: null,
      });

      // Thumbnail upload fails
      mockStorageBucket.upload.mockResolvedValueOnce({
        data: null,
        error: { message: 'Thumbnail upload failed' },
      });

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
      ).rejects.toThrow('Failed to upload thumbnail: Thumbnail upload failed');
    });

    it('should handle general upload errors', async () => {
      mockStorageBucket.upload.mockRejectedValueOnce(new Error('Network error'));

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
      ).rejects.toThrow('Failed to upload to Supabase Storage');
    });
  });

  describe('deleteFile', () => {
    it('should delete file and thumbnail successfully', async () => {
      const storagePath = 'courses/test/images/test.jpg';
      const thumbnailPath = 'courses/test/thumbnails/thumb_test.jpg';

      mockStorageBucket.remove.mockResolvedValue({ data: null, error: null });

      await provider.deleteFile(storagePath);

      expect(mockStorageBucket.remove).toHaveBeenCalledWith([storagePath]);
      expect(mockStorageBucket.remove).toHaveBeenCalledWith([thumbnailPath]);
    });

    it('should handle file not found errors gracefully', async () => {
      mockStorageBucket.remove.mockResolvedValue({
        data: null,
        error: { message: 'File not found' },
      });

      await expect(provider.deleteFile('test/path.jpg')).resolves.not.toThrow();
    });

    it('should handle general delete errors', async () => {
      mockStorageBucket.remove.mockRejectedValueOnce(new Error('Storage access denied'));

      await expect(provider.deleteFile('test/path.jpg')).rejects.toThrow(
        'Failed to delete from Supabase Storage'
      );
    });
  });

  describe('getPublicUrl', () => {
    it('should generate correct public URL', () => {
      const storagePath = 'courses/test/images/test.jpg';
      const expectedUrl = `https://test.supabase.co/storage/v1/object/public/test-bucket/${storagePath}`;

      mockStorageBucket.getPublicUrl.mockReturnValue({
        data: { publicUrl: expectedUrl },
      });

      const url = provider.getPublicUrl(storagePath);

      expect(mockStorageBucket.getPublicUrl).toHaveBeenCalledWith(storagePath);
      expect(url).toBe(expectedUrl);
    });
  });
});
