'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextImageService } from '@/data/services/rich-text-image-service'
import { ImageIcon, Loader2, Upload, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'react-hot-toast'

interface PortalImageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImageUploaded: (url: string, alt?: string) => void
  courseId?: string
}

interface ImagePreview {
  file: File
  url: string
  width: number
  height: number
}

export function PortalImageDialog({
  open,
  onOpenChange,
  onImageUploaded,
  courseId,
}: PortalImageDialogProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<ImagePreview | null>(null)
  const [altText, setAltText] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const resetState = useCallback(() => {
    setPreview(null)
    setAltText('')
    setIsUploading(false)
  }, [])

  const handleFileSelect = useCallback(async (file: File) => {
    // Validate file
    const validation = RichTextImageService.validateImageFile(file)
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file')
      return
    }

    try {
      // Get image dimensions
      const dimensions = await RichTextImageService.getImageDimensions(file)
      
      // Create preview
      const previewUrl = URL.createObjectURL(file)
      setPreview({
        file,
        url: previewUrl,
        width: dimensions.width,
        height: dimensions.height,
      })
      
      // Set default alt text from filename
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
      setAltText(nameWithoutExt.replace(/[_-]/g, ' '))
    } catch (error) {
      console.error('Error processing image:', error)
      toast.error('Failed to process image')
    }
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleUpload = useCallback(async () => {
    if (!preview) return

    setIsUploading(true)
    try {
      const result = await RichTextImageService.uploadImage(preview.file, {
        courseId,
        quality: 0.85,
        maxWidth: 1200,
        maxHeight: 800,
      })

      onImageUploaded(result.url, altText || undefined)
      toast.success('Image uploaded successfully')
      onOpenChange(false)
      resetState()
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }, [preview, altText, courseId, onImageUploaded, onOpenChange, resetState])

  const handleClose = useCallback(() => {
    if (!isUploading) {
      if (preview) {
        URL.revokeObjectURL(preview.url)
      }
      resetState()
      onOpenChange(false)
    }
  }, [isUploading, preview, resetState, onOpenChange])

  const clearPreview = useCallback(() => {
    if (preview) {
      URL.revokeObjectURL(preview.url)
    }
    setPreview(null)
    setAltText('')
  }, [preview])

  if (!mounted || !open) {
    return null
  }

  const dialogContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-background border border-border rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
            <ImageIcon className="h-5 w-5" />
            Upload Image
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {!preview ? (
            <div 
              className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 rounded-lg p-8 text-center transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2 text-foreground">Drop image here</h3>
              <p className="text-muted-foreground mb-4">or click to select a file</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="portal-image-upload"
              />
              <label htmlFor="portal-image-upload">
                <Button variant="outline" className="cursor-pointer" asChild>
                  <span>Select Image</span>
                </Button>
              </label>
              <p className="text-xs text-muted-foreground mt-4">
                Supports JPEG, PNG, WebP • Max 5MB
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview */}
              <div className="relative border border-border rounded-lg overflow-hidden">
                <img
                  src={preview.url}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={clearPreview}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Image Info */}
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Size:</span>
                  <span>{preview.width} × {preview.height}px</span>
                </div>
                <div className="flex justify-between">
                  <span>File size:</span>
                  <span>{(preview.file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>

              {/* Alt Text */}
              <div className="space-y-2">
                <Label htmlFor="portal-alt-text" className="text-foreground">Alt Text (optional)</Label>
                <Input
                  id="portal-alt-text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe the image for accessibility"
                  disabled={isUploading}
                />
                <p className="text-xs text-muted-foreground">
                  Helps screen readers and improves SEO
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            {preview && (
              <Button
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Insert Image'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(dialogContent, document.body)
}
