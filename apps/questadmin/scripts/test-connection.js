#!/usr/bin/env node

/**
 * Simple Database Connection Test
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

async function testConnection() {
  try {
    console.log('🔥 Testing Firebase connection...');
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase initialized successfully');
    
    // Test basic read operation
    const usersSnapshot = await getDocs(collection(db, 'users'));
    console.log(`📊 Found ${usersSnapshot.size} users in database`);
    
    const coursesSnapshot = await getDocs(collection(db, 'courses'));
    console.log(`📚 Found ${coursesSnapshot.size} courses in database`);
    
    const collegesSnapshot = await getDocs(collection(db, 'colleges'));
    console.log(`🏛️ Found ${collegesSnapshot.size} colleges in database`);
    
    console.log('✅ Database connection test successful!');
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    console.error(error.stack);
  }
}

testConnection();
