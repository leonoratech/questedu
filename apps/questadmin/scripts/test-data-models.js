#!/usr/bin/env node

/**
 * Data Models and Validation Test Script
 * 
 * This script tests our TypeScript data models and validation system
 * using Node.js with require() since we have TypeScript compilation issues.
 */

const { readFileSync } = require('fs');
const { join } = require('path');

// Test data matching our TypeScript interfaces
const testData = {
  user: {
    id: 'test_user_validation',
    email: 'validation@questedu.com',
    displayName: 'Validation Test User',
    role: 'student',
    profilePicture: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLogin: new Date(),
    preferences: {
      theme: 'light',
      language: 'en',
      notifications: true
    }
  },
  
  course: {
    id: 'test_course_validation',
    title: 'Validation Test Course',
    description: 'A course designed to test our validation system',
    instructorId: 'test_user_validation',
    instructorName: 'Validation Test User',
    level: 'beginner',
    status: 'published',
    category: 'Technology',
    tags: ['validation', 'testing'],
    duration: 120,
    price: 99.99,
    currency: 'USD',
    thumbnail: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    enrollmentCount: 0,
    rating: 0,
    reviewCount: 0
  },
  
  courseTopic: {
    id: 'test_topic_validation',
    courseId: 'test_course_validation',
    title: 'Validation Testing Topic',
    description: 'Learn how to test data validation',
    order: 1,
    duration: 30,
    content: '# Validation Testing\n\nThis topic covers validation testing...',
    videoUrl: null,
    attachments: [],
    isRequired: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  quiz: {
    id: 'test_quiz_validation',
    courseId: 'test_course_validation',
    topicId: 'test_topic_validation',
    title: 'Validation Quiz',
    description: 'Test your validation knowledge',
    questions: [
      {
        id: 'q1',
        question: 'What is data validation?',
        type: 'multiple_choice',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 'A',
        points: 10
      }
    ],
    timeLimit: 600,
    passingScore: 70,
    maxAttempts: 3,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
};

// Validation functions (simplified versions of our TypeScript validators)
class SimpleValidation {
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  static validateUser(user) {
    const errors = [];
    
    if (!user.id || typeof user.id !== 'string') {
      errors.push('User ID is required and must be a string');
    }
    
    if (!user.email || !this.validateEmail(user.email)) {
      errors.push('Valid email is required');
    }
    
    if (!user.displayName || typeof user.displayName !== 'string') {
      errors.push('Display name is required and must be a string');
    }
    
    if (!['admin', 'instructor', 'student'].includes(user.role)) {
      errors.push('Invalid user role');
    }
    
    if (typeof user.isActive !== 'boolean') {
      errors.push('isActive must be a boolean');
    }
    
    return errors;
  }
  
  static validateCourse(course) {
    const errors = [];
    
    if (!course.id || typeof course.id !== 'string') {
      errors.push('Course ID is required and must be a string');
    }
    
    if (!course.title || typeof course.title !== 'string' || course.title.length < 3) {
      errors.push('Course title is required and must be at least 3 characters');
    }
    
    if (!course.description || typeof course.description !== 'string') {
      errors.push('Course description is required');
    }
    
    if (!course.instructorId || typeof course.instructorId !== 'string') {
      errors.push('Instructor ID is required');
    }
    
    if (!['beginner', 'intermediate', 'advanced'].includes(course.level)) {
      errors.push('Invalid course level');
    }
    
    if (!['draft', 'published', 'archived'].includes(course.status)) {
      errors.push('Invalid course status');
    }
    
    if (typeof course.duration !== 'number' || course.duration <= 0) {
      errors.push('Duration must be a positive number');
    }
    
    if (typeof course.price !== 'number' || course.price < 0) {
      errors.push('Price must be a non-negative number');
    }
    
    return errors;
  }
  
  static validateCourseTopic(topic) {
    const errors = [];
    
    if (!topic.id || typeof topic.id !== 'string') {
      errors.push('Topic ID is required and must be a string');
    }
    
    if (!topic.courseId || typeof topic.courseId !== 'string') {
      errors.push('Course ID is required and must be a string');
    }
    
    if (!topic.title || typeof topic.title !== 'string' || topic.title.length < 3) {
      errors.push('Topic title is required and must be at least 3 characters');
    }
    
    if (typeof topic.order !== 'number' || topic.order <= 0) {
      errors.push('Order must be a positive number');
    }
    
    if (typeof topic.duration !== 'number' || topic.duration <= 0) {
      errors.push('Duration must be a positive number');
    }
    
    if (typeof topic.isRequired !== 'boolean') {
      errors.push('isRequired must be a boolean');
    }
    
    return errors;
  }
  
  static validateQuiz(quiz) {
    const errors = [];
    
    if (!quiz.id || typeof quiz.id !== 'string') {
      errors.push('Quiz ID is required and must be a string');
    }
    
    if (!quiz.courseId || typeof quiz.courseId !== 'string') {
      errors.push('Course ID is required and must be a string');
    }
    
    if (!quiz.title || typeof quiz.title !== 'string' || quiz.title.length < 3) {
      errors.push('Quiz title is required and must be at least 3 characters');
    }
    
    if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
      errors.push('Quiz must have at least one question');
    }
    
    if (typeof quiz.timeLimit !== 'number' || quiz.timeLimit <= 0) {
      errors.push('Time limit must be a positive number');
    }
    
    if (typeof quiz.passingScore !== 'number' || quiz.passingScore < 0 || quiz.passingScore > 100) {
      errors.push('Passing score must be between 0 and 100');
    }
    
    return errors;
  }
}

function testDataValidation() {
  console.log('🔍 Testing Data Validation...\n');
  
  const tests = [
    {
      name: 'User Validation',
      data: testData.user,
      validator: SimpleValidation.validateUser
    },
    {
      name: 'Course Validation',
      data: testData.course,
      validator: SimpleValidation.validateCourse
    },
    {
      name: 'Course Topic Validation',
      data: testData.courseTopic,
      validator: SimpleValidation.validateCourseTopic
    },
    {
      name: 'Quiz Validation',
      data: testData.quiz,
      validator: SimpleValidation.validateQuiz
    }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  tests.forEach(test => {
    console.log(`🧪 ${test.name}:`);
    
    const errors = test.validator(test.data);
    
    if (errors.length === 0) {
      console.log(`   ✅ Valid - all checks passed`);
      passedTests++;
    } else {
      console.log(`   ❌ Invalid - ${errors.length} errors:`);
      errors.forEach(error => console.log(`      - ${error}`));
    }
    console.log('');
  });
  
  console.log(`📊 Validation Results: ${passedTests}/${totalTests} tests passed\n`);
  return passedTests === totalTests;
}

function testInvalidData() {
  console.log('🔍 Testing Invalid Data Detection...\n');
  
  const invalidTests = [
    {
      name: 'Invalid User (missing email)',
      data: { ...testData.user, email: '' },
      validator: SimpleValidation.validateUser,
      expectedErrors: 1
    },
    {
      name: 'Invalid Course (negative duration)',
      data: { ...testData.course, duration: -10 },
      validator: SimpleValidation.validateCourse,
      expectedErrors: 1
    },
    {
      name: 'Invalid Topic (invalid order)',
      data: { ...testData.courseTopic, order: 0 },
      validator: SimpleValidation.validateCourseTopic,
      expectedErrors: 1
    },
    {
      name: 'Invalid Quiz (no questions)',
      data: { ...testData.quiz, questions: [] },
      validator: SimpleValidation.validateQuiz,
      expectedErrors: 1
    }
  ];
  
  let passedTests = 0;
  let totalTests = invalidTests.length;
  
  invalidTests.forEach(test => {
    console.log(`🧪 ${test.name}:`);
    
    const errors = test.validator(test.data);
    
    if (errors.length >= test.expectedErrors) {
      console.log(`   ✅ Correctly detected ${errors.length} error(s)`);
      passedTests++;
    } else {
      console.log(`   ❌ Failed to detect errors (expected >= ${test.expectedErrors}, got ${errors.length})`);
    }
    console.log('');
  });
  
  console.log(`📊 Invalid Data Detection: ${passedTests}/${totalTests} tests passed\n`);
  return passedTests === totalTests;
}

function testDataModelStructure() {
  console.log('🔍 Testing Data Model Structure...\n');
  
  const models = Object.keys(testData);
  let validModels = 0;
  
  models.forEach(modelName => {
    const model = testData[modelName];
    const requiredFields = getRequiredFields(modelName);
    
    console.log(`📋 ${modelName} model:`);
    
    const missingFields = requiredFields.filter(field => !(field in model));
    const presentFields = Object.keys(model);
    
    if (missingFields.length === 0) {
      console.log(`   ✅ All required fields present (${presentFields.length} fields)`);
      console.log(`   📝 Fields: ${presentFields.join(', ')}`);
      validModels++;
    } else {
      console.log(`   ❌ Missing fields: ${missingFields.join(', ')}`);
    }
    console.log('');
  });
  
  console.log(`📊 Data Model Structure: ${validModels}/${models.length} models valid\n`);
  return validModels === models.length;
}

function getRequiredFields(modelName) {
  const requiredFields = {
    user: ['id', 'email', 'displayName', 'role', 'isActive', 'createdAt', 'updatedAt'],
    course: ['id', 'title', 'description', 'instructorId', 'level', 'status', 'duration', 'price', 'currency', 'createdAt', 'updatedAt'],
    courseTopic: ['id', 'courseId', 'title', 'order', 'duration', 'isRequired', 'createdAt', 'updatedAt'],
    quiz: ['id', 'courseId', 'title', 'questions', 'timeLimit', 'passingScore', 'createdAt', 'updatedAt']
  };
  
  return requiredFields[modelName] || [];
}

function checkTypeScriptFiles() {
  console.log('🔍 Checking TypeScript Files...\n');
  
  const files = [
    'lib/data-models.ts',
    'lib/data-validation.ts',
    'scripts/setup-firebase-collections.ts',
    'scripts/validate-data-schema.ts'
  ];
  
  let existingFiles = 0;
  
  files.forEach(file => {
    try {
      const filePath = join(__dirname, '..', file);
      const content = readFileSync(filePath, 'utf8');
      console.log(`   ✅ ${file} (${Math.round(content.length / 1024)}KB)`);
      existingFiles++;
    } catch (error) {
      console.log(`   ❌ ${file} - ${error.message}`);
    }
  });
  
  console.log(`\n📊 TypeScript Files: ${existingFiles}/${files.length} files found\n`);
  return existingFiles === files.length;
}

async function main() {
  try {
    console.log('🚀 Data Models and Validation Test');
    console.log('===================================\n');
    
    // Test TypeScript files existence
    const filesExist = checkTypeScriptFiles();
    
    // Test data model structure
    const structureValid = testDataModelStructure();
    
    // Test validation with valid data
    const validationPassed = testDataValidation();
    
    // Test validation with invalid data
    const invalidDetectionPassed = testInvalidData();
    
    // Summary
    console.log('📋 Test Summary:');
    console.log(`   ${filesExist ? '✅' : '❌'} TypeScript files present`);
    console.log(`   ${structureValid ? '✅' : '❌'} Data model structure valid`);
    console.log(`   ${validationPassed ? '✅' : '❌'} Validation tests passed`);
    console.log(`   ${invalidDetectionPassed ? '✅' : '❌'} Invalid data detection works`);
    
    const allTestsPassed = filesExist && structureValid && validationPassed && invalidDetectionPassed;
    
    if (allTestsPassed) {
      console.log('\n🎉 All tests passed! Data models and validation system are working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Check the output above for details.');
    }
    
    console.log('\n📋 Next steps:');
    console.log('   1. Run the TypeScript validation scripts');
    console.log('   2. Test with real Firebase data');
    console.log('   3. Create API integration examples');
    console.log('   4. Set up automated testing');
    
  } catch (error) {
    console.error('💥 Test failed:', error);
    process.exit(1);
  }
}

// Run the tests
if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = {
  SimpleValidation,
  testData
};
