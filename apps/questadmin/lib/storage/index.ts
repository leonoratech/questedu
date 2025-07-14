/**
 * Storage Module
 * Exports storage providers and factory
 */

export { FirebaseStorageProvider } from './firebase-provider';
export { StorageFactory } from './storage-factory';
export type { FileMetadata, StorageConfig, StorageProvider, UploadOptions, UploadResult } from './storage-provider';
export { SupabaseStorageProvider } from './supabase-provider';

