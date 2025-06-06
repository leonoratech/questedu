#!/usr/bin/env node

/**
 * Database seeding script for QuestEdu platform
 * Populates the database with anonymous test data for development and testing
 */

// Load environment variables from .env file
import 'dotenv/config';

import { FirebaseConfig } from '../config';
import { createFirebaseRepositories } from '../firebase/factory';
import { SeedDataGenerator } from '../seed/seed-data-generator';

/**
 * Configuration for seeding
 */
interface SeedConfig {
  /**
   * Number of each entity to create
   */
  counts: {
    instructors: number;
    students: number;
    admins: number;
    courses: number;
    topicsPerCourse: number;
    questionsPerTopic: number;
    questionBanksPerCourse: number;
    quizzesPerCourse: number;
    attemptsPerQuiz: number;
  };
  
  /**
   * Whether to clear existing data before seeding
   */
  clearExisting: boolean;
  
  /**
   * Firebase configuration
   */
  firebase: FirebaseConfig;
}

/**
 * Default seeding configuration
 */
const DEFAULT_SEED_CONFIG: Omit<SeedConfig, 'firebase'> = {
  counts: {
    instructors: 5,
    students: 20,
    admins: 2,
    courses: 10,
    topicsPerCourse: 5,
    questionsPerTopic: 8,
    questionBanksPerCourse: 2,
    quizzesPerCourse: 3,
    attemptsPerQuiz: 15
  },
  clearExisting: false
};

/**
 * Main seeding function
 */
async function seedDatabase(config: SeedConfig): Promise<void> {
  console.log('🌱 Starting database seeding...');
  console.log('Configuration:', {
    ...config,
    firebase: { projectId: config.firebase.projectId }
  });

  try {
    // Initialize repositories
    const repositories = createFirebaseRepositories(config.firebase);
    const seedGenerator = new SeedDataGenerator();

    console.log('\n📊 Creating seed data...');

    // Generate all seed data
    const seedData = seedGenerator.generateAllSeedData();

    console.log('\n📝 Seed data generated:');
    console.log(`- Users: ${seedData.users.length}`);
    console.log(`- Courses: ${seedData.courses.length}`);
    console.log(`- Course Topics: ${seedData.courseTopics.length}`);
    console.log(`- Questions: ${seedData.questions.length}`);
    console.log(`- Question Banks: ${seedData.questionBanks.length}`);
    console.log(`- Course Ownerships: ${seedData.courseOwnerships.length}`);
    console.log(`- Course Subscriptions: ${seedData.courseSubscriptions.length}`);
    console.log(`- User Stats: ${seedData.userStats.length}`);

    console.log('\n💾 Seeding database...');

    let successCount = 0;
    let errorCount = 0;

    // Seed users
    console.log('Creating users...');
    for (const user of seedData.users) {
      try {
        const result = await repositories.userRepository.create(user);
        if (result.success) {
          successCount++;
        } else {
          console.error(`Failed to create user ${user.email}:`, result.error);
          errorCount++;
        }
      } catch (error) {
        console.error(`Error creating user ${user.email}:`, error);
        errorCount++;
      }
    }

    // Seed courses
    console.log('Creating courses...');
    for (const course of seedData.courses) {
      try {
        const result = await repositories.courseRepository.create(course);
        if (result.success) {
          successCount++;
        } else {
          console.error(`Failed to create course ${course.title}:`, result.error);
          errorCount++;
        }
      } catch (error) {
        console.error(`Error creating course ${course.title}:`, error);
        errorCount++;
      }
    }

    // Seed course topics
    console.log('Creating course topics...');
    for (const topic of seedData.courseTopics) {
      try {
        const result = await repositories.courseTopicRepository.create(topic);
        if (result.success) {
          successCount++;
        } else {
          console.error(`Failed to create course topic ${topic.title}:`, result.error);
          errorCount++;
        }
      } catch (error) {
        console.error(`Error creating course topic ${topic.title}:`, error);
        errorCount++;
      }
    }

    // Seed question banks
    console.log('Creating question banks...');
    for (const questionBank of seedData.questionBanks) {
      try {
        const result = await repositories.questionBankRepository.create(questionBank);
        if (result.success) {
          successCount++;
        } else {
          console.error(`Failed to create question bank ${questionBank.title}:`, result.error);
          errorCount++;
        }
      } catch (error) {
        console.error(`Error creating question bank ${questionBank.title}:`, error);
        errorCount++;
      }
    }

    // Seed questions
    console.log('Creating questions...');
    for (const question of seedData.questions) {
      try {
        const result = await repositories.questionRepository.create(question);
        if (result.success) {
          successCount++;
        } else {
          console.error(`Failed to create question:`, result.error);
          errorCount++;
        }
      } catch (error) {
        console.error(`Error creating question:`, error);
        errorCount++;
      }
    }

    // Seed course ownerships
    console.log('Creating course ownerships...');
    for (const ownership of seedData.courseOwnerships) {
      try {
        const result = await repositories.courseOwnershipRepository.create(ownership);
        if (result.success) {
          successCount++;
        } else {
          console.error(`Failed to create course ownership:`, result.error);
          errorCount++;
        }
      } catch (error) {
        console.error(`Error creating course ownership:`, error);
        errorCount++;
      }
    }

    // Seed course subscriptions
    console.log('Creating course subscriptions...');
    for (const subscription of seedData.courseSubscriptions) {
      try {
        const result = await repositories.courseSubscriptionRepository.create(subscription);
        if (result.success) {
          successCount++;
        } else {
          console.error(`Failed to create course subscription:`, result.error);
          errorCount++;
        }
      } catch (error) {
        console.error(`Error creating course subscription:`, error);
        errorCount++;
      }
    }

    // Seed user stats
    console.log('Creating user stats...');
    for (const userStat of seedData.userStats) {
      try {
        const result = await repositories.userStatsRepository.create(userStat);
        if (result.success) {
          successCount++;
        } else {
          console.error(`Failed to create user stats for ${userStat.userId}:`, result.error);
          errorCount++;
        }
      } catch (error) {
        console.error(`Error creating user stats for ${userStat.userId}:`, error);
        errorCount++;
      }
    }

    console.log('\n✅ Database seeding completed!');
    console.log(`📈 Results: ${successCount} successful, ${errorCount} errors`);

    if (errorCount > 0) {
      console.log('\n⚠️  Some entities failed to seed. Check the error messages above.');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  }
}

/**
 * CLI entry point
 */
async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const clearFlag = args.includes('--clear');
  const helpFlag = args.includes('--help') || args.includes('-h');

  if (helpFlag) {
    console.log(`
QuestEdu Database Seeding Script

Usage:
  npm run seed              # Seed with default configuration
  npm run seed -- --clear   # Clear existing data before seeding

Options:
  --clear     Clear existing data before seeding
  --help, -h  Show this help message

Environment Variables:
  FIREBASE_PROJECT_ID      Firebase project ID
  FIREBASE_API_KEY         Firebase API key
  FIREBASE_AUTH_DOMAIN     Firebase auth domain
  FIREBASE_STORAGE_BUCKET  Firebase storage bucket
  FIREBASE_MESSAGING_SENDER_ID  Firebase messaging sender ID
  FIREBASE_APP_ID          Firebase app ID
`);
    process.exit(0);
  }

  // Get Firebase configuration from environment
  const firebaseConfig: FirebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    apiKey: process.env.FIREBASE_API_KEY || '',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.FIREBASE_APP_ID || ''
  };

  // Validate Firebase configuration
  const requiredFields = ['projectId', 'apiKey', 'authDomain'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof FirebaseConfig]);

  if (missingFields.length > 0) {
    console.error('❌ Missing required Firebase configuration:');
    missingFields.forEach(field => console.error(`  - ${field.toUpperCase()}`));
    console.error('\nPlease set the required environment variables.');
    process.exit(1);
  }

  // Create seeding configuration
  const seedConfig: SeedConfig = {
    ...DEFAULT_SEED_CONFIG,
    clearExisting: clearFlag,
    firebase: firebaseConfig
  };

  // Run seeding
  await seedDatabase(seedConfig);
}

// Run if this script is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Seeding script failed:', error);
    process.exit(1);
  });
}

export { DEFAULT_SEED_CONFIG, SeedConfig, seedDatabase };

