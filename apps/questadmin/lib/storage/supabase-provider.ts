/**
 * Supabase Storage Provider Implementation
 */

import { createClient } from '@supabase/supabase-js';
import { FileMetadata, StorageProvider, UploadResult } from './storage-provider';

export class SupabaseStorageProvider implements StorageProvider {
  private supabaseUrl: string;
  private serviceKey: string;
  private bucketName: string;
  private supabase: ReturnType<typeof createClient>;

  constructor(supabaseUrl: string, serviceKey: string, bucketName: string) {
    this.supabaseUrl = supabaseUrl;
    this.serviceKey = serviceKey;
    this.bucketName = bucketName;
    
    // Initialize Supabase client with service key for admin operations
    this.supabase = createClient(supabaseUrl, serviceKey);
  }

  async uploadFile(
    file: File,
    storagePath: string,
    thumbnailPath: string,
    processedBuffer: Buffer,
    thumbnailBuffer: Buffer,
    metadata: FileMetadata
  ): Promise<UploadResult> {
    try {
      // Upload main image
      const { data: mainUpload, error: mainError } = await this.supabase.storage
        .from(this.bucketName)
        .upload(storagePath, processedBuffer, {
          contentType: 'image/jpeg',
          metadata: {
            courseId: metadata.courseId,
            instructorId: metadata.instructorId,
            uploadedBy: metadata.uploadedBy,
            uploadedAt: metadata.uploadedAt,
          },
          upsert: true,
        });

      if (mainError) {
        console.error('Supabase main image upload error:', mainError);
        throw new Error(`Failed to upload main image: ${mainError.message}`);
      }

      // Upload thumbnail
      const { data: thumbnailUpload, error: thumbnailError } = await this.supabase.storage
        .from(this.bucketName)
        .upload(thumbnailPath, thumbnailBuffer, {
          contentType: 'image/jpeg',
          metadata: {
            courseId: metadata.courseId,
            instructorId: metadata.instructorId,
            uploadedBy: metadata.uploadedBy,
            uploadedAt: metadata.uploadedAt,
          },
          upsert: true,
        });

      if (thumbnailError) {
        console.error('Supabase thumbnail upload error:', thumbnailError);
        throw new Error(`Failed to upload thumbnail: ${thumbnailError.message}`);
      }

      // Get public URLs
      const { data: mainUrlData } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(storagePath);

      const { data: thumbnailUrlData } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(thumbnailPath);

      const result = {
        url: mainUrlData.publicUrl,
        fileName: file.name,
        storagePath,
        thumbnailUrl: thumbnailUrlData.publicUrl,
      };

      console.log('Supabase upload result:', result);
      
      return result;
    } catch (error) {
      console.error('Supabase Storage upload error:', error);
      throw new Error('Failed to upload to Supabase Storage');
    }
  }

  async deleteFile(storagePath: string): Promise<void> {
    try {
      // Delete main file
      const { error: mainError } = await this.supabase.storage
        .from(this.bucketName)
        .remove([storagePath]);

      if (mainError) {
        console.warn('Main file not found or already deleted:', mainError);
      }

      // Delete thumbnail if it exists
      const thumbnailPath = storagePath.replace('/images/', '/thumbnails/').replace(/([^/]+)$/, 'thumb_$1');
      const { error: thumbnailError } = await this.supabase.storage
        .from(this.bucketName)
        .remove([thumbnailPath]);

      if (thumbnailError) {
        console.warn('Could not delete thumbnail:', thumbnailError);
      }
    } catch (error) {
      console.error('Supabase Storage delete error:', error);
      throw new Error('Failed to delete from Supabase Storage');
    }
  }

  getPublicUrl(storagePath: string): string {
    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(storagePath);
    
    return data.publicUrl;
  }

  isConfigured(): boolean {
    return Boolean(this.supabaseUrl && this.serviceKey && this.bucketName);
  }
}
