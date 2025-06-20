'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Quote,
    Underline as UnderlineIcon
} from 'lucide-react'
import { useCallback, useEffect } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  minHeight?: string
}

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  children: React.ReactNode
  title?: string
}

const ToolbarButton = ({ onClick, isActive, disabled, children, title }: ToolbarButtonProps) => (
  <Button
    type="button"
    variant={isActive ? "default" : "outline"}
    size="sm"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(
      "h-8 w-8 p-0",
      isActive && "bg-primary text-primary-foreground"
    )}
  >
    {children}
  </Button>
)

export function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = "Start typing...", 
  className = "",
  disabled = false,
  minHeight = "120px"
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800'
        }
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none p-3 focus:outline-none',
          'min-h-[120px] border rounded-md border-input bg-background',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        ),
        style: `min-height: ${minHeight}`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editable: !disabled,
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  const setLink = useCallback(() => {
    if (!editor) return
    
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    // cancelled
    if (url === null) {
      return
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <div className="border rounded-md">
      {/* Toolbar */}
      <div className="border-b p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            disabled={disabled}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            disabled={disabled}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            disabled={disabled}
            title="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r pr-2">
          <Button
            type="button"
            variant={editor.isActive('heading', { level: 1 }) ? "default" : "outline"}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            disabled={disabled}
            title="Heading 1"
            className="h-8 px-2 text-xs font-bold"
          >
            H1
          </Button>
          <Button
            type="button"
            variant={editor.isActive('heading', { level: 2 }) ? "default" : "outline"}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            disabled={disabled}
            title="Heading 2"
            className="h-8 px-2 text-xs font-bold"
          >
            H2
          </Button>
          <Button
            type="button"
            variant={editor.isActive('heading', { level: 3 }) ? "default" : "outline"}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            disabled={disabled}
            title="Heading 3"
            className="h-8 px-2 text-xs font-bold"
          >
            H3
          </Button>
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            disabled={disabled}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            disabled={disabled}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Text Alignment */}
        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            disabled={disabled}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            disabled={disabled}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            disabled={disabled}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Additional Features */}
        <div className="flex gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            disabled={disabled}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={setLink}
            isActive={editor.isActive('link')}
            disabled={disabled}
            title="Add Link"
          >
            <LinkIcon className="h-4 w-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent 
        editor={editor} 
        className={cn(
          "rich-text-editor",
          disabled && "pointer-events-none"
        )}
      />
    </div>
  )
}

// Multilingual Rich Text Editor
interface MultilingualRichTextEditorProps {
  value: any // This can be a multilingual text object or string
  onChange: (value: any) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  minHeight?: string
  label?: string
  required?: boolean
}

export function MultilingualRichTextEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  className = "",
  disabled = false,
  minHeight = "120px",
  label,
  required = false
}: MultilingualRichTextEditorProps) {
  // For now, we'll handle this as a simple string
  // This can be extended to support multilingual content later
  const currentContent = typeof value === 'string' ? value : (value?.en || '')
  
  const handleChange = (content: string) => {
    if (typeof value === 'string') {
      onChange(content)
    } else {
      // For multilingual support, update the current language
      onChange({
        ...value,
        en: content // Default to English for now
      })
    }
  }

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">{label}</label>
          {required && <span className="text-red-500">*</span>}
        </div>
      )}
      <RichTextEditor
        content={currentContent}
        onChange={handleChange}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        minHeight={minHeight}
      />
    </div>
  )
}

// Component to display rich text content safely
interface RichTextDisplayProps {
  content: string
  className?: string
}

export function RichTextDisplay({ content, className = "" }: RichTextDisplayProps) {
  return (
    <div 
      className={cn("rich-text-display prose prose-sm max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
