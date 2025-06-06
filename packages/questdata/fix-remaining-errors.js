const fs = require('fs');

// File paths that still need fixing
const filesToFix = [
  'src/firebase/course-ownership-repository.ts',
  'src/firebase/course-subscription-repository.ts', 
  'src/firebase/course-topic-repository.ts',
  'src/firebase/essay-answer-repository.ts',
  'src/firebase/question-bank-repository.ts',
  'src/firebase/question-repository.ts',
  'src/firebase/quiz-attempt-repository.ts',
  'src/firebase/quiz-repository.ts'
];

// Fix the error handling pattern
filesToFix.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace all instances of 'error: error as Error' with proper string conversion
    content = content.replace(/error: error as Error/g, 'error: error instanceof Error ? error.message : String(error)');
    
    // Special case for the one instance with 'new Error()'
    content = content.replace(/error: new Error\('No ownership record found for the specified user and course'\)/g, "error: 'No ownership record found for the specified user and course'");
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed error handling in ${filePath}`);
  } catch (error) {
    console.error(`Failed to fix ${filePath}:`, error.message);
  }
});

console.log('Completed fixing error handling patterns.');
