/**
 * Firebase Storage Provider Implementation
 */

import { getStorage } from 'firebase-admin/storage';
import { FileMetadata, StorageProvider, UploadResult } from './storage-provider';

export class FirebaseStorageProvider implements StorageProvider {
  private projectId: string;
  private bucketName?: string;

  constructor(projectId: string, bucketName?: string) {
    this.projectId = projectId;
    this.bucketName = bucketName;
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
      const storage = getStorage();
      const bucket = this.bucketName ? storage.bucket(this.bucketName) : storage.bucket();

      // Upload main image
      const fileUpload = bucket.file(storagePath);
      await fileUpload.save(processedBuffer, {
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

      // Make file publicly readable
      await fileUpload.makePublic();

      // Upload thumbnail
      const thumbnailUpload = bucket.file(thumbnailPath);
      await thumbnailUpload.save(thumbnailBuffer, {
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

      await thumbnailUpload.makePublic();

      // Generate public URLs
      const imageUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
      const thumbnailUrl = `https://storage.googleapis.com/${bucket.name}/${thumbnailPath}`;

      return {
        url: imageUrl,
        fileName: file.name,
        storagePath,
        thumbnailUrl,
      };
    } catch (error) {
      console.error('Firebase Storage upload error:', error);
      throw new Error('Failed to upload to Firebase Storage');
    }
  }

  async deleteFile(storagePath: string): Promise<void> {
    try {
      const storage = getStorage();
      const bucket = this.bucketName ? storage.bucket(this.bucketName) : storage.bucket();

      // Delete main file
      try {
        await bucket.file(storagePath).delete();
      } catch (error) {
        console.warn('Main file not found or already deleted:', error);
      }

      // Delete thumbnail if it exists
      const thumbnailPath = storagePath.replace('/images/', '/thumbnails/').replace(/([^/]+)$/, 'thumb_$1');
      try {
        await bucket.file(thumbnailPath).delete();
      } catch (thumbnailError) {
        console.warn('Could not delete thumbnail:', thumbnailError);
      }
    } catch (error) {
      console.error('Firebase Storage delete error:', error);
      throw new Error('Failed to delete from Firebase Storage');
    }
  }

  getPublicUrl(storagePath: string): string {
    const bucketName = this.bucketName || `${this.projectId}.appspot.com`;
    return `https://storage.googleapis.com/${bucketName}/${storagePath}`;
  }

  isConfigured(): boolean {
    return Boolean(this.projectId);
  }
}
