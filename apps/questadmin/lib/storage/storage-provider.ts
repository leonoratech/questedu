/**
 * Storage Provider Interface
 * Abstraction layer for different file storage providers
 */

export interface UploadResult {
  url: string;
  fileName: string;
  storagePath: string;
  thumbnailUrl?: string;
}

export interface UploadOptions {
  quality: number;
  maxWidth: number;
  maxHeight: number;
}

export interface FileMetadata {
  courseId: string;
  instructorId: string;
  uploadedBy: string;
  uploadedAt: string;
  imageType?: string;
}

export interface StorageProvider {
  /**
   * Upload a file with thumbnail generation
   */
  uploadFile(
    file: File,
    storagePath: string,
    thumbnailPath: string,
    processedBuffer: Buffer,
    thumbnailBuffer: Buffer,
    metadata: FileMetadata
  ): Promise<UploadResult>;

  /**
   * Delete a file and its thumbnail
   */
  deleteFile(storagePath: string): Promise<void>;

  /**
   * Get public URL for a file
   */
  getPublicUrl(storagePath: string): string;

  /**
   * Check if provider is properly configured
   */
  isConfigured(): boolean;
}

export interface StorageConfig {
  provider: 'firebase' | 'supabase';
  firebase?: {
    projectId: string;
    bucket?: string;
  };
  supabase?: {
    url: string;
    serviceKey: string;
    bucket: string;
  };
}
