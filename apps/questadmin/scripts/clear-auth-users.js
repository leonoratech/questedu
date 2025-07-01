#!/usr/bin/env node

/**
 * Clear Firebase Auth Users Script
 * 
 * This is a simplified script to clear Firebase Authentication users.
 * Use this when you need to clear existing users before seeding new ones.
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');

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
initializeApp(firebaseConfig);

// Try to load Firebase Admin
let admin;
try {
  admin = require('firebase-admin');
} catch (error) {
  console.error('❌ Firebase Admin SDK not available. Please install it:');
  console.log('   pnpm add firebase-admin');
  process.exit(1);
}

/**
 * Clear all Firebase Authentication users
 */
async function clearAuthUsers() {
  console.log('👥 Clearing Firebase Authentication Users');
  console.log('=' .repeat(50));
  
  try {
    // Initialize Firebase Admin with service account credentials
    if (!admin.apps.length) {
      if (process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL && process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY) {
        const serviceAccount = {
          type: "service_account",
          project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          client_email: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
          private_key: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        };
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: firebaseConfig.projectId
        });
        console.log('✅ Firebase Admin SDK initialized with service account from environment variables');
      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          projectId: firebaseConfig.projectId
        });
        console.log('✅ Firebase Admin SDK initialized with service account file');
      } else {
        throw new Error('No service account credentials found. Please check your .env.local file.');
      }
    }
    
    const adminAuth = admin.auth();
    
    // Get all users
    console.log('📋 Fetching all users...');
    const listUsersResult = await adminAuth.listUsers();
    const users = listUsersResult.users;
    
    if (users.length === 0) {
      console.log('✅ No authentication users found to delete');
      return;
    }
    
    console.log(`📊 Found ${users.length} users to delete`);
    
    // Show users that will be deleted
    console.log('\n🗑️  Users to be deleted:');
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email || user.uid} (${user.uid})`);
    });
    
    // Delete users in batches
    const batchSize = 100;
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
    
    console.log(`\n✅ Successfully deleted ${deletedCount} authentication users`);
    
    // Verify clearing
    const verifyResult = await adminAuth.listUsers(10);
    if (verifyResult.users.length === 0) {
      console.log('✅ Verification successful: All auth users deleted');
    } else {
      console.log(`⚠️  Verification: ${verifyResult.users.length} users still remain`);
    }
    
  } catch (error) {
    console.error('❌ Error clearing authentication users:', error.message);
    
    if (error.message.includes('credentials')) {
      console.log('\n💡 Tips for Firebase Admin setup:');
      console.log('1. For local development, you can use the Firebase emulator');
      console.log('2. For production, set up service account credentials');
      console.log('3. Set GOOGLE_APPLICATION_CREDENTIALS environment variable');
      console.log('4. Or place firebase-service-account.json in your project');
    }
    
    throw error;
  }
}

// Main execution
async function main() {
  try {
    await clearAuthUsers();
    console.log('\n🎉 Auth users clearing completed successfully!');
    console.log('\n🚀 Next steps:');
    console.log('   • You can now run the seed script without email conflicts');
    console.log('   • Use: node scripts/db-manager.js seed');
  } catch (error) {
    console.error('\n💥 Script failed:', error.message);
    process.exit(1);
  }
}

// Run if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = { clearAuthUsers };
