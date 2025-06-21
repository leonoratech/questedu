#!/usr/bin/env node

/**
 * Non-Interactive Database Clear Script for QuestAdmin
 * 
 * This script clears all data from the QuestAdmin database without user prompts.
 * Use this for automated workflows and testing.
 * 
 * Usage: node scripts/clear-database-auto.js
 * 
 * WARNING: This will permanently delete ALL data in the database!
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, deleteDoc, writeBatch } = require('firebase/firestore');

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

// Collections to clear
const COLLECTIONS_TO_CLEAR = [
  'users',
  'courses',
  'courseTopics',
  'courseQuestions', 
  'colleges',
  'enrollments',
  'activities',
  'notifications',
  'assignments',
  'submissions',
  'quizzes',
  'quizSubmissions',
  'discussions',
  'announcements'
];

/**
 * Delete all documents in a collection using batched writes
 */
async function clearCollection(collectionName) {
  console.log(`🗑️  Clearing collection: ${collectionName}`);
  
  try {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    
    if (snapshot.empty) {
      console.log(`   ✅ Collection '${collectionName}' is already empty`);
      return 0;
    }
    
    const totalDocs = snapshot.size;
    console.log(`   📊 Found ${totalDocs} documents to delete`);
    
    // Delete in batches (Firestore limit is 500 operations per batch)
    const batchSize = 500;
    let deletedCount = 0;
    const docs = snapshot.docs;
    
    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = writeBatch(db);
      const batchDocs = docs.slice(i, i + batchSize);
      
      batchDocs.forEach(docSnapshot => {
        batch.delete(docSnapshot.ref);
      });
      
      await batch.commit();
      deletedCount += batchDocs.length;
      
      console.log(`   🔄 Deleted ${deletedCount}/${totalDocs} documents...`);
    }
    
    console.log(`   ✅ Collection '${collectionName}' cleared successfully`);
    return totalDocs;
    
  } catch (error) {
    console.error(`   ❌ Error clearing collection '${collectionName}':`, error.message);
    throw error;
  }
}

/**
 * Get statistics for all collections
 */
async function getCollectionStats() {
  console.log('📊 Getting database statistics...');
  
  const stats = {};
  let totalDocuments = 0;
  
  for (const collectionName of COLLECTIONS_TO_CLEAR) {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      const count = snapshot.size;
      stats[collectionName] = count;
      totalDocuments += count;
      
      if (count > 0) {
        console.log(`   • ${collectionName}: ${count} documents`);
      }
    } catch (error) {
      console.log(`   • ${collectionName}: Error accessing collection`);
      stats[collectionName] = 0;
    }
  }
  
  console.log(`\n📋 Total documents to delete: ${totalDocuments}\n`);
  return { stats, totalDocuments };
}

/**
 * Clear course subcollections (questions, answers, topics)
 */
async function clearCourseSubcollections() {
  console.log('🔍 Clearing course subcollections...');
  
  try {
    const coursesSnapshot = await getDocs(collection(db, 'courses'));
    
    for (const courseDoc of coursesSnapshot.docs) {
      const courseId = courseDoc.id;
      
      // Clear questions for this course
      const questionsSnapshot = await getDocs(collection(db, 'courses', courseId, 'questions'));
      for (const questionDoc of questionsSnapshot.docs) {
        await deleteDoc(questionDoc.ref);
      }
      
      // Clear topics for this course
      const topicsSnapshot = await getDocs(collection(db, 'courses', courseId, 'topics'));
      for (const topicDoc of topicsSnapshot.docs) {
        await deleteDoc(topicDoc.ref);
      }
    }
    
    console.log('✅ Course subcollections cleared');
  } catch (error) {
    console.error('❌ Error clearing course subcollections:', error.message);
  }
}

/**
 * Main clearing function (non-interactive)
 */
async function clearDatabaseAuto() {
  console.log('🧹 QuestAdmin Automated Database Clear');
  console.log('=' .repeat(50));
  console.log('🤖 Running in automated mode - no user confirmation required');
  console.log('');
  
  // Get current statistics
  const { stats, totalDocuments } = await getCollectionStats();
  
  if (totalDocuments === 0) {
    console.log('✅ Database is already empty. Nothing to clear.');
    return;
  }
  
  console.log('🗑️  The following data will be permanently deleted:');
  Object.entries(stats).forEach(([collection, count]) => {
    if (count > 0) {
      console.log(`   • ${collection}: ${count} documents`);
    }
  });
  
  console.log('\n🚀 Starting database clearing process...');
  
  const startTime = Date.now();
  let totalDeleted = 0;
  
  try {
    // Step 1: Clear course subcollections first
    await clearCourseSubcollections();
    
    // Step 2: Clear main collections
    for (const collectionName of COLLECTIONS_TO_CLEAR) {
      const deletedCount = await clearCollection(collectionName);
      totalDeleted += deletedCount;
    }
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n🎉 Database clearing completed successfully!');
    console.log(`📊 Total documents deleted: ${totalDeleted}`);
    console.log(`⏱️  Time taken: ${duration} seconds`);
    
  } catch (error) {
    console.error('\n💥 Database clearing failed:', error.message);
    throw error;
  }
}

/**
 * Verify that the database is empty
 */
async function verifyClear() {
  console.log('\n🔍 Verifying database is clear...');
  
  const remainingCollections = [];
  let remainingDocuments = 0;
  
  for (const collectionName of COLLECTIONS_TO_CLEAR) {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      if (!snapshot.empty) {
        remainingCollections.push(`${collectionName}: ${snapshot.size} documents`);
        remainingDocuments += snapshot.size;
      }
    } catch (error) {
      console.log(`⚠️  Could not verify collection '${collectionName}': ${error.message}`);
    }
  }
  
  if (remainingDocuments === 0) {
    console.log('✅ Verification successful! Database is completely clear.');
  } else {
    console.log('⚠️  Verification found remaining documents:');
    remainingCollections.forEach(info => console.log(`   • ${info}`));
  }
  
  return remainingDocuments === 0;
}

// Main execution
async function main() {
  try {
    await clearDatabaseAuto();
    await verifyClear();
    console.log('\n🏁 Database clear completed successfully!');
  } catch (error) {
    console.error('\n💥 Script failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { clearDatabaseAuto, clearCollection, verifyClear };
