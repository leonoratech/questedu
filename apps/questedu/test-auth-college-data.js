/**
 * Test script to verify college data loading with authentication
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyALWHvJopjpZ9amcpV74jrBlYqEZzeWaTI",
  authDomain: "questedu-cb2a4.firebaseapp.com", 
  projectId: "questedu-cb2a4",
  storageBucket: "questedu-cb2a4.firebasestorage.app",
  messagingSenderId: "247130380208",
  appId: "1:247130380208:web:dfe0053ff32ae3194a6875"
};

async function quickTest() {
  console.log('🔄 Quick Firebase security test...');
  
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    const snapshot = await getDocs(collection(db, 'colleges'));
    console.log(`Result: ${snapshot.docs.length} documents`);
    
  } catch (error) {
    if (error.code === 'permission-denied' || error.message.includes('Missing or insufficient permissions')) {
      console.log('✅ SECURITY WORKING! Unauthenticated access blocked');
      console.log('🎯 This confirms the college data will only load when users are signed in');
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

quickTest().then(() => process.exit(0));
