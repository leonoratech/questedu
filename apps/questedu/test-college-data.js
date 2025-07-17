/**
 * Simple test script to verify college data loading from Firebase
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

async function simpleTest() {
  console.log('🔄 Starting simple Firebase test...');
  
  try {
    const app = initializeApp(firebaseConfig);
    console.log('✅ Firebase app initialized');
    
    const db = getFirestore(app);
    console.log('✅ Firestore instance created');
    
    const collegesRef = collection(db, 'colleges');
    console.log('✅ Collections reference created');
    
    console.log('📊 Attempting to fetch colleges...');
    const snapshot = await getDocs(collegesRef);
    
    console.log(`✅ Successfully fetched ${snapshot.docs.length} documents`);
    
    if (snapshot.docs.length > 0) {
      const firstDoc = snapshot.docs[0];
      console.log('📋 First document ID:', firstDoc.id);
      console.log('📋 First document data:', firstDoc.data());
    } else {
      console.log('⚠️ No documents found in colleges collection');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

simpleTest();
