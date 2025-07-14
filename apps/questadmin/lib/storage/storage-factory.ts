/**
 * Storage Factory
 * Creates and configures storage providers based on environment configuration
 */

import { FirebaseStorageProvider } from './firebase-provider';
import { StorageConfig, StorageProvider } from './storage-provider';
import { SupabaseStorageProvider } from './supabase-provider';

export class StorageFactory {
  private static instance: StorageProvider | null = null;

  /**
   * Get the configured storage provider instance
   */
  static getStorageProvider(): StorageProvider {
    if (!this.instance) {
      this.instance = this.createStorageProvider();
    }
    return this.instance;
  }

  /**
   * Create storage provider based on environment configuration
   */
  private static createStorageProvider(): StorageProvider {
    const config = this.getStorageConfig();

    switch (config.provider) {
      case 'firebase':
        if (!config.firebase?.projectId) {
          throw new Error('Firebase project ID is required when using Firebase storage');
        }
        return new FirebaseStorageProvider(
          config.firebase.projectId,
          config.firebase.bucket
        );

      case 'supabase':
        if (!config.supabase?.url || !config.supabase?.serviceKey || !config.supabase?.bucket) {
          throw new Error('Supabase URL, service key, and bucket are required when using Supabase storage');
        }
        return new SupabaseStorageProvider(
          config.supabase.url,
          config.supabase.serviceKey,
          config.supabase.bucket
        );

      default:
        throw new Error(`Unsupported storage provider: ${config.provider}`);
    }
  }

  /**
   * Get storage configuration from environment variables
   */
  private static getStorageConfig(): StorageConfig {
    const provider = process.env.STORAGE_PROVIDER as 'firebase' | 'supabase';

    if (!provider) {
      throw new Error('STORAGE_PROVIDER environment variable is required');
    }

    const config: StorageConfig = {
      provider,
    };

    if (provider === 'firebase') {
      config.firebase = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'questedu-cb2a4',
        bucket: process.env.FIREBASE_STORAGE_BUCKET,
      };
    } else if (provider === 'supabase') {
      config.supabase = {
        url: process.env.SUPABASE_URL!,
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        bucket: process.env.SUPABASE_STORAGE_BUCKET || 'course-images',
      };
    }

    return config;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  static reset(): void {
    this.instance = null;
  }

  /**
   * Validate storage configuration
   */
  static validateConfiguration(): { isValid: boolean; error?: string } {
    try {
      const provider = this.getStorageProvider();
      if (!provider.isConfigured()) {
        return {
          isValid: false,
          error: 'Storage provider is not properly configured',
        };
      }
      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown configuration error',
      };
    }
  }
}
