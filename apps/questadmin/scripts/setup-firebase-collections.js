#!/usr/bin/env node

/**
 * Firebase Collections Setup Script (JavaScript Version)
 * 
 * This script sets up Firebase collections with sample data for the QuestAdmin app.
 * It's a simplified JavaScript version of the TypeScript setup script.
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Collection names - centralized configuration
const COLLECTIONS = {
  USERS: 'users',
  COURSES: 'courses', 
  COURSE_TOPICS: 'course_topics',
  COURSE_ENROLLMENTS: 'course_enrollments',
  QUIZZES: 'quizzes',
  QUIZ_SUBMISSIONS: 'quiz_submissions',
  ASSIGNMENTS: 'assignments',
  ASSIGNMENT_SUBMISSIONS: 'assignment_submissions',
  COURSE_MATERIALS: 'course_materials',
  PROGRESS_TRACKING: 'progress_tracking',
  CERTIFICATES: 'certificates',
  NOTIFICATIONS: 'notifications',
  ANNOUNCEMENTS: 'announcements',
  SYSTEM_SETTINGS: 'system_settings',
  ANALYTICS: 'analytics'
};

// Sample data generators
class SampleDataGenerator {
  static generateUsers(count = 10) {
    const users = [];
    const roles = ['admin', 'instructor', 'student'];
    
    for (let i = 0; i < count; i++) {
      users.push({
        id: `user_${i + 1}`,
        email: `user${i + 1}@questedu.com`,
        displayName: `User ${i + 1}`,
        role: roles[i % 3],
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
      });
    }
    return users;
  }

  static generateCourses(count = 5) {
    const courses = [];
    const levels = ['beginner', 'intermediate', 'advanced'];
    const statuses = ['draft', 'published', 'archived'];
    
    for (let i = 0; i < count; i++) {
      courses.push({
        id: `course_${i + 1}`,
        title: `Course ${i + 1}: Introduction to Topic ${i + 1}`,
        description: `A comprehensive course covering all aspects of Topic ${i + 1}`,
        instructorId: `user_${(i % 3) + 1}`,
        instructorName: `User ${(i % 3) + 1}`,
        level: levels[i % 3],
        status: statuses[i % 3],
        category: `Category ${i + 1}`,
        tags: [`tag${i + 1}`, `topic${i + 1}`],
        duration: 60 + (i * 30),
        price: (i + 1) * 100,
        currency: 'USD',
        thumbnail: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        enrollmentCount: i * 10,
        rating: 4.0 + (i * 0.2),
        reviewCount: i * 5
      });
    }
    return courses;
  }

  static generateCourseTopics(courseId, count = 5) {
    const topics = [];
    
    for (let i = 0; i < count; i++) {
      topics.push({
        id: `${courseId}_topic_${i + 1}`,
        courseId: courseId,
        title: `Topic ${i + 1}: Understanding the Basics`,
        description: `Detailed explanation of Topic ${i + 1}`,
        order: i + 1,
        duration: 15 + (i * 5),
        content: `# Topic ${i + 1}\n\nThis is the content for topic ${i + 1}...`,
        videoUrl: null,
        attachments: [],
        isRequired: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    return topics;
  }

  static generateSystemSettings() {
    return [
      {
        id: 'general',
        category: 'general',
        settings: {
          siteName: 'QuestEdu Admin',
          siteDescription: 'Educational platform administration',
          defaultLanguage: 'en',
          timezone: 'UTC',
          maintenanceMode: false
        },
        updatedAt: new Date(),
        updatedBy: 'system'
      },
      {
        id: 'email',
        category: 'email',
        settings: {
          smtpHost: 'smtp.example.com',
          smtpPort: 587,
          smtpUsername: 'noreply@questedu.com',
          emailTemplates: {
            welcome: 'Welcome to QuestEdu!',
            courseEnrollment: 'You have been enrolled in a new course.',
            certificateEarned: 'Congratulations! You have earned a certificate.'
          }
        },
        updatedAt: new Date(),
        updatedBy: 'admin'
      }
    ];
  }
}

class CollectionSetup {
  constructor(db) {
    this.db = db;
  }

  async setupCollection(collectionName, documents, options = {}) {
    try {
      console.log(`\n📦 Setting up collection: ${collectionName}`);
      
      if (options.clearExisting) {
        await this.clearCollection(collectionName);
      }

      const batch = this.db.batch();
      const collectionRef = this.db.collection(collectionName);

      for (const doc of documents) {
        const docRef = collectionRef.doc(doc.id);
        batch.set(docRef, doc);
      }

      await batch.commit();
      console.log(`✅ Successfully added ${documents.length} documents to ${collectionName}`);
      
      return { success: true, count: documents.length };
    } catch (error) {
      console.error(`❌ Error setting up collection ${collectionName}:`, error);
      throw error;
    }
  }

  async clearCollection(collectionName) {
    try {
      console.log(`🧹 Clearing existing documents from ${collectionName}...`);
      
      const collectionRef = this.db.collection(collectionName);
      const snapshot = await collectionRef.get();
      
      if (snapshot.empty) {
        console.log(`   Collection ${collectionName} is already empty`);
        return;
      }

      const batch = this.db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`   Cleared ${snapshot.size} documents from ${collectionName}`);
    } catch (error) {
      console.error(`❌ Error clearing collection ${collectionName}:`, error);
      throw error;
    }
  }
}

async function setupFirebaseCollections(operation = 'setup', options = {}) {
  try {
    // Initialize Firebase Admin
    if (!admin.apps.length) {
      // Try to initialize with service account or use default credentials
      try {
        const serviceAccountPath = path.join(__dirname, '..', 'service-account-key.json');
        if (fs.existsSync(serviceAccountPath)) {
          const serviceAccount = require(serviceAccountPath);
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
          });
        } else {
          // Use default credentials or environment
          admin.initializeApp();
        }
      } catch (error) {
        console.error('❌ Failed to initialize Firebase Admin:', error.message);
        console.log('💡 Make sure you have:\n' +
                   '   1. Service account key file, or\n' +
                   '   2. GOOGLE_APPLICATION_CREDENTIALS environment variable set, or\n' +
                   '   3. Running in a Google Cloud environment');
        process.exit(1);
      }
    }

    const db = admin.firestore();
    const setup = new CollectionSetup(db);

    console.log('🚀 Starting Firebase Collections Setup...');
    console.log(`📋 Operation: ${operation}`);

    switch (operation) {
      case 'setup':
      case 'all':
        await setupAllCollections(setup, options);
        break;
      case 'users':
        await setupUsers(setup, options);
        break;
      case 'courses':
        await setupCourses(setup, options);
        break;
      case 'topics':
        await setupTopics(setup, options);
        break;
      case 'settings':
        await setupSettings(setup, options);
        break;
      default:
        console.log('❓ Unknown operation. Available operations:');
        console.log('   - setup (or all): Set up all collections');
        console.log('   - users: Set up users collection');
        console.log('   - courses: Set up courses collection');
        console.log('   - topics: Set up course topics collection');
        console.log('   - settings: Set up system settings collection');
        process.exit(1);
    }

    console.log('\n🎉 Firebase Collections Setup Complete!');
    
  } catch (error) {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  }
}

async function setupAllCollections(setup, options) {
  await setupUsers(setup, options);
  await setupCourses(setup, options);
  await setupTopics(setup, options);
  await setupSettings(setup, options);
}

async function setupUsers(setup, options) {
  const users = SampleDataGenerator.generateUsers(options.userCount || 10);
  await setup.setupCollection(COLLECTIONS.USERS, users, options);
}

async function setupCourses(setup, options) {
  const courses = SampleDataGenerator.generateCourses(options.courseCount || 5);
  await setup.setupCollection(COLLECTIONS.COURSES, courses, options);
}

async function setupTopics(setup, options) {
  // Generate topics for the first 3 courses
  const courseIds = ['course_1', 'course_2', 'course_3'];
  const allTopics = [];
  
  for (const courseId of courseIds) {
    const topics = SampleDataGenerator.generateCourseTopics(courseId, 5);
    allTopics.push(...topics);
  }
  
  await setup.setupCollection(COLLECTIONS.COURSE_TOPICS, allTopics, options);
}

async function setupSettings(setup, options) {
  const settings = SampleDataGenerator.generateSystemSettings();
  await setup.setupCollection(COLLECTIONS.SYSTEM_SETTINGS, settings, options);
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const operation = args[0] || 'setup';
  
  const options = {
    clearExisting: args.includes('--clear'),
    userCount: 10,
    courseCount: 5
  };

  setupFirebaseCollections(operation, options);
}

module.exports = {
  setupFirebaseCollections,
  CollectionSetup,
  SampleDataGenerator,
  COLLECTIONS
};
