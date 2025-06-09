// Test script to verify validation schema
const { z } = require('zod');

// Simulate the validation schema
const CreateCourseSchema = z.object({
  title: z.string().min(1, 'Course title is required').max(200),
  description: z.string().max(2000).optional(),
  instructorId: z.string().min(1, 'Instructor ID is required'),
  category: z.string().max(50).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  price: z.number().min(0).max(10000).optional(),
  duration: z.number().min(1).max(1000).optional(), // hours
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});

// Test data that should now work (matches what the form sends)
const testData = {
  title: "Test Course",
  description: "A test course description",
  instructorId: "test-instructor-id",
  category: "Technology",
  level: "beginner", // lowercase - should work
  price: 99.99,
  duration: 20, // number - should work
  status: "draft"
};

// Test data that caused previous errors
const oldTestData = {
  title: "Test Course",
  description: "A test course description", 
  instructorId: "test-instructor-id",
  category: "Technology",
  level: "Beginner", // capitalized - should fail
  price: 99.99,
  duration: "20", // string - should fail
  status: "draft"
};

console.log("Testing new format (should pass):");
try {
  const result = CreateCourseSchema.parse(testData);
  console.log("✅ Validation passed:", result);
} catch (error) {
  console.log("❌ Validation failed:", error.errors);
}

console.log("\nTesting old format (should fail):");
try {
  const result = CreateCourseSchema.parse(oldTestData);
  console.log("✅ Validation passed:", result);
} catch (error) {
  console.log("❌ Validation failed:", error.errors);
}
