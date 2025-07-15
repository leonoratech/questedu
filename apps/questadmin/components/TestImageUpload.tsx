'use client'

import { Button } from '@/components/ui/button'
import { ImageUploadDialog } from '@/components/ui/image-upload-dialog'
import { useEffect, useState } from 'react'

export function TestImageUpload() {
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleImageUploaded = (url: string, alt?: string) => {
    console.log('Image uploaded:', { url, alt })
    alert(`Image uploaded successfully: ${url}`)
  }

  useEffect(() => {
    console.log('TestImageUpload: dialogOpen changed to:', dialogOpen)
  }, [dialogOpen])

  const handleOpenDialog = () => {
    console.log('Opening dialog...')
    setDialogOpen(true)
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Test Image Upload Dialog</h2>
      <div className="space-y-2">
        <p>Dialog state: {dialogOpen ? 'OPEN' : 'CLOSED'}</p>
        <Button onClick={handleOpenDialog}>
          Open Image Upload Dialog
        </Button>
      </div>
      
      <ImageUploadDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onImageUploaded={handleImageUploaded}
        courseId="test-course-123"
      />
    </div>
  )
}
