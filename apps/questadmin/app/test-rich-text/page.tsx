'use client'

import { RichTextDisplay, RichTextEditor } from '@/components/RichTextEditor'
import { useState } from 'react'

export default function TestRichTextPage() {
  const [content, setContent] = useState('')

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-8">Rich Text Editor Test</h1>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Rich Text Editor</h2>
        <div className="border rounded-lg p-4">
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Type your rich text content here..."
          />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Preview:</h3>
          <div className="border rounded-lg p-4 bg-gray-50">
            <RichTextDisplay content={content} />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Raw HTML:</h3>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-40">
            {content}
          </pre>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Essay Question Simulation</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Question (Rich Text):</label>
            <RichTextEditor
              content=""
              onChange={() => {}}
              placeholder="Enter your essay question with rich formatting..."
            />
          </div>
        </div>
      </div>
    </div>
  )
}
