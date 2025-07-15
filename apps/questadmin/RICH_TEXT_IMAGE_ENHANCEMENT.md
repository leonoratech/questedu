# Rich Text Editor Enhancement with Image Upload

## Overview

The QuestAdmin application has been enhanced with advanced rich text editing capabilities including image upload functionality for essay questions and answers. This enhancement enables content creators to add rich, multimedia content to short and long essay questions.

## Features Added

### 1. Enhanced Rich Text Editor Component (`/components/RichTextEditor.tsx`)

#### Core Features:
- **Text Formatting**: Bold, italic, underline
- **Headings**: H1, H2, H3 support
- **Lists**: Bullet points and numbered lists
- **Text Alignment**: Left, center, right alignment
- **Links**: URL link insertion
- **Blockquotes**: Quote formatting
- **Image Upload**: Direct image insertion with upload to Supabase

#### Image Upload Features:
- **Drag & Drop**: Drag images directly into the editor
- **File Validation**: Type (JPEG, PNG, WebP) and size (max 5MB) validation
- **Alt Text Support**: Accessibility-friendly alt text input
- **Automatic Resizing**: Images are automatically optimized (max 1200x800px)
- **Thumbnail Generation**: Automatic thumbnail creation (300x200px)
- **Supabase Integration**: Images stored in course-images bucket

### 2. Image Upload Service (`/data/services/rich-text-image-service.ts`)

#### Features:
- **Authentication**: Firebase Auth integration for secure uploads
- **File Validation**: Client-side validation before upload
- **Error Handling**: Comprehensive error messages and handling
- **Dimension Detection**: Automatic image dimension detection
- **Storage Integration**: Uses existing Supabase storage infrastructure

### 3. Image Upload Dialog (`/components/ui/image-upload-dialog.tsx`)

#### Features:
- **Drag & Drop Interface**: Visual drop zone for easy image selection
- **Image Preview**: Preview selected images before upload
- **Progress Feedback**: Upload progress indicators
- **Alt Text Input**: Accessibility alt text configuration
- **File Information**: Display file size and dimensions

### 4. Course Question Manager Integration

#### Enhanced Essay Question Support:
- **Question Text**: Rich text editor with image support for essay questions
- **Answer Text**: Rich text editor with image support for model answers
- **Multilingual Support**: Works with both single and multilingual content
- **Course Context**: Images uploaded with course association

## Technical Implementation

### Dependencies Added:
```json
{
  "@tiptap/extension-image": "^2.14.1"
}
```

### Configuration Updates:

#### Next.js Image Configuration (`next.config.js`):
```javascript
{
  protocol: 'https',
  hostname: 'vzocbuwdtzlfcgzujwbd.supabase.co',
  port: '',
  pathname: '/storage/v1/object/public/**',
}
```

### API Integration:
- Uses existing `/api/courses/images` endpoint
- Supports temporary course IDs for new course creation
- Maintains security with user authentication
- Handles both image upload and deletion

## Usage Examples

### Basic Rich Text Editor:
```tsx
<RichTextEditor
  content={content}
  onChange={setContent}
  placeholder="Start typing..."
  minHeight="200px"
/>
```

### Enhanced Rich Text Editor with Images:
```tsx
<RichTextEditor
  content={content}
  onChange={setContent}
  placeholder="Start typing and add images..."
  minHeight="300px"
  enableImages={true}
  courseId="course-123"
/>
```

### Multilingual Rich Text Editor:
```tsx
<MultilingualRichTextEditor
  value={content}
  onChange={setContent}
  placeholder="Write your content..."
  label="Content"
  enableImages={true}
  courseId="course-123"
/>
```

## File Structure

```
components/
├── RichTextEditor.tsx          # Main rich text editor component
└── ui/
    └── image-upload-dialog.tsx # Image upload dialog component

data/services/
└── rich-text-image-service.ts  # Image upload service

app/
├── test-rich-text/
│   └── page.tsx               # Test page for rich text features
└── api/courses/images/
    └── route.ts              # Image upload API (enhanced)
```

## Integration Points

### 1. Course Question Creation
- **Short Essay Questions**: Rich text with image support
- **Long Essay Questions**: Rich text with image support
- **Model Answers**: Rich text for grading guidelines

### 2. Course Content Creation
- **Course Descriptions**: Enhanced with rich text capabilities
- **Learning Materials**: Support for multimedia content
- **Instructions**: Rich formatting for better clarity

### 3. Multi-language Support
- **Content Localization**: Rich text content in multiple languages
- **Image Alt Text**: Multilingual alt text support
- **Consistent UI**: Same rich editing experience across languages

## Security & Validation

### Client-Side Validation:
- File type validation (JPEG, PNG, WebP only)
- File size limits (5MB maximum)
- Image dimension validation

### Server-Side Security:
- Firebase Authentication required
- Course ownership validation
- Temporary course ID support for creation flow
- Supabase RLS policies enforced

### Image Processing:
- Automatic image optimization using Sharp
- Consistent image sizing and quality
- Thumbnail generation for performance
- WebP conversion for better compression

## Testing

### Test Page Available:
- URL: `/test-rich-text`
- Features: Live demonstration of all rich text capabilities
- Examples: Basic editor, image-enabled editor, essay question editor

### Test Cases:
1. **Image Upload Flow**: Drag & drop functionality
2. **Text Formatting**: All formatting options
3. **Multilingual Content**: Language switching
4. **Course Integration**: Question creation with images
5. **Error Handling**: Invalid file types and sizes

## Performance Considerations

### Image Optimization:
- Automatic resizing to prevent large uploads
- JPEG quality optimization (85%)
- Thumbnail generation for quick previews
- Next.js Image component optimization

### Lazy Loading:
- Rich text editor components loaded on demand
- Image dialog loaded only when needed
- Efficient bundle splitting

### Storage Efficiency:
- Supabase CDN for fast image delivery
- Optimized image formats
- Proper image paths for Next.js optimization

## Future Enhancements

### Planned Features:
1. **Image Editing**: In-editor image crop and resize
2. **Image Gallery**: Reuse uploaded images across content
3. **Advanced Formatting**: Tables, code blocks, math equations
4. **Collaborative Editing**: Real-time collaboration features
5. **Version History**: Content revision tracking

### Accessibility Improvements:
1. **Screen Reader Support**: Enhanced ARIA labels
2. **Keyboard Navigation**: Full keyboard accessibility
3. **High Contrast Mode**: Better visual accessibility
4. **Font Size Options**: Adjustable text sizing

## Troubleshooting

### Common Issues:

#### Image Upload Fails:
- Check Supabase configuration in `.env.local`
- Verify user authentication status
- Ensure file type and size are valid

#### Rich Text Not Saving:
- Check form validation
- Verify content length limits
- Ensure required fields are filled

#### Images Not Displaying:
- Verify Next.js image configuration
- Check Supabase storage permissions
- Ensure proper image URLs

### Debug Information:
- Check browser console for detailed error messages
- Monitor network tab for upload progress
- Verify API response format

## Conclusion

The enhanced rich text editor provides a comprehensive solution for creating rich, multimedia content in the QuestAdmin application. With support for images, advanced formatting, and multilingual content, content creators can now build more engaging and effective educational materials.

The implementation maintains security best practices while providing a user-friendly interface that integrates seamlessly with the existing course management workflow.
