const fs = require('fs');
const path = require('path');

// List of files to fix
const files = [
    'src/firebase/course-ownership-repository.ts',
    'src/firebase/course-subscription-repository.ts',
    'src/firebase/course-topic-repository.ts',
    'src/firebase/essay-answer-repository.ts',
    'src/firebase/question-bank-repository.ts',
    'src/firebase/question-repository.ts',
    'src/firebase/quiz-attempt-repository.ts',
    'src/firebase/quiz-repository.ts'
];

files.forEach(filePath => {
    console.log(`Fixing ${filePath}...`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix Error type issues - replace "error as Error" with proper string conversion
    content = content.replace(
        /error: error as Error/g,
        'error: error instanceof Error ? error.message : String(error)'
    );
    
    // Fix specific error with new Error
    content = content.replace(
        /error: new Error\('([^']+)'\)/g,
        "error: '$1'"
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${filePath}`);
});

console.log('All error type fixes completed!');
