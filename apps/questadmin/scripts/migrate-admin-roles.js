#!/usr/bin/env node

/**
 * Database Migration Script: Remove Admin Role
 * 
 * This script migrates existing admin users to instructor role
 * and ensures the system only has instructor and student roles.
 * 
 * Usage: node scripts/migrate-admin-roles.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, updateDoc, doc } = require('firebase/firestore');

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

async function migrateAdminRoles() {
  console.log('🚀 Starting admin role migration...');
  
  try {
    // Find all users with admin role
    const usersRef = collection(db, 'users');
    const adminQuery = query(usersRef, where('role', '==', 'admin'));
    const adminSnapshot = await getDocs(adminQuery);
    
    if (adminSnapshot.empty) {
      console.log('✅ No admin users found. Migration not needed.');
      return;
    }
    
    console.log(`📊 Found ${adminSnapshot.size} admin users to migrate`);
    
    const migrationPromises = [];
    const migratedUsers = [];
    
    adminSnapshot.forEach((docSnapshot) => {
      const userData = docSnapshot.data();
      const userId = docSnapshot.id;
      
      console.log(`📝 Migrating user: ${userData.email} (${userData.firstName} ${userData.lastName})`);
      
      // Update admin users to instructor role
      const updatePromise = updateDoc(doc(db, 'users', userId), {
        role: 'instructor',
        updatedAt: new Date(),
        // Add migration metadata
        migrationInfo: {
          previousRole: 'admin',
          migratedAt: new Date(),
          migratedBy: 'admin-role-removal-script'
        }
      });
      
      migrationPromises.push(updatePromise);
      migratedUsers.push({
        id: userId,
        email: userData.email,
        name: `${userData.firstName} ${userData.lastName}`
      });
    });
    
    // Execute all updates
    await Promise.all(migrationPromises);
    
    console.log('✅ Migration completed successfully!');
    console.log('\n📋 Migration Summary:');
    console.log(`   • Total users migrated: ${migratedUsers.length}`);
    console.log(`   • All admin users converted to instructor role`);
    
    console.log('\n👥 Migrated Users:');
    migratedUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email})`);
    });
    
    console.log('\n⚠️  Important Notes:');
    console.log('   • All former admin users now have instructor privileges');
    console.log('   • They can manage courses and users');
    console.log('   • Original role information is preserved in migrationInfo field');
    console.log('   • No data was lost during migration');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('\n🔧 Troubleshooting:');
    console.error('   • Check your Firebase configuration');
    console.error('   • Ensure you have proper database permissions');
    console.error('   • Verify network connectivity');
    throw error;
  }
}

async function verifyMigration() {
  console.log('\n🔍 Verifying migration...');
  
  try {
    const usersRef = collection(db, 'users');
    
    // Check for any remaining admin users
    const remainingAdminQuery = query(usersRef, where('role', '==', 'admin'));
    const remainingAdminSnapshot = await getDocs(remainingAdminQuery);
    
    if (!remainingAdminSnapshot.empty) {
      console.log('⚠️  Warning: Found remaining admin users:');
      remainingAdminSnapshot.forEach((doc) => {
        const userData = doc.data();
        console.log(`   • ${userData.email} (${userData.firstName} ${userData.lastName})`);
      });
      return false;
    }
    
    // Count users by role
    const instructorQuery = query(usersRef, where('role', '==', 'instructor'));
    const studentQuery = query(usersRef, where('role', '==', 'student'));
    
    const [instructorSnapshot, studentSnapshot] = await Promise.all([
      getDocs(instructorQuery),
      getDocs(studentQuery)
    ]);
    
    console.log('✅ Migration verification successful!');
    console.log(`   • Instructors: ${instructorSnapshot.size}`);
    console.log(`   • Students: ${studentSnapshot.size}`);
    console.log(`   • Admin users: 0`);
    
    return true;
  } catch (error) {
    console.error('❌ Verification failed:', error);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🎯 QuestEdu Admin Role Migration');
  console.log('=' .repeat(50));
  
  try {
    await migrateAdminRoles();
    const verified = await verifyMigration();
    
    if (verified) {
      console.log('\n🎉 Migration completed successfully!');
      console.log('The system now uses only instructor and student roles.');
    } else {
      console.log('\n⚠️  Migration completed but verification failed.');
      console.log('Please check the database manually.');
    }
    
  } catch (error) {
    console.error('\n💥 Migration failed:', error.message);
    process.exit(1);
  }
}

// Run the migration
if (require.main === module) {
  main();
}

module.exports = { migrateAdminRoles, verifyMigration };
