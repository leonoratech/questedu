'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextImageService } from '@/data/services/rich-text-image-service'
import { cn } from '@/lib/utils'
import { ImageIcon, Loader2, Upload, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { toast } from 'react-hot-toast'

interface ImageUploadDialogProps {
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

export function ImageUploadDialog({
  open,
  onOpenChange,
  onImageUploaded,
  courseId,
}: ImageUploadDialogProps) {
  console.log('ImageUploadDialog render:', { open, courseId })
  
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<ImagePreview | null>(null)
  const [altText, setAltText] = useState('')
  const [dragActive, setDragActive] = useState(false)

  const resetState = useCallback(() => {
    setPreview(null)
    setAltText('')
    setIsUploading(false)
    setDragActive(false)
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
    setDragActive(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file)
    } else {
      toast.error('Please drop an image file')
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Upload Image
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!preview ? (
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                dragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Drop image here</h3>
              <p className="text-muted-foreground mb-4">
                or click to select a file
              </p>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="image-upload"
              />
              <Label htmlFor="image-upload" asChild>
                <Button variant="outline" className="cursor-pointer">
                  Select Image
                </Button>
              </Label>
              <p className="text-xs text-muted-foreground mt-4">
                Supports JPEG, PNG, WebP • Max 5MB
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview */}
              <div className="relative border rounded-lg overflow-hidden">
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
                <Label htmlFor="alt-text">Alt Text (optional)</Label>
                <Input
                  id="alt-text"
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
          <div className="flex justify-end gap-3">
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
      </DialogContent>
    </Dialog>
  )
}
