'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { deleteCourseImage, ImageUploadResult, uploadCourseImageWithProgress, validateImageFile } from '@/data/services/image-upload-service'
import { ImageIcon, Trash2, Upload } from 'lucide-react'
import Image from 'next/image'
import React, { useCallback, useState } from 'react'
import toast from 'react-hot-toast'

interface CourseImageUploadProps {
  courseId?: string
  instructorId: string
  currentImage?: string
  currentImageStoragePath?: string // Add storage path for deletion
  onImageUploaded: (result: ImageUploadResult) => void
  onImageRemoved: () => void
  disabled?: boolean
  className?: string
}

export function CourseImageUpload({
  courseId,
  instructorId,
  currentImage,
  currentImageStoragePath,
  onImageUploaded,
  onImageRemoved,
  disabled = false,
  className = ''
}: CourseImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)

  const handleFileSelect = useCallback(async (file: File) => {
    if (!courseId) {
      toast.error('Course ID is required for image upload')
      return
    }

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file')
      return
    }

    try {
      setUploading(true)
      setUploadProgress(0)

      const result = await uploadCourseImageWithProgress(
        file,
        courseId,
        instructorId,
        (progress) => setUploadProgress(progress),
        {
          quality: 0.8,
          maxWidth: 1200,
          maxHeight: 800
        }
      )

      onImageUploaded(result)
      toast.success('Course image uploaded successfully!')
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to upload image')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [courseId, instructorId, onImageUploaded])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)

    const file = event.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
  }

  const handleRemoveImage = async () => {
    if (currentImage && onImageRemoved) {
      try {
        // If we have storage path and courseId, delete from storage
        if (currentImageStoragePath && courseId) {
          await deleteCourseImage(currentImageStoragePath, courseId)
        }
        
        onImageRemoved()
        toast.success('Course image removed')
      } catch (error: any) {
        console.error('Error removing image:', error)
        toast.error(error.message || 'Failed to remove image')
      }
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Label htmlFor="course-image">Course Image</Label>
      
      {currentImage ? (
        // Show current image with remove option
        <div className="relative group">
          <div className="relative w-full h-48 rounded-lg overflow-hidden border">
            <Image
              src={currentImage}
              alt="Course image"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemoveImage}
                disabled={disabled}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Remove
              </Button>
              <Label htmlFor="course-image-replace">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={disabled}
                  asChild
                >
                  <span>
                    <Upload className="h-4 w-4 mr-1" />
                    Replace
                  </span>
                </Button>
              </Label>
            </div>
          </div>
        </div>
      ) : (
        // Show upload area
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${dragOver ? 'border-primary bg-primary/5' : 'border-gray-300'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary'}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="flex flex-col items-center gap-4">
            <ImageIcon className="h-12 w-12 text-gray-400" />
            <div>
              <p className="text-lg font-medium">Upload Course Image</p>
              <p className="text-sm text-gray-500">
                Drag and drop an image here, or click to browse
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Supported formats: JPEG, PNG, WebP (max 5MB)
              </p>
            </div>
            <Label htmlFor="course-image">
              <Button
                type="button"
                variant="outline"
                disabled={disabled}
                asChild
              >
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Image
                </span>
              </Button>
            </Label>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <Input
        id="course-image"
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={disabled || uploading}
        className="hidden"
      />
      
      {/* Hidden replace file input */}
      {currentImage && (
        <Input
          id="course-image-replace"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={disabled || uploading}
          className="hidden"
        />
      )}

      {/* Upload progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading image...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {/* Guidelines */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Recommended dimensions: 1200x800 pixels</p>
        <p>• Images will be automatically resized and optimized</p>
        <p>• Choose an image that represents your course content</p>
      </div>
    </div>
  )
}
