// Test validation for essay questions
const { z } = require('zod');

// Replicate the validation schema
const CreateCourseQuestionSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  topicId: z.string().optional(),
  question: z.string().max(1000).optional(), // Made optional since essay questions can use questionRichText instead
  questionRichText: z.string().max(5000).optional(), // For rich text content in essay questions
  type: z.enum(['multiple_choice', 'true_false', 'fill_blank', 'short_essay', 'long_essay']),
  options: z.array(z.string().max(200)).optional(),
  correctAnswer: z.union([z.string(), z.array(z.string())]).optional(),
  explanation: z.string().max(1000).optional(),
  explanationRichText: z.string().max(5000).optional(), // For rich text explanations in essay questions
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  marks: z.number().min(1).max(100).default(1),
  timeLimit: z.number().min(30).max(3600).optional(), // seconds
  order: z.number().min(0).default(0),
  isPublished: z.boolean().default(false),
  tags: z.array(z.string().max(50)).default([]),
  flags: z.object({
    important: z.boolean(),
    frequently_asked: z.boolean(),
    practical: z.boolean(),
    conceptual: z.boolean()
  }).default({
    important: false,
    frequently_asked: false,
    practical: false,
    conceptual: false
  }),
  category: z.string().max(100).optional(),
  createdBy: z.string().min(1, 'Created by is required')
}).refine((data) => {
  // For essay questions, require either question or questionRichText
  if (data.type === 'short_essay' || data.type === 'long_essay') {
    const hasQuestion = data.question && data.question.trim().length > 0;
    const hasQuestionRichText = data.questionRichText && data.questionRichText.trim().length > 0;
    return hasQuestion || hasQuestionRichText;
  }
  // For non-essay questions, require question field
  if (data.type === 'multiple_choice' || data.type === 'true_false' || data.type === 'fill_blank') {
    if (!data.question || data.question.trim().length === 0) {
      return false;
    }
  }
  // For multiple choice questions, require options
  if (data.type === 'multiple_choice') {
    return data.options && data.options.length >= 2;
  }
  // For true/false questions, require correctAnswer
  if (data.type === 'true_false') {
    return data.correctAnswer && (data.correctAnswer === 'true' || data.correctAnswer === 'false');
  }
  return true;
}, {
  message: "Invalid question configuration for the selected type",
});

// Test data from the user's payload
const testData = {
  "courseId": "IlJoM27WwTi6doCl0M0P",
  "question": "",
  "questionRichText": "<p>Helllo Question I</p>",
  "type": "short_essay",
  "marks": 1,
  "difficulty": "easy",
  "correctAnswer": "",
  "explanation": "",
  "explanationRichText": "<p>Answer me</p>",
  "tags": [],
  "flags": {
    "important": true,
    "frequently_asked": false,
    "practical": false,
    "conceptual": false
  },
  "category": "",
  "isPublished": true,
  "order": 35,
  "createdBy": "test-user"
};

console.log('Testing validation with payload:', JSON.stringify(testData, null, 2));

try {
  const result = CreateCourseQuestionSchema.parse(testData);
  console.log('✅ Validation passed!');
  console.log('Parsed result:', JSON.stringify(result, null, 2));
} catch (error) {
  console.log('❌ Validation failed:');
  console.log(error.errors || error.message);
}
