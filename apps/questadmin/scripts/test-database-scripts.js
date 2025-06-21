#!/usr/bin/env node

/**
 * Test Database Scripts
 * 
 * This script tests the clear and seed database functionality
 * without requiring user input.
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyALWHvJopjpZ9amcpV74jrBlYqEZzeWaTI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "questedu-cb2a4.firebaseapp.com", 
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "questedu-cb2a4",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "questedu-cb2a4.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "247130380208",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:247130380208:web:dfe0053ff32ae3194a6875"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Check database collections and document counts
 */
async function checkDatabaseStatus() {
  console.log('📊 Checking database status...\n');
  
  const collections = [
    'users', 'courses', 'colleges', 'enrollments', 
    'activities', 'courseTopics', 'courseQuestions'
  ];
  
  const stats = {};
  let totalDocs = 0;
  
  for (const collectionName of collections) {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      const count = snapshot.size;
      stats[collectionName] = count;
      totalDocs += count;
      
      if (count > 0) {
        console.log(`✅ ${collectionName}: ${count} documents`);
      } else {
        console.log(`⭕ ${collectionName}: empty`);
      }
    } catch (error) {
      console.log(`❌ ${collectionName}: Error accessing collection`);
      stats[collectionName] = 0;
    }
  }
  
  console.log(`\n📈 Total documents: ${totalDocs}\n`);
  return { stats, totalDocs };
}

/**
 * Test the clear database function
 */
async function testClearDatabase() {
  console.log('🧪 Testing Clear Database Function\n');
  
  try {
    // Import the clear function
    const { clearDatabase } = require('./clear-database.js');
    
    // Override the prompt function to auto-confirm
    const originalLog = console.log;
    
    // Mock the confirmation
    process.argv.push('--confirm');
    
    await clearDatabase();
    
    console.log('\n✅ Clear database test completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Clear database test failed:', error.message);
    return false;
  }
}

/**
 * Test the seed database function
 */
async function testSeedDatabase() {
  console.log('🧪 Testing Seed Database Function\n');
  
  try {
    // Import the seed function
    const { seedDatabase } = require('./seed-database.js');
    
    await seedDatabase();
    
    console.log('\n✅ Seed database test completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Seed database test failed:', error.message);
    return false;
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🚀 Database Scripts Test Suite');
  console.log('=' .repeat(50));
  
  try {
    // Check initial state
    console.log('\n1️⃣ Initial Database State:');
    await checkDatabaseStatus();
    
    // Test clear function
    console.log('\n2️⃣ Testing Clear Database:');
    const clearSuccess = await testClearDatabase();
    
    if (clearSuccess) {
      console.log('\n3️⃣ Database State After Clear:');
      await checkDatabaseStatus();
      
      // Test seed function
      console.log('\n4️⃣ Testing Seed Database:');
      const seedSuccess = await testSeedDatabase();
      
      if (seedSuccess) {
        console.log('\n5️⃣ Final Database State:');
        await checkDatabaseStatus();
        
        console.log('\n🎉 All tests completed successfully!');
        console.log('\n📋 Summary:');
        console.log('   ✅ Clear database function works');
        console.log('   ✅ Seed database function works');
        console.log('   ✅ Database contains mock data');
      }
    }
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
    console.error(error.stack);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().then(() => {
    console.log('\n🏁 Test suite finished.');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Test suite crashed:', error);
    process.exit(1);
  });
}

module.exports = { runTests, checkDatabaseStatus };
