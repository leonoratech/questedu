'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageIcon, Loader2, Upload, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { toast } from 'react-hot-toast'

interface DirectImageUploadProps {
  onImageUploaded: (url: string, alt?: string) => void
  courseId?: string
}

export function DirectImageUpload({
  onImageUploaded,
  courseId,
}: DirectImageUploadProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [altText, setAltText] = useState('')

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    const previewUrl = URL.createObjectURL(file)
    setPreview(previewUrl)
    setAltText(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '))
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  const handleUpload = useCallback(async () => {
    // Mock upload for testing
    setIsUploading(true)
    setTimeout(() => {
      const mockUrl = 'https://example.com/mock-image.jpg'
      onImageUploaded(mockUrl, altText || undefined)
      toast.success('Image uploaded successfully')
      setIsVisible(false)
      setPreview(null)
      setAltText('')
      setIsUploading(false)
    }, 2000)
  }, [altText, onImageUploaded])

  if (!isVisible) {
    return (
      <Button onClick={() => setIsVisible(true)} variant="outline" size="sm">
        <ImageIcon className="h-4 w-4 mr-2" />
        Upload Image (Direct)
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Upload Image</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {!preview ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h4 className="text-lg font-medium mb-2">Drop image here</h4>
            <p className="text-gray-500 mb-4">or click to select a file</p>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="direct-image-upload"
            />
            <Label htmlFor="direct-image-upload" asChild>
              <Button variant="outline" className="cursor-pointer">
                Select Image
              </Button>
            </Label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative border rounded-lg overflow-hidden">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  URL.revokeObjectURL(preview)
                  setPreview(null)
                  setAltText('')
                }}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="direct-alt-text">Alt Text (optional)</Label>
              <Input
                id="direct-alt-text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Describe the image for accessibility"
                disabled={isUploading}
              />
            </div>
          </div>
        )}

        {preview && (
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsVisible(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
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
          </div>
        )}
      </div>
    </div>
  )
}
