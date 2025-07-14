# Multi-Storage Provider Support for Course Images

This document describes the enhanced course image upload feature that supports multiple storage providers (Firebase Storage and Supabase Storage) with environment-driven configuration.

## Overview

The course image upload API (`/api/courses/images`) has been enhanced to support multiple storage providers through a pluggable architecture. This allows the application to work with different storage services based on configuration.

## Supported Storage Providers

### 1. Firebase Storage
- **Default provider** for existing deployments
- Uses Firebase Admin SDK for server-side operations
- Supports automatic thumbnail generation
- Provides public URL access for uploaded images

### 2. Supabase Storage
- **Alternative provider** for organizations preferring Supabase
- Uses Supabase JavaScript client with service role key
- Supports automatic thumbnail generation
- Provides public URL access for uploaded images

## Architecture

### Storage Provider Interface
```typescript
interface StorageProvider {
  uploadFile(
    file: File,
    storagePath: string,
    thumbnailPath: string,
    processedBuffer: Buffer,
    thumbnailBuffer: Buffer,
    metadata: FileMetadata
  ): Promise<UploadResult>;
  
  deleteFile(storagePath: string): Promise<void>;
  getPublicUrl(storagePath: string): string;
  isConfigured(): boolean;
}
```

### Key Components
- **StorageProvider Interface**: Defines the contract for all storage providers
- **FirebaseStorageProvider**: Implementation for Firebase Storage
- **SupabaseStorageProvider**: Implementation for Supabase Storage
- **StorageFactory**: Factory pattern to create and manage storage providers
- **Environment Configuration**: Drives provider selection via environment variables

## Configuration

### Environment Variables

#### Required for All Configurations
```bash
# Storage provider selection (required)
STORAGE_PROVIDER=firebase  # or 'supabase'
```

#### Firebase Storage Configuration
```bash
# When STORAGE_PROVIDER=firebase
STORAGE_PROVIDER=firebase
NEXT_PUBLIC_FIREBASE_PROJECT_ID=questedu-cb2a4
FIREBASE_PROJECT_ID=questedu-cb2a4

# Optional: Custom storage bucket
# FIREBASE_STORAGE_BUCKET=your-custom-bucket

# Firebase Admin SDK credentials (required for authentication)
NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL=your-firebase-client-email
NEXT_PUBLIC_FIREBASE_PRIVATE_KEY=your-firebase-private-key
```

#### Supabase Storage Configuration
```bash
# When STORAGE_PROVIDER=supabase
STORAGE_PROVIDER=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=course-images

# Firebase credentials still required for authentication and database
NEXT_PUBLIC_FIREBASE_PROJECT_ID=questedu-cb2a4
NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL=your-firebase-client-email
NEXT_PUBLIC_FIREBASE_PRIVATE_KEY=your-firebase-private-key
```

## File Structure

```
lib/storage/
├── index.ts                    # Module exports
├── storage-provider.ts         # Interface definitions
├── firebase-provider.ts        # Firebase Storage implementation
├── supabase-provider.ts        # Supabase Storage implementation
└── storage-factory.ts          # Provider factory and configuration
```

## Usage Examples

### Switching Between Providers

#### Using Firebase Storage
1. Set environment variable: `STORAGE_PROVIDER=firebase`
2. Configure Firebase credentials
3. Restart the application

#### Using Supabase Storage
1. Set environment variable: `STORAGE_PROVIDER=supabase`
2. Configure Supabase credentials
3. Restart the application

### API Endpoints

#### Upload Course Image
```http
POST /api/courses/images
Content-Type: multipart/form-data

{
  "file": [image file],
  "courseId": "course-123",
  "instructorId": "instructor-456",
  "quality": 0.8,
  "maxWidth": 1200,
  "maxHeight": 800
}
```

#### Delete Course Image
```http
DELETE /api/courses/images?storagePath=courses/instructor-456/images/course-123_1642687200000.jpg&courseId=course-123
```

## Features

### Image Processing
- **Automatic resizing**: Images are resized to specified dimensions
- **Quality optimization**: Configurable JPEG quality (0.1-1.0)
- **Thumbnail generation**: Automatic 300x200 thumbnails
- **Format standardization**: All images converted to JPEG

### Security
- **JWT Authentication**: All requests require valid authentication
- **Course ownership validation**: Users can only upload images for their courses
- **File type validation**: Only JPEG, PNG, and WebP files allowed
- **Size limits**: Maximum 5MB file size

### Storage Features
- **Public URL generation**: Automatic public URL creation
- **Metadata storage**: Course and user information stored with files
- **Automatic cleanup**: Thumbnails deleted when main image is deleted

## Error Handling

### Configuration Errors
- Missing `STORAGE_PROVIDER` environment variable
- Invalid provider name
- Missing required credentials
- Storage service unavailable (503 status)

### Upload Errors
- File too large (>5MB)
- Invalid file type
- Missing required parameters
- Course not found
- Insufficient permissions

### Provider-Specific Errors
- Firebase: Authentication failures, bucket access issues
- Supabase: Invalid URL, unauthorized access, bucket not found

## Migration Guide

### From Firebase-Only to Multi-Provider

1. **No Breaking Changes**: Existing Firebase deployments continue to work
2. **Environment Update**: Add `STORAGE_PROVIDER=firebase` to maintain current behavior
3. **Optional Migration**: Switch to Supabase by updating environment variables

### Switching Storage Providers

⚠️ **Important**: Switching storage providers does not migrate existing files. Consider:

1. **Data Migration**: Manually migrate existing files if needed
2. **URL Updates**: Update database records with new storage URLs
3. **Backup**: Ensure files are backed up before switching providers

## Monitoring and Debugging

### Configuration Validation
The system validates storage configuration on startup:

```typescript
const validation = StorageFactory.validateConfiguration();
if (!validation.isValid) {
  console.error('Storage configuration error:', validation.error);
}
```

### Logging
- Configuration errors are logged to console
- Upload/delete operations include detailed error logging
- Provider-specific errors are captured and logged

## Performance Considerations

### Firebase Storage
- **Advantages**: Integrated with Firebase ecosystem, reliable CDN
- **Considerations**: May have higher costs for large volumes

### Supabase Storage
- **Advantages**: Often more cost-effective, simple pricing
- **Considerations**: May require additional setup for CDN optimization

## Security Best Practices

1. **Environment Variables**: Store all credentials in environment variables
2. **Service Keys**: Use service role keys for server-side operations
3. **CORS Configuration**: Configure storage buckets for appropriate CORS settings
4. **Access Control**: Implement proper bucket policies and access controls

## Troubleshooting

### Common Issues

#### "Storage service unavailable" (503 error)
- Check `STORAGE_PROVIDER` environment variable
- Verify required credentials are set
- Ensure storage service is accessible

#### Upload failures
- Verify file size and type requirements
- Check course ownership permissions
- Validate storage bucket configuration

#### Missing thumbnails
- Ensure Sharp library is properly installed
- Check thumbnail path generation logic
- Verify storage provider thumbnail upload

### Debug Steps

1. **Check Configuration**:
   ```bash
   echo $STORAGE_PROVIDER
   ```

2. **Validate Credentials**:
   - Firebase: Test with Firebase Admin SDK
   - Supabase: Test with Supabase client

3. **Test Storage Access**:
   - Verify bucket exists and is accessible
   - Check permissions and policies

## Future Enhancements

### Planned Features
- **AWS S3 Support**: Additional storage provider
- **Storage Migration Tool**: Automated file migration between providers
- **Multiple Provider Support**: Use different providers for different file types
- **CDN Integration**: Automatic CDN setup for optimized delivery

### Configuration Improvements
- **Runtime Provider Switching**: Change providers without restart
- **Provider Health Checks**: Automatic failover capabilities
- **Advanced Caching**: Intelligent caching strategies per provider
