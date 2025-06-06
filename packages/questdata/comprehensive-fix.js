const fs = require('fs');

console.log('Starting comprehensive TypeScript error fixes...\n');

// 1. Fix Error type issues across all files
const errorFiles = [
    'src/firebase/course-ownership-repository.ts',
    'src/firebase/course-subscription-repository.ts', 
    'src/firebase/course-topic-repository.ts',
    'src/firebase/essay-answer-repository.ts',
    'src/firebase/question-bank-repository.ts',
    'src/firebase/question-repository.ts',
    'src/firebase/quiz-attempt-repository.ts',
    'src/firebase/quiz-repository.ts'
];

errorFiles.forEach(filePath => {
    console.log(`Fixing error types in ${filePath}...`);
    
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Fix Error type issues
        content = content.replace(
            /error: error as Error/g,
            'error: error instanceof Error ? error.message : String(error)'
        );
        
        // Fix specific error with new Error()
        content = content.replace(
            /error: new Error\('([^']+)'\)/g,
            "error: '$1'"
        );
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  ✓ Fixed error types in ${filePath}`);
    } else {
        console.log(`  ✗ File not found: ${filePath}`);
    }
});

// 2. Fix getDatabase -> getDb in user-stats-repository.ts
console.log('\nFixing getDatabase method calls...');
const userStatsFile = 'src/firebase/user-stats-repository.ts';
if (fs.existsSync(userStatsFile)) {
    let content = fs.readFileSync(userStatsFile, 'utf8');
    content = content.replace(/getDatabase\(\)/g, 'getDb()');
    fs.writeFileSync(userStatsFile, content, 'utf8');
    console.log('  ✓ Fixed getDatabase calls in user-stats-repository.ts');
} else {
    console.log('  ✗ user-stats-repository.ts not found');
}

// 3. Delete and recreate empty repository-stubs.ts  
console.log('\nFixing repository-stubs.ts...');
const stubsFile = 'src/firebase/repository-stubs.ts';
fs.writeFileSync(stubsFile, '// This file is intentionally empty\nexport {};\n', 'utf8');
console.log('  ✓ Created empty repository-stubs.ts');

// 4. Create an index file for firebase implementations
console.log('\nCreating firebase index file...');
const firebaseIndexContent = `// Export all Firebase repository implementations
export { FirebaseCourseOwnershipRepository } from './course-ownership-repository';
export { FirebaseCourseSubscriptionRepository } from './course-subscription-repository';
export { FirebaseCourseTopicRepository } from './course-topic-repository';
export { FirebaseQuestionRepository } from './question-repository';
export { FirebaseQuestionBankRepository } from './question-bank-repository';
export { FirebaseQuizRepository } from './quiz-repository';
export { FirebaseQuizAttemptRepository } from './quiz-attempt-repository';
export { FirebaseEssayAnswerRepository } from './essay-answer-repository';
export { FirebaseUserStatsRepository } from './user-stats-repository';
export { FirebaseUserRepository } from './user-repository';
export { FirebaseCourseRepository } from './course-repository';
export { FirebaseAppManager } from './app-manager';
export { FirebaseRepositoryFactory } from './factory';
`;

fs.writeFileSync('src/firebase/index.ts', firebaseIndexContent, 'utf8');
console.log('  ✓ Created firebase/index.ts');

console.log('\n✅ All fixes completed successfully!');
console.log('\nNext steps:');
console.log('1. Fix the invalid model properties manually');
console.log('2. Run npm run build to verify fixes');
console.log('3. Address any remaining TypeScript errors');
