'use client'

import { DirectImageUpload } from '@/components/DirectImageUpload'
import { MultilingualRichTextEditor, RichTextDisplay, RichTextEditor } from '@/components/RichTextEditor'
import { SimpleDialogTest } from '@/components/SimpleDialogTest'
import { TestImageUpload } from '@/components/TestImageUpload'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'

export default function TestRichTextPage() {
  const [basicContent, setBasicContent] = useState('<p>This is a basic rich text editor. You can add <strong>bold</strong>, <em>italic</em>, and other formatting.</p>')
  const [imageContent, setImageContent] = useState('<p>This is an enhanced rich text editor with image support. Click the image icon in the toolbar to upload images!</p>')
  const [essayContent, setEssayContent] = useState('')

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">Rich Text Editor Test</h1>
        <p className="text-muted-foreground mb-8">
          Testing the enhanced rich text editors with image upload functionality for short essays and long essays.
        </p>
      </div>

      {/* Test Image Upload Dialog Directly */}
      <Card>
        <CardHeader>
          <CardTitle>Direct Image Upload Dialog Test</CardTitle>
          <CardDescription>
            Test the image upload dialog component directly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TestImageUpload />
          <div className="mt-6 pt-6 border-t">
            <SimpleDialogTest />
          </div>
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium mb-2">Direct Image Upload Test:</h4>
            <DirectImageUpload
              onImageUploaded={(url, alt) => {
                console.log('Direct upload result:', { url, alt })
                alert(`Direct upload successful: ${url}`)
              }}
              courseId="test-course-123"
            />
          </div>
        </CardContent>
      </Card>

      {/* Basic Rich Text Editor */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Rich Text Editor</CardTitle>
          <CardDescription>
            Standard rich text editor without image support
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RichTextEditor
            content={basicContent}
            onChange={setBasicContent}
            placeholder="Start typing your content..."
            minHeight="200px"
          />
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Preview:</h4>
            <RichTextDisplay content={basicContent} />
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Rich Text Editor with Images */}
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Rich Text Editor with Image Support</CardTitle>
          <CardDescription>
            Rich text editor with image upload functionality for course content creation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RichTextEditor
            content={imageContent}
            onChange={setImageContent}
            placeholder="Start typing your content and add images..."
            minHeight="300px"
            enableImages={true}
            courseId="test-course-123"
          />
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Preview:</h4>
            <RichTextDisplay content={imageContent} />
          </div>
        </CardContent>
      </Card>

      {/* Essay Question Rich Text Editor */}
      <Card>
        <CardHeader>
          <CardTitle>Essay Question Editor</CardTitle>
          <CardDescription>
            Multilingual rich text editor suitable for short_essay and long_essay questions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <MultilingualRichTextEditor
            value={essayContent}
            onChange={setEssayContent}
            placeholder="Write your essay question or content..."
            label="Essay Content"
            minHeight="250px"
            enableImages={true}
            courseId="test-course-123"
          />
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Preview:</h4>
            <RichTextDisplay content={essayContent} />
          </div>
        </CardContent>
      </Card>

      {/* Feature Information */}
      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Text Formatting</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Bold, italic, underline</li>
                <li>• Headings (H1, H2, H3)</li>
                <li>• Bullet and numbered lists</li>
                <li>• Text alignment (left, center, right)</li>
                <li>• Blockquotes</li>
                <li>• Links</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Image Support</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Drag & drop image upload</li>
                <li>• Supabase storage integration</li>
                <li>• Image validation (type, size)</li>
                <li>• Alt text for accessibility</li>
                <li>• Automatic image resizing</li>
                <li>• Next.js Image optimization</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use Image Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm">
            <li>1. Click the image icon (📷) in the editor toolbar</li>
            <li>2. Either drag & drop an image or click "Select Image"</li>
            <li>3. Add optional alt text for accessibility</li>
            <li>4. Click "Insert Image" to upload and embed the image</li>
            <li>5. The image will be uploaded to Supabase and inserted into your content</li>
          </ol>
          <div className="mt-4 p-3 bg-muted rounded-md">
            <p className="text-sm">
              <strong>Note:</strong> Images are uploaded to the Supabase storage bucket and optimized automatically. 
              Supported formats: JPEG, PNG, WebP (max 5MB).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
