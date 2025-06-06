#!/usr/bin/env node

/**
 * Simple data layer validation script
 * Tests core functionality without Firebase initialization
 */

console.log('🧪 QuestEdu Data Layer Validation');
console.log('==================================\n');

let passedTests = 0;
let totalTests = 0;

const test = (name: string, condition: boolean, details?: string) => {
    totalTests++;
    if (condition) {
        console.log(`✅ ${name}`);
        if (details) console.log(`   ${details}`);
        passedTests++;
    } else {
        console.log(`❌ ${name}`);
        if (details) console.log(`   ${details}`);
    }
};

async function validateDataLayer() {
    // Test 1: Basic imports
    console.log('📦 Testing Core Imports...');
    try {
        const { SeedDataGenerator } = await import('../seed/seed-data-generator');
        test('SeedDataGenerator import', !!SeedDataGenerator, 'Successfully imported SeedDataGenerator');
        
        const generator = new SeedDataGenerator();
        test('SeedDataGenerator instantiation', !!generator, 'Successfully created generator instance');
        
    } catch (error) {
        test('SeedDataGenerator import', false, `Failed: ${error}`);
    }

    // Test 2: Seed data generation
    console.log('\n🌱 Testing Seed Data Generation...');
    try {
        const { SeedDataGenerator } = await import('../seed/seed-data-generator');
        const generator = new SeedDataGenerator();
        
        // Test individual generators
        const users = generator.generateUsers();
        test('Generate users', users.length > 0, `Generated ${users.length} users`);
        
        const courses = generator.generateCourses();
        test('Generate courses', courses.length > 0, `Generated ${courses.length} courses`);
        
        // Test complete generation
        const allData = generator.generateAllSeedData();
        test('Generate all data', !!allData && allData.users.length > 0, 'Complete dataset generated');
        
        // Validate data structure
        const firstUser = allData.users[0];
        test('User data structure', 
            !!(firstUser.email && firstUser.displayName && firstUser.role),
            'User has required fields'
        );
        
    } catch (error) {
        test('Seed data generation', false, `Failed: ${error}`);
    }

    // Test 3: Type imports
    console.log('\n🔍 Testing Type Definitions...');
    try {
        // Test that we can import types without initializing Firebase
        const { UserRole, QuestionType, DifficultyLevel } = await import('../domain/models');
        
        test('Enum imports', !!(UserRole && QuestionType && DifficultyLevel), 'Enums imported successfully');
        
        // Test enum values
        test('UserRole enum', UserRole.STUDENT === 'student', 'UserRole.STUDENT has correct value');
        test('QuestionType enum', QuestionType.MULTIPLE_CHOICE === 'multiple_choice', 'QuestionType values correct');
        test('DifficultyLevel enum', DifficultyLevel.BEGINNER === 'beginner', 'DifficultyLevel values correct');
        
    } catch (error) {
        test('Type definitions', false, `Failed: ${error}`);
    }

    // Test 4: Repository interfaces
    console.log('\n🏭 Testing Repository Interfaces...');
    try {
        const interfaces = await import('../repositories/interfaces');
        
        test('Repository interfaces import', !!interfaces, 'Repository interfaces imported');
        
        // We can't instantiate the actual repositories without Firebase,
        // but we can verify the Firebase implementations are available
        const firebase = await import('../firebase');
        const hasRepositories = !!(
            firebase.FirebaseCourseRepository &&
            firebase.FirebaseUserRepository &&
            firebase.createFirebaseRepositories
        );
        
        test('Core repository implementations', hasRepositories, 'Repository implementations are available');
        
    } catch (error) {
        test('Repository interfaces', false, `Failed: ${error}`);
    }

    // Summary
    console.log('\n📊 Validation Results');
    console.log('=====================');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${totalTests - passedTests}`);
    console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

    if (passedTests === totalTests) {
        console.log('\n🎉 All validations passed! Data layer core functionality is working.');
        console.log('\nTo complete setup:');
        console.log('1. Configure Firebase credentials');
        console.log('2. Run seed script: pnpm run seed');
        console.log('3. Use repositories in your applications');
    } else {
        console.log('\n⚠️  Some validations failed. Please review the errors above.');
        process.exit(1);
    }
}

// Run validation
validateDataLayer().catch(error => {
    console.error('❌ Validation failed:', error);
    process.exit(1);
});
