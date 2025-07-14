/**
 * Interface compliance tests for storage providers
 * Tests that both providers implement the StorageProvider interface correctly
 */

import { FirebaseStorageProvider } from '@/lib/storage/firebase-provider';
import { StorageProvider } from '@/lib/storage/storage-provider';
import { SupabaseStorageProvider } from '@/lib/storage/supabase-provider';
import { createMockBuffers, createMockFile, createMockMetadata } from './test-utils';

// Mock external dependencies
jest.mock('firebase-admin/storage', () => ({
  getStorage: jest.fn(() => ({
    bucket: jest.fn(() => ({
      file: jest.fn(() => ({
        save: jest.fn().mockResolvedValue(undefined),
        makePublic: jest.fn().mockResolvedValue(undefined),
        delete: jest.fn().mockResolvedValue(undefined),
      })),
      name: 'test-bucket',
    })),
  })),
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn().mockResolvedValue({
          data: { path: 'test/path' },
          error: null,
        }),
        remove: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: 'https://test.supabase.co/storage/test/path' },
        }),
      })),
    },
  })),
}));

describe('StorageProvider Interface Compliance', () => {
  const providers: Array<{
    name: string;
    create: () => StorageProvider;
  }> = [
    {
      name: 'FirebaseStorageProvider',
      create: () => new FirebaseStorageProvider('test-project', 'test-bucket'),
    },
    {
      name: 'SupabaseStorageProvider',
      create: () => new SupabaseStorageProvider(
        'https://test.supabase.co',
        'test-service-key',
        'test-bucket'
      ),
    },
  ];

  providers.forEach(({ name, create }) => {
    describe(`${name} Interface Compliance`, () => {
      let provider: StorageProvider;

      beforeEach(() => {
        jest.clearAllMocks();
        provider = create();
      });

      it('should implement StorageProvider interface', () => {
        expect(provider).toBeDefined();
        expect(typeof provider.uploadFile).toBe('function');
        expect(typeof provider.deleteFile).toBe('function');
        expect(typeof provider.getPublicUrl).toBe('function');
        expect(typeof provider.isConfigured).toBe('function');
      });

      it('should have uploadFile method with correct signature', async () => {
        const file = createMockFile();
        const metadata = createMockMetadata();
        const { processedBuffer, thumbnailBuffer } = createMockBuffers();

        const result = await provider.uploadFile(
          file,
          'test/path.jpg',
          'test/thumb.jpg',
          processedBuffer,
          thumbnailBuffer,
          metadata
        );

        expect(result).toBeDefined();
        expect(typeof result.url).toBe('string');
        expect(typeof result.fileName).toBe('string');
        expect(typeof result.storagePath).toBe('string');
        expect(result.thumbnailUrl).toBeDefined();
        expect(typeof result.thumbnailUrl).toBe('string');
      });

      it('should have deleteFile method that accepts string path', async () => {
        await expect(provider.deleteFile('test/path.jpg')).resolves.not.toThrow();
      });

      it('should have getPublicUrl method that returns string', () => {
        const url = provider.getPublicUrl('test/path.jpg');
        expect(typeof url).toBe('string');
        expect(url.length).toBeGreaterThan(0);
      });

      it('should have isConfigured method that returns boolean', () => {
        const configured = provider.isConfigured();
        expect(typeof configured).toBe('boolean');
      });

      it('should return proper UploadResult structure', async () => {
        const file = createMockFile();
        const metadata = createMockMetadata();
        const { processedBuffer, thumbnailBuffer } = createMockBuffers();

        const result = await provider.uploadFile(
          file,
          'courses/test/images/test.jpg',
          'courses/test/thumbnails/thumb_test.jpg',
          processedBuffer,
          thumbnailBuffer,
          metadata
        );

        // Check all required properties exist
        expect(result).toHaveProperty('url');
        expect(result).toHaveProperty('fileName');
        expect(result).toHaveProperty('storagePath');

        // Check optional property exists
        expect(result).toHaveProperty('thumbnailUrl');

        // Verify types
        expect(typeof result.url).toBe('string');
        expect(typeof result.fileName).toBe('string');
        expect(typeof result.storagePath).toBe('string');
        expect(typeof result.thumbnailUrl).toBe('string');

        // Verify values make sense
        expect(result.url).toContain('test.jpg');
        expect(result.fileName).toBe(file.name);
        expect(result.storagePath).toBe('courses/test/images/test.jpg');
        expect(result.thumbnailUrl).toContain('thumb_test.jpg');
      });

      it('should handle metadata correctly in uploadFile', async () => {
        const file = createMockFile();
        const metadata = createMockMetadata();
        const { processedBuffer, thumbnailBuffer } = createMockBuffers();

        // This should not throw and should accept the metadata
        await expect(
          provider.uploadFile(
            file,
            'test/path.jpg',
            'test/thumb.jpg',
            processedBuffer,
            thumbnailBuffer,
            metadata
          )
        ).resolves.toBeDefined();
      });

      it('should handle file buffers correctly', async () => {
        const file = createMockFile();
        const metadata = createMockMetadata();
        const { processedBuffer, thumbnailBuffer } = createMockBuffers();

        // Should accept Buffer objects for both main and thumbnail
        await expect(
          provider.uploadFile(
            file,
            'test/path.jpg',
            'test/thumb.jpg',
            processedBuffer,
            thumbnailBuffer,
            metadata
          )
        ).resolves.toBeDefined();
      });
    });
  });

  describe('Provider Consistency', () => {
    let firebaseProvider: StorageProvider;
    let supabaseProvider: StorageProvider;

    beforeEach(() => {
      jest.clearAllMocks();
      firebaseProvider = new FirebaseStorageProvider('test-project', 'test-bucket');
      supabaseProvider = new SupabaseStorageProvider(
        'https://test.supabase.co',
        'test-service-key',
        'test-bucket'
      );
    });

    it('should both implement the same interface methods', () => {
      const firebaseMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(firebaseProvider))
        .filter(name => typeof (firebaseProvider as any)[name] === 'function' && name !== 'constructor')
        .sort();

      const supabaseMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(supabaseProvider))
        .filter(name => typeof (supabaseProvider as any)[name] === 'function' && name !== 'constructor')
        .sort();

      expect(firebaseMethods).toEqual(supabaseMethods);
    });

    it('should return consistent result structures from uploadFile', async () => {
      const file = createMockFile();
      const metadata = createMockMetadata();
      const { processedBuffer, thumbnailBuffer } = createMockBuffers();

      const firebaseResult = await firebaseProvider.uploadFile(
        file,
        'test/path.jpg',
        'test/thumb.jpg',
        processedBuffer,
        thumbnailBuffer,
        metadata
      );

      const supabaseResult = await supabaseProvider.uploadFile(
        file,
        'test/path.jpg',
        'test/thumb.jpg',
        processedBuffer,
        thumbnailBuffer,
        metadata
      );

      // Both should have the same property structure
      expect(Object.keys(firebaseResult).sort()).toEqual(Object.keys(supabaseResult).sort());

      // Both should have the same types for each property
      Object.keys(firebaseResult).forEach(key => {
        expect(typeof (firebaseResult as any)[key]).toBe(typeof (supabaseResult as any)[key]);
      });
    });

    it('should both handle getPublicUrl consistently', () => {
      const path = 'test/image.jpg';
      
      const firebaseUrl = firebaseProvider.getPublicUrl(path);
      const supabaseUrl = supabaseProvider.getPublicUrl(path);

      expect(typeof firebaseUrl).toBe('string');
      expect(typeof supabaseUrl).toBe('string');
      expect(firebaseUrl.length).toBeGreaterThan(0);
      expect(supabaseUrl.length).toBeGreaterThan(0);
      
      // Both should contain the path
      expect(firebaseUrl).toContain(path);
      expect(supabaseUrl).toContain(path);
    });

    it('should both handle isConfigured consistently', () => {
      const firebaseConfigured = firebaseProvider.isConfigured();
      const supabaseConfigured = supabaseProvider.isConfigured();

      expect(typeof firebaseConfigured).toBe('boolean');
      expect(typeof supabaseConfigured).toBe('boolean');
    });
  });
});
