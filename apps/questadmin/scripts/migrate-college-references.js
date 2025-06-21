#!/usr/bin/env node

/**
 * Database Migration Script: Migrate College Text to College ID References
 * 
 * This script migrates existing user profiles that have college names stored as text
 * to use college ID references instead, while maintaining backward compatibility.
 * 
 * Usage: node scripts/migrate-college-references.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, getDocs, updateDoc, doc, where } = require('firebase/firestore');

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
 * Create a case-insensitive matcher for college names
 */
function normalizeCollegeName(name) {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Find college ID by name (case-insensitive)
 */
async function findCollegeByName(collegeName, colleges) {
  const normalizedSearchName = normalizeCollegeName(collegeName);
  
  return colleges.find(college => {
    const normalizedCollegeName = normalizeCollegeName(college.name);
    return normalizedCollegeName === normalizedSearchName;
  });
}

async function migrateCollegeReferences() {
  console.log('🚀 Starting college reference migration...');
  
  try {
    // Step 1: Load all colleges
    console.log('📋 Loading colleges...');
    const collegesRef = collection(db, 'colleges');
    const collegesSnapshot = await getDocs(collegesRef);
    
    const colleges = [];
    collegesSnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      colleges.push({
        id: docSnapshot.id,
        name: data.name,
        ...data
      });
    });
    
    console.log(`📊 Found ${colleges.length} colleges in the database`);
    
    if (colleges.length === 0) {
      console.log('⚠️  No colleges found. Please add colleges before running migration.');
      return;
    }
    
    // Step 2: Find users with college text but no collegeId
    console.log('👥 Finding users to migrate...');
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    const usersToMigrate = [];
    const migrationStats = {
      matched: 0,
      unmatched: 0,
      alreadyMigrated: 0,
      errors: 0
    };
    
    usersSnapshot.forEach((docSnapshot) => {
      const userData = docSnapshot.data();
      const userId = docSnapshot.id;
      
      // Skip if user already has collegeId
      if (userData.collegeId) {
        migrationStats.alreadyMigrated++;
        return;
      }
      
      // Skip if user has no college name
      if (!userData.college || typeof userData.college !== 'string' || !userData.college.trim()) {
        return;
      }
      
      usersToMigrate.push({
        id: userId,
        collegeName: userData.college.trim(),
        userData
      });
    });
    
    console.log(`📊 Found ${usersToMigrate.length} users to migrate`);
    console.log(`   • Already migrated: ${migrationStats.alreadyMigrated}`);
    
    if (usersToMigrate.length === 0) {
      console.log('✅ No users need migration. All users are already migrated or have no college data.');
      return;
    }
    
    // Step 3: Process each user
    console.log('🔄 Processing users...');
    const migrationPromises = [];
    
    for (const user of usersToMigrate) {
      try {
        const matchedCollege = await findCollegeByName(user.collegeName, colleges);
        
        if (matchedCollege) {
          console.log(`✅ Matching college found for ${user.userData.email}: "${user.collegeName}" → ${matchedCollege.name} (${matchedCollege.id})`);
          
          // Update user with college ID
          const updatePromise = updateDoc(doc(db, 'users', user.id), {
            collegeId: matchedCollege.id,
            // Keep the original college name for backward compatibility
            college: user.collegeName,
            updatedAt: new Date(),
            // Add migration metadata
            migrationInfo: {
              migratedCollegeAt: new Date(),
              originalCollegeName: user.collegeName,
              migratedToCollegeId: matchedCollege.id,
              migratedBy: 'college-reference-migration-script'
            }
          });
          
          migrationPromises.push(updatePromise);
          migrationStats.matched++;
        } else {
          console.log(`⚠️  No matching college found for ${user.userData.email}: "${user.collegeName}"`);
          migrationStats.unmatched++;
        }
      } catch (error) {
        console.error(`❌ Error processing user ${user.userData.email}:`, error.message);
        migrationStats.errors++;
      }
    }
    
    // Step 4: Execute all updates
    if (migrationPromises.length > 0) {
      console.log(`💾 Updating ${migrationPromises.length} user records...`);
      await Promise.all(migrationPromises);
    }
    
    // Step 5: Display results
    console.log('✅ Migration completed!');
    console.log('\n📊 Migration Statistics:');
    console.log(`   • Users matched and migrated: ${migrationStats.matched}`);
    console.log(`   • Users with unmatched colleges: ${migrationStats.unmatched}`);
    console.log(`   • Users already migrated: ${migrationStats.alreadyMigrated}`);
    console.log(`   • Errors: ${migrationStats.errors}`);
    
    if (migrationStats.unmatched > 0) {
      console.log('\n⚠️  Users with unmatched colleges:');
      for (const user of usersToMigrate) {
        const matchedCollege = await findCollegeByName(user.collegeName, colleges);
        if (!matchedCollege) {
          console.log(`   • ${user.userData.email}: "${user.collegeName}"`);
        }
      }
      console.log('\n💡 Consider:');
      console.log('   1. Adding these colleges to the colleges collection');
      console.log('   2. Or manually matching them to existing colleges');
      console.log('   3. Re-running this script after adding missing colleges');
    }
    
    console.log('\n📋 Next Steps:');
    console.log('   • Review unmatched colleges and add them if needed');
    console.log('   • Update application code to use collegeId for new users');
    console.log('   • Consider cleanup of old college text fields after testing');
    
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
    const usersSnapshot = await getDocs(usersRef);
    
    let totalUsers = 0;
    let usersWithCollegeId = 0;
    let usersWithCollegeName = 0;
    let usersWithBoth = 0;
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      totalUsers++;
      
      if (userData.collegeId) usersWithCollegeId++;
      if (userData.college) usersWithCollegeName++;
      if (userData.collegeId && userData.college) usersWithBoth++;
    });
    
    console.log('✅ Verification completed!');
    console.log(`   • Total users: ${totalUsers}`);
    console.log(`   • Users with collegeId: ${usersWithCollegeId}`);
    console.log(`   • Users with college name: ${usersWithCollegeName}`);
    console.log(`   • Users with both: ${usersWithBoth}`);
    
    return true;
  } catch (error) {
    console.error('❌ Verification failed:', error);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🎯 QuestEdu College Reference Migration');
  console.log('=' .repeat(50));
  
  try {
    await migrateCollegeReferences();
    const verified = await verifyMigration();
    
    if (verified) {
      console.log('\n🎉 Migration completed successfully!');
      console.log('Users now reference colleges by ID where possible.');
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

module.exports = { migrateCollegeReferences, verifyMigration };
