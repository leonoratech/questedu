/**
 * Unit tests for Storage Factory
 */

import { FirebaseStorageProvider } from '@/lib/storage/firebase-provider';
import { StorageFactory } from '@/lib/storage/storage-factory';
import { SupabaseStorageProvider } from '@/lib/storage/supabase-provider';

// Mock the provider modules
jest.mock('@/lib/storage/firebase-provider');
jest.mock('@/lib/storage/supabase-provider');

// Mock firebase-admin/storage
jest.mock('firebase-admin/storage', () => ({
  getStorage: jest.fn(() => ({
    bucket: jest.fn(() => ({
      file: jest.fn(),
    })),
  })),
}));

// Mock @supabase/supabase-js
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        remove: jest.fn(),
        getPublicUrl: jest.fn(),
      })),
    },
  })),
}));

describe('StorageFactory', () => {
  beforeEach(() => {
    // Reset the singleton instance before each test
    StorageFactory.reset();
    
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset environment variables
    delete process.env.STORAGE_PROVIDER;
    delete process.env.FIREBASE_PROJECT_ID;
    delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    delete process.env.FIREBASE_STORAGE_BUCKET;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_STORAGE_BUCKET;
  });

  describe('getStorageProvider', () => {
    it('should return singleton instance', () => {
      process.env.STORAGE_PROVIDER = 'firebase';
      process.env.FIREBASE_PROJECT_ID = 'test-project';

      const provider1 = StorageFactory.getStorageProvider();
      const provider2 = StorageFactory.getStorageProvider();

      expect(provider1).toBe(provider2);
    });

    it('should create new instance after reset', () => {
      process.env.STORAGE_PROVIDER = 'firebase';
      process.env.FIREBASE_PROJECT_ID = 'test-project';

      const provider1 = StorageFactory.getStorageProvider();
      StorageFactory.reset();
      const provider2 = StorageFactory.getStorageProvider();

      expect(provider1).not.toBe(provider2);
    });
  });

  describe('Firebase provider creation', () => {
    it('should create Firebase provider with project ID from FIREBASE_PROJECT_ID', () => {
      process.env.STORAGE_PROVIDER = 'firebase';
      process.env.FIREBASE_PROJECT_ID = 'test-project';

      StorageFactory.getStorageProvider();

      expect(FirebaseStorageProvider).toHaveBeenCalledWith('test-project', undefined);
    });

    it('should create Firebase provider with project ID from NEXT_PUBLIC_FIREBASE_PROJECT_ID', () => {
      process.env.STORAGE_PROVIDER = 'firebase';
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'next-project';

      StorageFactory.getStorageProvider();

      expect(FirebaseStorageProvider).toHaveBeenCalledWith('next-project', undefined);
    });

    it('should prefer FIREBASE_PROJECT_ID over NEXT_PUBLIC_FIREBASE_PROJECT_ID', () => {
      process.env.STORAGE_PROVIDER = 'firebase';
      process.env.FIREBASE_PROJECT_ID = 'main-project';
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'next-project';

      StorageFactory.getStorageProvider();

      expect(FirebaseStorageProvider).toHaveBeenCalledWith('main-project', undefined);
    });

    it('should use default project ID when none provided', () => {
      process.env.STORAGE_PROVIDER = 'firebase';

      StorageFactory.getStorageProvider();

      expect(FirebaseStorageProvider).toHaveBeenCalledWith('leonora-c9f8b', undefined);
    });

    it('should create Firebase provider with custom bucket', () => {
      process.env.STORAGE_PROVIDER = 'firebase';
      process.env.FIREBASE_PROJECT_ID = 'test-project';
      process.env.FIREBASE_STORAGE_BUCKET = 'custom-bucket';

      StorageFactory.getStorageProvider();

      expect(FirebaseStorageProvider).toHaveBeenCalledWith('test-project', 'custom-bucket');
    });

    it('should throw error when Firebase project ID is missing', () => {
      process.env.STORAGE_PROVIDER = 'firebase';
      // Explicitly set all Firebase env vars to empty
      process.env.FIREBASE_PROJECT_ID = '';
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = '';

      expect(() => StorageFactory.getStorageProvider()).toThrow(
        'Firebase project ID is required when using Firebase storage'
      );
    });
  });

  describe('Supabase provider creation', () => {
    it('should create Supabase provider with all required parameters', () => {
      process.env.STORAGE_PROVIDER = 'supabase';
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
      process.env.SUPABASE_STORAGE_BUCKET = 'test-bucket';

      StorageFactory.getStorageProvider();

      expect(SupabaseStorageProvider).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-service-key',
        'test-bucket'
      );
    });

    it('should use default bucket name when not provided', () => {
      process.env.STORAGE_PROVIDER = 'supabase';
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';

      StorageFactory.getStorageProvider();

      expect(SupabaseStorageProvider).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-service-key',
        'course-images'
      );
    });

    it('should throw error when Supabase URL is missing', () => {
      process.env.STORAGE_PROVIDER = 'supabase';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
      process.env.SUPABASE_STORAGE_BUCKET = 'test-bucket';

      expect(() => StorageFactory.getStorageProvider()).toThrow(
        'Supabase URL, service key, and bucket are required when using Supabase storage'
      );
    });

    it('should throw error when Supabase service key is missing', () => {
      process.env.STORAGE_PROVIDER = 'supabase';
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_STORAGE_BUCKET = 'test-bucket';

      expect(() => StorageFactory.getStorageProvider()).toThrow(
        'Supabase URL, service key, and bucket are required when using Supabase storage'
      );
    });
  });

  describe('Error handling', () => {
    it('should throw error when STORAGE_PROVIDER is not set', () => {
      expect(() => StorageFactory.getStorageProvider()).toThrow(
        'STORAGE_PROVIDER environment variable is required'
      );
    });

    it('should throw error for unsupported storage provider', () => {
      process.env.STORAGE_PROVIDER = 'aws-s3' as any;

      expect(() => StorageFactory.getStorageProvider()).toThrow(
        'Unsupported storage provider: aws-s3'
      );
    });
  });

  describe('validateConfiguration', () => {
    it('should return valid for properly configured Firebase provider', () => {
      process.env.STORAGE_PROVIDER = 'firebase';
      process.env.FIREBASE_PROJECT_ID = 'test-project';

      // Mock the provider to return configured = true
      const mockProvider = {
        isConfigured: jest.fn().mockReturnValue(true),
      };
      (FirebaseStorageProvider as jest.Mock).mockImplementation(() => mockProvider);

      const result = StorageFactory.validateConfiguration();

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return invalid for unconfigured provider', () => {
      process.env.STORAGE_PROVIDER = 'firebase';
      process.env.FIREBASE_PROJECT_ID = 'test-project';

      // Mock the provider to return configured = false
      const mockProvider = {
        isConfigured: jest.fn().mockReturnValue(false),
      };
      (FirebaseStorageProvider as jest.Mock).mockImplementation(() => mockProvider);

      const result = StorageFactory.validateConfiguration();

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Storage provider is not properly configured');
    });

    it('should return invalid with error message when provider creation fails', () => {
      process.env.STORAGE_PROVIDER = 'firebase';
      // Missing project ID will cause creation to fail

      const result = StorageFactory.validateConfiguration();

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Firebase project ID is required');
    });

    it('should handle unknown errors gracefully', () => {
      process.env.STORAGE_PROVIDER = 'firebase';
      process.env.FIREBASE_PROJECT_ID = 'test-project';

      // Mock provider creation to throw unknown error
      (FirebaseStorageProvider as jest.Mock).mockImplementation(() => {
        throw 'Unknown error type';
      });

      const result = StorageFactory.validateConfiguration();

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Unknown configuration error');
    });
  });
});
