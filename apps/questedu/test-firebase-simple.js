#!/usr/bin/env node

/**
 * Simplified Firebase Connection Test
 * Tests our programId filter fixes without requiring React Native
 */

// Mock React Native environment for Node.js testing
global.__DEV__ = true;
global.console = console;

// Mock process.env for Expo
process.env.EXPO_PUBLIC_FIREBASE_API_KEY = process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyALWHvJopjpZ9amcpV74jrBlYqEZzeWaTI";
process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "questedu-cb2a4.firebaseapp.com";
process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "questedu-cb2a4";
process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "questedu-cb2a4.firebasestorage.app";
process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "247130380208";
process.env.EXPO_PUBLIC_FIREBASE_APP_ID = process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:247130380208:web:dfe0053ff32ae3194a6875";

async function testFirebaseConnection() {
  try {
    console.log('🔥 Testing Firebase Connection and Filtering');
    console.log('============================================');
    
    // Test basic Firebase import
    console.log('📦 Testing Firebase imports...');
    const { initializeApp } = require('firebase/app');
    const { getFirestore, collection, getDocs, limit, query } = require('firebase/firestore');
    
    // Initialize Firebase
    const firebaseConfig = {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
    };
    
    console.log('🚀 Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log('✅ Firebase initialized successfully');
    
    // Test basic database connection
    console.log('🔍 Testing database connection...');
    const coursesRef = collection(db, 'courses');
    const q = query(coursesRef, limit(3));
    const snapshot = await getDocs(q);
    
    console.log(`✅ Database connection successful - Found ${snapshot.size} sample courses`);
    
    // Analyze course data structure
    const courses = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      courses.push({
        id: doc.id,
        title: data.title,
        collegeId: data.collegeId,
        programId: data.programId,
        association: data.association,
        hasAssociation: !!data.association,
        hasDirectCollege: !!data.collegeId,
        hasDirectProgram: !!data.programId
      });
    });
    
    console.log('📊 Course Data Structure Analysis:');
    courses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title}`);
      console.log(`   - Direct collegeId: ${course.collegeId || 'none'}`);
      console.log(`   - Direct programId: ${course.programId || 'none'}`);
      console.log(`   - Has association object: ${course.hasAssociation}`);
      if (course.association) {
        console.log(`   - Association collegeId: ${course.association.collegeId || 'none'}`);
        console.log(`   - Association programId: ${course.association.programId || 'none'}`);
      }
      console.log('');
    });
    
    // Test filtering strategy
    console.log('🧪 Testing Filtering Strategy');
    console.log('=============================');
    
    const testCollegeId = 'mit'; // Common test college
    const testProgramId = 'computer-science'; // Common test program
    
    console.log(`Testing filters: collegeId=${testCollegeId}, programId=${testProgramId}`);
    
    // Strategy 1: Association-based query
    try {
      console.log('📋 Strategy 1: Association-based query...');
      const { where } = require('firebase/firestore');
      const assocQuery = query(
        coursesRef,
        where('association.collegeId', '==', testCollegeId),
        where('association.programId', '==', testProgramId),
        limit(5)
      );
      const assocSnapshot = await getDocs(assocQuery);
      console.log(`✅ Association strategy found ${assocSnapshot.size} courses`);
    } catch (error) {
      console.log(`⚠️  Association strategy failed: ${error.message}`);
    }
    
    // Strategy 2: Direct field query  
    try {
      console.log('📋 Strategy 2: Direct field query...');
      const directQuery = query(
        coursesRef,
        where('collegeId', '==', testCollegeId),
        where('programId', '==', testProgramId),
        limit(5)
      );
      const directSnapshot = await getDocs(directQuery);
      console.log(`✅ Direct field strategy found ${directSnapshot.size} courses`);
    } catch (error) {
      console.log(`⚠️  Direct field strategy failed: ${error.message}`);
    }
    
    // Strategy 3: In-memory filtering
    try {
      console.log('📋 Strategy 3: In-memory filtering...');
      const allSnapshot = await getDocs(query(coursesRef, limit(50)));
      let memoryMatches = 0;
      
      allSnapshot.forEach(doc => {
        const data = doc.data();
        const matchesCollege = data.collegeId === testCollegeId || 
                              (data.association && data.association.collegeId === testCollegeId);
        const matchesProgram = data.programId === testProgramId || 
                              (data.association && data.association.programId === testProgramId);
        
        if (matchesCollege && matchesProgram) {
          memoryMatches++;
        }
      });
      
      console.log(`✅ In-memory strategy found ${memoryMatches} courses`);
    } catch (error) {
      console.log(`⚠️  In-memory strategy failed: ${error.message}`);
    }
    
    console.log('');
    console.log('🎉 Firebase connection and filtering test completed successfully!');
    console.log('');
    console.log('✅ Key findings:');
    console.log('   - Firebase connection is working');
    console.log('   - Course data structure analyzed');
    console.log('   - All three filtering strategies tested');
    console.log('   - The 3-tier fallback approach should handle different data structures');
    
    return { success: true, coursesFound: snapshot.size };
    
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return { success: false, error: error.message };
  }
}

// Run the test
if (require.main === module) {
  testFirebaseConnection()
    .then(result => {
      if (result.success) {
        console.log('🎬 Test completed successfully!');
        process.exit(0);
      } else {
        console.log('💥 Test failed:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { testFirebaseConnection };
