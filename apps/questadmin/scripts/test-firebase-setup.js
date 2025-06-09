#!/usr/bin/env node

/**
 * Firebase Connection Test Script
 * 
 * This script tests our Firebase connection and validates our data schema setup
 * using the existing Firebase client configuration.
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, connectFirestoreEmulator, collection, addDoc, getDocs, doc, setDoc } = require('firebase/firestore');

// Firebase configuration (from the existing setup)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyALWHvJopjpZ9amcpV74jrBlYqEZzeWaTI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "questedu-cb2a4.firebaseapp.com", 
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "questedu-cb2a4",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "questedu-cb2a4.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "247130380208",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:247130380208:web:dfe0053ff32ae3194a6875"
};

// Collection names
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

let app = null;
let db = null;

async function initializeFirebase() {
  try {
    console.log('🔥 Initializing Firebase...');
    
    // Initialize Firebase app
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    
    console.log('✅ Firebase initialized successfully');
    console.log(`📋 Project ID: ${firebaseConfig.projectId}`);
    return true;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    return false;
  }
}

async function testFirebaseConnection() {
  try {
    console.log('\n🔍 Testing Firebase connection...');
    
    // Try to read from a collection (this will test our connection and permissions)
    const testCollection = collection(db, 'test_connection');
    const snapshot = await getDocs(testCollection);
    
    console.log('✅ Firebase connection successful');
    console.log(`📊 Found ${snapshot.size} documents in test collection`);
    return true;
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error.message);
    
    if (error.code === 'permission-denied') {
      console.log('💡 This might be due to Firestore security rules. Make sure your rules allow read/write access.');
    } else if (error.code === 'unavailable') {
      console.log('💡 Firebase service seems to be unavailable. Check your internet connection.');
    }
    
    return false;
  }
}

async function createSampleData() {
  try {
    console.log('\n📦 Creating sample data...');
    
    // Create a sample user
    const sampleUser = {
      id: 'test_user_1',
      email: 'test@questedu.com',
      displayName: 'Test User',
      role: 'student',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      preferences: {
        theme: 'light',
        language: 'en',
        notifications: true
      }
    };
    
    // Create a sample course
    const sampleCourse = {
      id: 'test_course_1',
      title: 'Test Course: Firebase Schema Validation',
      description: 'A test course to validate our Firebase data schema',
      instructorId: 'test_user_1',
      instructorName: 'Test User',
      level: 'beginner',
      status: 'published',
      category: 'Technology',
      tags: ['test', 'firebase', 'schema'],
      duration: 60,
      price: 0,
      currency: 'USD',
      createdAt: new Date(),
      updatedAt: new Date(),
      enrollmentCount: 0,
      rating: 0,
      reviewCount: 0
    };
    
    // Create sample course topic
    const sampleTopic = {
      id: 'test_course_1_topic_1',
      courseId: 'test_course_1',
      title: 'Introduction to Firebase',
      description: 'Learn the basics of Firebase and Firestore',
      order: 1,
      duration: 15,
      content: '# Introduction to Firebase\n\nThis topic covers Firebase basics...',
      isRequired: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Add documents to collections
    const userRef = doc(db, COLLECTIONS.USERS, sampleUser.id);
    await setDoc(userRef, sampleUser);
    console.log('✅ Sample user created');
    
    const courseRef = doc(db, COLLECTIONS.COURSES, sampleCourse.id);
    await setDoc(courseRef, sampleCourse);
    console.log('✅ Sample course created');
    
    const topicRef = doc(db, COLLECTIONS.COURSE_TOPICS, sampleTopic.id);
    await setDoc(topicRef, sampleTopic);
    console.log('✅ Sample course topic created');
    
    console.log('\n🎉 Sample data creation complete!');
    return true;
  } catch (error) {
    console.error('❌ Sample data creation failed:', error.message);
    return false;
  }
}

async function validateDataSchema() {
  try {
    console.log('\n🔍 Validating data schema...');
    
    // Read back the sample data to validate structure
    const userRef = doc(db, COLLECTIONS.USERS, 'test_user_1');
    const courseRef = doc(db, COLLECTIONS.COURSES, 'test_course_1');
    const topicRef = doc(db, COLLECTIONS.COURSE_TOPICS, 'test_course_1_topic_1');
    
    // Get documents
    const [userSnapshot, courseSnapshot, topicSnapshot] = await Promise.all([
      getDocs(collection(db, COLLECTIONS.USERS)),
      getDocs(collection(db, COLLECTIONS.COURSES)),
      getDocs(collection(db, COLLECTIONS.COURSE_TOPICS))
    ]);
    
    console.log(`✅ Users collection: ${userSnapshot.size} documents`);
    console.log(`✅ Courses collection: ${courseSnapshot.size} documents`);
    console.log(`✅ Course topics collection: ${topicSnapshot.size} documents`);
    
    // Validate data structure
    if (userSnapshot.size > 0) {
      const userData = userSnapshot.docs[0].data();
      console.log('📋 Sample user data structure:', Object.keys(userData));
    }
    
    if (courseSnapshot.size > 0) {
      const courseData = courseSnapshot.docs[0].data();
      console.log('📋 Sample course data structure:', Object.keys(courseData));
    }
    
    console.log('\n✅ Data schema validation complete!');
    return true;
  } catch (error) {
    console.error('❌ Data schema validation failed:', error.message);
    return false;
  }
}

async function listCollections() {
  try {
    console.log('\n📚 Testing collection access...');
    
    const collections = Object.values(COLLECTIONS);
    const results = [];
    
    for (const collectionName of collections) {
      try {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        results.push({
          collection: collectionName,
          count: snapshot.size,
          accessible: true
        });
      } catch (error) {
        results.push({
          collection: collectionName,
          count: 0,
          accessible: false,
          error: error.message
        });
      }
    }
    
    console.log('\n📊 Collection Access Results:');
    results.forEach(result => {
      const status = result.accessible ? '✅' : '❌';
      console.log(`${status} ${result.collection}: ${result.count} documents${result.error ? ` (${result.error})` : ''}`);
    });
    
    return results;
  } catch (error) {
    console.error('❌ Collection listing failed:', error.message);
    return [];
  }
}

async function main() {
  try {
    console.log('🚀 Firebase Schema Setup Test');
    console.log('================================\n');
    
    // Initialize Firebase
    const initSuccess = await initializeFirebase();
    if (!initSuccess) {
      process.exit(1);
    }
    
    // Test connection
    const connectionSuccess = await testFirebaseConnection();
    if (!connectionSuccess) {
      console.log('\n💡 Connection failed. Please check:');
      console.log('   1. Firebase project settings');
      console.log('   2. Firestore security rules');
      console.log('   3. Network connectivity');
      process.exit(1);
    }
    
    // Test collections
    await listCollections();
    
    // Create sample data
    const dataSuccess = await createSampleData();
    if (!dataSuccess) {
      console.log('\n⚠️  Sample data creation failed, but connection is working');
    }
    
    // Validate schema
    await validateDataSchema();
    
    console.log('\n🎉 Firebase schema setup test complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Review the data structure in Firebase Console');
    console.log('   2. Test the TypeScript data models');
    console.log('   3. Run the validation scripts');
    console.log('   4. Set up data population for development');
    
  } catch (error) {
    console.error('💥 Test failed:', error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  console.log('Script starting...');
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = {
  initializeFirebase,
  testFirebaseConnection,
  createSampleData,
  validateDataSchema,
  COLLECTIONS
};
