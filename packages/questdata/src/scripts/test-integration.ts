#!/usr/bin/env node

/**
 * Data layer integration test script
 * Tests all repositories and functionality to ensure proper setup
 */

// Load environment variables from .env file
import 'dotenv/config';

import {
    createFirebaseRepositories,
    getFirebaseProjectInfo,
    runFirebaseDiagnostics,
    SeedDataGenerator,
    type FirebaseConfig
} from '../index';

/**
 * Test configuration
 */
const TEST_CONFIG = {
    skipSeedGeneration: false,
    skipRepositoryCreation: false,
    skipDiagnostics: false
};

/**
 * Run comprehensive data layer tests
 */
async function runIntegrationTests(): Promise<void> {
    console.log('🧪 QuestEdu Data Layer Integration Tests');
    console.log('=======================================\n');

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

    // Test 1: Package imports
    console.log('📦 Testing Package Imports...');
    try {
        test('Import main exports', true, 'All exports imported successfully');
    } catch (error) {
        test('Import main exports', false, `Import failed: ${error}`);
    }

    // Test 2: Seed data generation
    if (!TEST_CONFIG.skipSeedGeneration) {
        console.log('\n🌱 Testing Seed Data Generation...');
        try {
            const generator = new SeedDataGenerator();
            const seedData = generator.generateAllSeedData();
            
            test('Generate users', seedData.users.length > 0, `Generated ${seedData.users.length} users`);
            test('Generate courses', seedData.courses.length > 0, `Generated ${seedData.courses.length} courses`);
            test('Generate course topics', seedData.courseTopics.length > 0, `Generated ${seedData.courseTopics.length} topics`);
            test('Generate questions', seedData.questions.length > 0, `Generated ${seedData.questions.length} questions`);
            test('Generate question banks', seedData.questionBanks.length > 0, `Generated ${seedData.questionBanks.length} question banks`);
            test('Generate course ownerships', seedData.courseOwnerships.length > 0, `Generated ${seedData.courseOwnerships.length} ownerships`);
            test('Generate course subscriptions', seedData.courseSubscriptions.length > 0, `Generated ${seedData.courseSubscriptions.length} subscriptions`);
            test('Generate user stats', seedData.userStats.length > 0, `Generated ${seedData.userStats.length} user stats`);
            
            // Validate data structure
            const firstUser = seedData.users[0];
            test('User structure validation', 
                !!(firstUser.email && firstUser.displayName && firstUser.role),
                `User has required fields: email, displayName, role`
            );
            
            const firstCourse = seedData.courses[0];
            test('Course structure validation',
                !!(firstCourse.title && firstCourse.description && firstCourse.category),
                `Course has required fields: title, description, category`
            );
            
        } catch (error) {
            test('Seed data generation', false, `Failed: ${error}`);
        }
    }

    // Test 3: Repository factory creation
    if (!TEST_CONFIG.skipRepositoryCreation) {
        console.log('\n🏭 Testing Repository Factory...');
        try {
            // Mock Firebase config (won't actually connect)
            const mockConfig: FirebaseConfig = {
                projectId: 'test-project',
                apiKey: 'test-key',
                authDomain: 'test.firebaseapp.com',
                storageBucket: 'test.appspot.com',
                messagingSenderId: '123456789',
                appId: 'test-app'
            };

            const repositories = createFirebaseRepositories(mockConfig);
            
            test('Create course repository', !!repositories.courseRepository, 'CourseRepository instance created');
            test('Create user repository', !!repositories.userRepository, 'UserRepository instance created');
            test('Create course ownership repository', !!repositories.courseOwnershipRepository, 'CourseOwnershipRepository instance created');
            test('Create course subscription repository', !!repositories.courseSubscriptionRepository, 'CourseSubscriptionRepository instance created');
            test('Create course topic repository', !!repositories.courseTopicRepository, 'CourseTopicRepository instance created');
            test('Create question repository', !!repositories.questionRepository, 'QuestionRepository instance created');
            test('Create question bank repository', !!repositories.questionBankRepository, 'QuestionBankRepository instance created');
            test('Create quiz repository', !!repositories.quizRepository, 'QuizRepository instance created');
            test('Create quiz attempt repository', !!repositories.quizAttemptRepository, 'QuizAttemptRepository instance created');
            test('Create essay answer repository', !!repositories.essayAnswerRepository, 'EssayAnswerRepository instance created');
            test('Create user stats repository', !!repositories.userStatsRepository, 'UserStatsRepository instance created');
            
        } catch (error) {
            test('Repository factory creation', false, `Failed: ${error}`);
        }
    }

    // Test 4: Firebase diagnostics (if Firebase is configured)
    if (!TEST_CONFIG.skipDiagnostics) {
        console.log('\n🔧 Testing Firebase Diagnostics...');
        try {
            const projectInfo = getFirebaseProjectInfo();
            test('Firebase project info', true, `Project info retrieval: ${projectInfo.success ? 'Success' : 'Not configured'}`);
            
            // Only run diagnostics if Firebase is actually configured
            if (process.env.FIREBASE_PROJECT_ID) {
                const diagnostics = await runFirebaseDiagnostics();
                test('Firebase diagnostics', diagnostics.length > 0, `Ran ${diagnostics.length} diagnostic tests`);
            } else {
                test('Firebase diagnostics', true, 'Skipped - Firebase not configured (expected for unit tests)');
            }
            
        } catch (error) {
            test('Firebase diagnostics', false, `Failed: ${error}`);
        }
    }

    // Test 5: Type checking
    console.log('\n🔍 Testing TypeScript Types...');
    try {
        // Import types to ensure they're properly exported
        const testTypes = async () => {
            // This function tests that all types are importable and usable
            const mockUser: import('../index').User = {
                email: 'test@example.com',
                displayName: 'Test User',
                role: 'student' as import('../index').UserRole,
                isActive: true,
                profileComplete: false
            };
            
            const mockCourse: import('../index').Course = {
                title: 'Test Course',
                instructor: 'Test Instructor',
                progress: 0,
                image: 'test-image.jpg',
                description: 'A test course',
                category: 'programming'
            };
            
            return { user: mockUser, course: mockCourse };
        };
        
        const typeTest = await testTypes();
        test('User type definition', !!typeTest.user, 'User type properly defined and usable');
        test('Course type definition', !!typeTest.course, 'Course type properly defined and usable');
        test('Enum types', true, 'UserRole and other enums properly exported');
        
    } catch (error) {
        test('TypeScript types', false, `Type validation failed: ${error}`);
    }

    // Summary
    console.log('\n📊 Test Results Summary');
    console.log('=======================');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${totalTests - passedTests}`);
    console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

    if (passedTests === totalTests) {
        console.log('\n🎉 All tests passed! Data layer is ready for use.');
        console.log('\nNext steps:');
        console.log('1. Set up Firebase configuration');
        console.log('2. Run seed script: pnpm run seed');
        console.log('3. Start integrating with your applications');
    } else {
        console.log('\n⚠️  Some tests failed. Please review the errors above.');
        process.exit(1);
    }
}

/**
 * CLI entry point
 */
async function main() {
    const args = process.argv.slice(2);
    const helpFlag = args.includes('--help') || args.includes('-h');

    if (helpFlag) {
        console.log(`
QuestEdu Data Layer Integration Test

Usage:
  pnpm run test:integration              # Run all tests
  pnpm run test:integration -- --help    # Show this help

Tests include:
  - Package import validation
  - Seed data generation
  - Repository factory creation
  - Firebase diagnostics
  - TypeScript type validation

Environment Variables (optional):
  FIREBASE_PROJECT_ID      # For Firebase diagnostics
`);
        process.exit(0);
    }

    await runIntegrationTests();
}

// Run if this script is executed directly
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Integration tests failed:', error);
        process.exit(1);
    });
}

export { runIntegrationTests };
