#!/usr/bin/env node

/**
 * Simple test script to verify superadmin functionality
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');

// Firebase configuration (using same config as the app)
const firebaseConfig = {
  apiKey: "AIzaSyALWHvJopjpZ9amcpV74jrBlYqEZzeWaTI",
  authDomain: "questedu-cb2a4.firebaseapp.com", 
  projectId: "questedu-cb2a4",
  storageBucket: "questedu-cb2a4.firebasestorage.app",
  messagingSenderId: "247130380208",
  appId: "1:247130380208:web:dfe0053ff32ae3194a6875"
};

async function testFirebaseConnection() {
  console.log('🔥 Testing Firebase connection...');
  
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase initialized successfully');
    
    // Test Firestore connection by checking users collection
    const usersRef = collection(db, 'users');
    const superAdminQuery = query(usersRef, where('role', '==', 'superadmin'));
    
    console.log('🔍 Checking for existing superadmin accounts...');
    const superAdminSnapshot = await getDocs(superAdminQuery);
    
    console.log(`📊 Found ${superAdminSnapshot.size} superadmin account(s)`);
    
    if (!superAdminSnapshot.empty) {
      superAdminSnapshot.forEach((doc) => {
        const userData = doc.data();
        console.log(`   • ${userData.email} (${userData.firstName} ${userData.lastName})`);
      });
    }
    
    // Test regular user query
    const allUsersSnapshot = await getDocs(usersRef);
    console.log(`👥 Total users in database: ${allUsersSnapshot.size}`);
    
    console.log('✅ Firebase connection and queries working properly!');
    
  } catch (error) {
    console.error('❌ Firebase test failed:', error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
  }
}

async function main() {
  console.log('🎯 QuestEdu Super Admin Test');
  console.log('=' .repeat(50));
  
  await testFirebaseConnection();
  
  console.log('\n🏁 Test completed!');
}

if (require.main === module) {
  main().catch(console.error);
}
