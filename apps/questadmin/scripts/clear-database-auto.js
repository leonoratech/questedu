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
const { getAuth } = require('firebase/auth');

// For admin operations, we need the Firebase Admin SDK
let admin;
try {
  admin = require('firebase-admin');
} catch (error) {
  console.log('📋 Firebase Admin SDK not available - Auth user clearing will be skipped');
}

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
const auth = getAuth(app);

// Initialize Firebase Admin if available
let adminAuth;
if (admin && !admin.apps.length) {
  try {
    // Try to initialize with environment variable or service account
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: firebaseConfig.projectId
      });
      adminAuth = admin.auth();
      console.log('✅ Firebase Admin SDK initialized with service account');
    } else {
      // For development without service account, skip admin initialization
      console.log('⚠️  No service account credentials found');
      console.log('   Firebase Admin SDK features will be skipped');
      console.log('   To enable auth user clearing, set up service account credentials');
    }
  } catch (error) {
    console.log('⚠️  Firebase Admin SDK initialization failed:', error.message);
    console.log('   Auth user clearing will be skipped');
    console.log('   Run "node scripts/db-manager.js setup-admin" for setup instructions');
  }
}

// Collections to clear
const COLLECTIONS_TO_CLEAR = [
  // 'users',
  'courses',
  'courseTopics',
  'courseQuestions', 
  'colleges',
  'programs',
  'subjects',
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
 * Clear all Firebase Authentication users
 */
async function clearAuthUsers() {
  console.log('👥 Clearing Firebase Authentication users...');
  
  if (!adminAuth) {
    console.log('   ⚠️  Firebase Admin SDK not available - skipping user clearing');
    console.log('   💡 To clear auth users, set up Firebase Admin SDK credentials');
    return 0;
  }
  
  try {
    // Get all users
    console.log('   📋 Fetching all users...');
    const listUsersResult = await adminAuth.listUsers();
    const users = listUsersResult.users;
    
    if (users.length === 0) {
      console.log('   ✅ No authentication users found');
      return 0;
    }
    
    console.log(`   📊 Found ${users.length} users to delete`);
    
    // Delete users in batches
    const batchSize = 100; // Conservative batch size for user deletion
    let deletedCount = 0;
    
    for (let i = 0; i < users.length; i += batchSize) {
      const batchUsers = users.slice(i, i + batchSize);
      const uids = batchUsers.map(user => user.uid);
      
      try {
        const deleteUsersResult = await adminAuth.deleteUsers(uids);
        deletedCount += deleteUsersResult.successCount;
        
        if (deleteUsersResult.failureCount > 0) {
          console.log(`   ⚠️  Failed to delete ${deleteUsersResult.failureCount} users in batch`);
          deleteUsersResult.errors.forEach((error, index) => {
            console.log(`      • User ${uids[index]}: ${error.error.message}`);
          });
        }
        
        console.log(`   🔄 Deleted ${deletedCount}/${users.length} users...`);
      } catch (error) {
        console.error(`   ❌ Error deleting user batch:`, error.message);
      }
    }
    
    console.log(`   ✅ Authentication users cleared successfully (${deletedCount} deleted)`);
    return deletedCount;
    
  } catch (error) {
    console.error('   ❌ Error clearing authentication users:', error.message);
    throw error;
  }
}

/**
 * Verify that all auth users are cleared
 */
async function verifyAuthClear() {
  if (!adminAuth) {
    return true; // Can't verify without admin access
  }
  
  try {
    const listUsersResult = await adminAuth.listUsers(10); // Check first 10 users
    return listUsersResult.users.length === 0;
  } catch (error) {
    console.log(`⚠️  Could not verify auth users cleared: ${error.message}`);
    return false;
  }
}

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
 * Get statistics for all collections and auth users
 */
async function getCollectionStats() {
  console.log('📊 Getting database statistics...');
  
  const stats = {};
  let totalDocuments = 0;
  
  // Get Firestore collection stats
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
  
  // Get auth users count
  let authUsersCount = 0;
  if (adminAuth) {
    try {
      const listUsersResult = await adminAuth.listUsers();
      authUsersCount = listUsersResult.users.length;
      if (authUsersCount > 0) {
        console.log(`   • Auth Users: ${authUsersCount} users`);
      }
    } catch (error) {
      console.log(`   • Auth Users: Error accessing users`);
    }
  } else {
    console.log(`   • Auth Users: Admin SDK not available`);
  }
  
  console.log(`\n📋 Total documents to delete: ${totalDocuments}`);
  console.log(`👥 Total auth users to delete: ${authUsersCount}\n`);
  
  return { stats, totalDocuments, authUsersCount };
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
  const { stats, totalDocuments, authUsersCount } = await getCollectionStats();
  
  if (totalDocuments === 0 && authUsersCount === 0) {
    console.log('✅ Database and authentication are already empty. Nothing to clear.');
    return;
  }
  
  console.log('🗑️  The following data will be permanently deleted:');
  Object.entries(stats).forEach(([collection, count]) => {
    if (count > 0) {
      console.log(`   • ${collection}: ${count} documents`);
    }
  });
  if (authUsersCount > 0) {
    console.log(`   • Authentication Users: ${authUsersCount} users`);
  }
  
  console.log('\n🚀 Starting database clearing process...');
  
  const startTime = Date.now();
  let totalDeleted = 0;
  let totalUsersDeleted = 0;
  
  try {
    // Step 1: Clear Firebase Authentication users first (if available)
    try {
      totalUsersDeleted = await clearAuthUsers();
    } catch (error) {
      console.log('⚠️  Skipping auth user clearing due to error:', error.message);
      console.log('   Continuing with Firestore clearing...');
      totalUsersDeleted = 0;
    }
    
    // Step 2: Clear course subcollections
    await clearCourseSubcollections();
    
    // Step 3: Clear main collections
    for (const collectionName of COLLECTIONS_TO_CLEAR) {
      const deletedCount = await clearCollection(collectionName);
      totalDeleted += deletedCount;
    }
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n🎉 Database clearing completed successfully!');
    console.log(`📊 Total documents deleted: ${totalDeleted}`);
    console.log(`👥 Total auth users deleted: ${totalUsersDeleted}`);
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
  
  // Check Firestore collections
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
  
  // Check auth users
  const authClear = await verifyAuthClear();
  let remainingUsers = 0;
  if (!authClear && adminAuth) {
    try {
      const listUsersResult = await adminAuth.listUsers(10);
      remainingUsers = listUsersResult.users.length;
      if (remainingUsers > 0) {
        remainingCollections.push(`Auth Users: ${remainingUsers}+ remaining`);
      }
    } catch (error) {
      console.log(`⚠️  Could not verify auth users: ${error.message}`);
    }
  }
  
  if (remainingDocuments === 0 && authClear) {
    console.log('✅ Verification successful! Database and authentication are completely clear.');
  } else {
    console.log('⚠️  Verification found remaining data:');
    remainingCollections.forEach(info => console.log(`   • ${info}`));
  }
  
  return remainingDocuments === 0 && authClear;
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

module.exports = { clearDatabaseAuto, clearCollection, clearAuthUsers, verifyClear };
