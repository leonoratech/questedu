const { z } = require('zod');

// Import validation schema
const courseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  instructor: z.string().min(1, 'Instructor is required'),
  category: z.string().min(1, 'Category is required'),
  level: z.enum(['beginner', 'intermediate', 'advanced'], {
    errorMap: () => ({ message: "Level must be 'beginner', 'intermediate', or 'advanced'" })
  }),
  price: z.number().min(0, 'Price must be non-negative'),
  duration: z.number().min(0, 'Duration must be non-negative'),
  instructorId: z.string().min(1, 'Instructor ID is required')
});

console.log('=== Final Validation Test ===\n');

// Test 1: Valid course data (new format)
console.log('Test 1: Valid course data (new format)');
const validCourse = {
  title: 'Introduction to React',
  description: 'Learn React fundamentals',
  instructor: 'John Doe',
  category: 'Technology',
  level: 'beginner',
  price: 99.99,
  duration: 40, // number
  instructorId: 'instructor123'
};

try {
  const result = courseSchema.parse(validCourse);
  console.log('✅ PASS: Valid course data accepted');
  console.log('Parsed data:', result);
} catch (error) {
  console.log('❌ FAIL: Valid course data rejected');
  console.log('Error:', error.issues);
}

console.log('\n---\n');

// Test 2: Invalid course data (old format with string duration)
console.log('Test 2: Invalid course data (old format with string duration)');
const invalidCourse = {
  title: 'Introduction to React',
  description: 'Learn React fundamentals',
  instructor: 'John Doe',
  category: 'Technology',
  level: 'beginner',
  price: 99.99,
  duration: '40 hours', // string - should fail
  instructorId: 'instructor123'
};

try {
  const result = courseSchema.parse(invalidCourse);
  console.log('❌ FAIL: Invalid course data accepted (should have been rejected)');
  console.log('Parsed data:', result);
} catch (error) {
  console.log('✅ PASS: Invalid course data correctly rejected');
  console.log('Error:', error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`));
}

console.log('\n---\n');

// Test 3: Invalid level (capitalized)
console.log('Test 3: Invalid level (capitalized)');
const invalidLevel = {
  title: 'Introduction to React',
  description: 'Learn React fundamentals',
  instructor: 'John Doe',
  category: 'Technology',
  level: 'Beginner', // capitalized - should fail
  price: 99.99,
  duration: 40,
  instructorId: 'instructor123'
};

try {
  const result = courseSchema.parse(invalidLevel);
  console.log('❌ FAIL: Invalid level accepted (should have been rejected)');
  console.log('Parsed data:', result);
} catch (error) {
  console.log('✅ PASS: Invalid level correctly rejected');
  console.log('Error:', error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`));
}

console.log('\n---\n');

// Test 4: Form data conversion simulation
console.log('Test 4: Form data conversion simulation');
const formData = {
  title: 'Introduction to React',
  description: 'Learn React fundamentals',
  instructor: 'John Doe',
  category: 'Technology',
  level: 'beginner',
  price: 99.99,
  duration: '40.5', // string from form input
  instructorId: 'instructor123'
};

// Simulate conversion like in our components
const convertedData = {
  ...formData,
  duration: parseFloat(formData.duration.trim()) || 0
};

try {
  const result = courseSchema.parse(convertedData);
  console.log('✅ PASS: Form data conversion working correctly');
  console.log('Original duration (string):', formData.duration, typeof formData.duration);
  console.log('Converted duration (number):', result.duration, typeof result.duration);
} catch (error) {
  console.log('❌ FAIL: Form data conversion failed');
  console.log('Error:', error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`));
}

console.log('\n=== Test Complete ===');
