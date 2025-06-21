#!/usr/bin/env node

/**
 * Super Admin Seed Script
 * 
 * This script creates default superadmin users from seed data.
 * It's designed to run once during initial setup.
 * 
 * Usage: node scripts/seed-superadmin.js
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } = require('firebase/auth');
const { getFirestore, collection, doc, setDoc, serverTimestamp, query, where, getDocs } = require('firebase/firestore');

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
const auth = getAuth(app);
const db = getFirestore(app);

// Default superadmin seed data
const defaultSuperAdmins = [
  {
    email: 'admin@questedu.com',
    password: 'SuperAdmin@123',
    firstName: 'Quest',
    lastName: 'Administrator',
    bio: 'Default system administrator for QuestEdu platform'
  },
  {
    email: 'superadmin@questedu.com', 
    password: 'QuestEdu@2024',
    firstName: 'Super',
    lastName: 'Admin',
    bio: 'Platform super administrator with full system access'
  }
];

async function checkExistingSuperAdmins() {
  console.log('🔍 Checking for existing superadmin accounts...');
  
  try {
    const usersRef = collection(db, 'users');
    const superAdminQuery = query(usersRef, where('role', '==', 'superadmin'));
    const superAdminSnapshot = await getDocs(superAdminQuery);
    
    if (!superAdminSnapshot.empty) {
      console.log(`📊 Found ${superAdminSnapshot.size} existing superadmin(s):`);
      superAdminSnapshot.forEach((doc) => {
        const userData = doc.data();
        console.log(`   • ${userData.email} (${userData.firstName} ${userData.lastName})`);
      });
      return superAdminSnapshot.size;
    } else {
      console.log('✅ No existing superadmin accounts found.');
      return 0;
    }
  } catch (error) {
    console.error('❌ Error checking existing superadmins:', error);
    return 0;
  }
}

async function createSuperAdmin(adminData) {
  console.log(`🚀 Creating superadmin account for ${adminData.email}...`);
  
  try {
    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      adminData.email, 
      adminData.password
    );
    const user = userCredential.user;

    const displayName = `${adminData.firstName} ${adminData.lastName}`;
    
    // Update the user's display name
    await updateProfile(user, { displayName });

    // Send email verification
    await sendEmailVerification(user);

    // Create user profile in Firestore with superadmin role
    const userProfile = {
      uid: user.uid,
      email: user.email,
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      displayName,
      role: 'superadmin',
      isActive: true,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      profileCompleted: true,
      bio: adminData.bio,
      // Add metadata to track seed creation
      seedInfo: {
        createdBy: 'superadmin-seed-script',
        createdAt: serverTimestamp(),
        version: '1.0',
        isDefaultAdmin: true
      }
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);

    console.log('✅ Superadmin account created successfully!');
    console.log(`   • Email: ${adminData.email}`);
    console.log(`   • Name: ${displayName}`);
    console.log(`   • UID: ${user.uid}`);
    
    return {
      success: true,
      uid: user.uid,
      email: adminData.email,
      name: displayName
    };
    
  } catch (error) {
    console.error(`❌ Error creating superadmin ${adminData.email}:`, error.message);
    
    if (error.code === 'auth/email-already-in-use') {
      console.error('   This email is already registered.');
      return { success: false, error: 'Email already in use', email: adminData.email };
    } else if (error.code === 'auth/weak-password') {
      console.error('   Password is too weak.');
      return { success: false, error: 'Weak password', email: adminData.email };
    } else if (error.code === 'auth/invalid-email') {
      console.error('   Invalid email format.');
      return { success: false, error: 'Invalid email', email: adminData.email };
    }
    
    return {
      success: false,
      error: error.message,
      email: adminData.email
    };
  }
}

async function seedSuperAdmins() {
  console.log('🌱 Starting superadmin seed process...');
  
  const results = {
    created: [],
    failed: [],
    skipped: []
  };
  
  for (const adminData of defaultSuperAdmins) {
    try {
      const result = await createSuperAdmin(adminData);
      
      if (result.success) {
        results.created.push(result);
      } else {
        if (result.error === 'Email already in use') {
          results.skipped.push({ ...result, reason: 'Already exists' });
        } else {
          results.failed.push(result);
        }
      }
    } catch (error) {
      console.error(`💥 Unexpected error processing ${adminData.email}:`, error);
      results.failed.push({
        success: false,
        email: adminData.email,
        error: error.message
      });
    }
  }
  
  return results;
}

async function main() {
  console.log('🎯 QuestEdu Super Admin Seed Tool');
  console.log('=' .repeat(50));
  console.log('');
  
  try {
    // Check existing superadmins
    const existingCount = await checkExistingSuperAdmins();
    console.log('');
    
    // Run the seed process
    const results = await seedSuperAdmins();
    
    console.log('');
    console.log('📋 Seed Results:');
    console.log(`   • Created: ${results.created.length} superadmin(s)`);
    console.log(`   • Skipped: ${results.skipped.length} (already exist)`);
    console.log(`   • Failed: ${results.failed.length}`);
    
    if (results.created.length > 0) {
      console.log('');
      console.log('✅ Successfully created superadmin accounts:');
      results.created.forEach((admin, index) => {
        console.log(`   ${index + 1}. ${admin.name} (${admin.email})`);
      });
    }
    
    if (results.skipped.length > 0) {
      console.log('');
      console.log('⚠️  Skipped accounts (already exist):');
      results.skipped.forEach((admin, index) => {
        console.log(`   ${index + 1}. ${admin.email}`);
      });
    }
    
    if (results.failed.length > 0) {
      console.log('');
      console.log('❌ Failed to create:');
      results.failed.forEach((admin, index) => {
        console.log(`   ${index + 1}. ${admin.email} - ${admin.error}`);
      });
    }
    
    console.log('');
    console.log('🎉 Seed process completed!');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('   1. Check email accounts for verification emails');
    console.log('   2. Verify superadmin emails before first login');
    console.log('   3. Change default passwords after first login');
    console.log('   4. Test superadmin access to the admin dashboard');
    console.log('');
    console.log('⚠️  Security Notes:');
    console.log('   • Change default passwords immediately');
    console.log('   • Use strong, unique passwords for each superadmin');
    console.log('   • Enable 2FA when available');
    console.log('   • Regularly review superadmin account activity');
    console.log('   • Deactivate unused superadmin accounts');
    
  } catch (error) {
    console.error('\n💥 Seed process failed:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nOperation cancelled by user.');
  process.exit(0);
});

// Run the script
if (require.main === module) {
  main();
}

module.exports = { seedSuperAdmins, createSuperAdmin, checkExistingSuperAdmins };
