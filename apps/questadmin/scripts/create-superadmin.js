#!/usr/bin/env node

/**
 * Super Admin Creation Script
 * 
 * This script creates superadmin users directly in the database.
 * Superadmins cannot be created through the normal signup flow.
 * 
 * Usage: node scripts/create-superadmin.js
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } = require('firebase/auth');
const { getFirestore, collection, doc, setDoc, serverTimestamp, query, where, getDocs } = require('firebase/firestore');
const readline = require('readline');

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

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to prompt user input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

// Helper function to prompt for password (hidden input)
function promptPassword(question) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;
    
    stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    
    let password = '';
    stdin.on('data', function(key) {
      if (key === '\u0003') {
        // Ctrl+C
        process.exit();
      } else if (key === '\r' || key === '\n') {
        // Enter
        stdin.setRawMode(false);
        stdin.pause();
        stdout.write('\n');
        resolve(password);
      } else if (key === '\u007f') {
        // Backspace
        if (password.length > 0) {
          password = password.slice(0, -1);
          stdout.write('\b \b');
        }
      } else {
        password += key;
        stdout.write('*');
      }
    });
  });
}

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
      console.log('');
    } else {
      console.log('✅ No existing superadmin accounts found.');
      console.log('');
    }
    
    return superAdminSnapshot.size;
  } catch (error) {
    console.error('❌ Error checking existing superadmins:', error);
    return 0;
  }
}

async function createSuperAdmin(email, password, firstName, lastName) {
  console.log(`🚀 Creating superadmin account for ${email}...`);
  
  try {
    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const displayName = `${firstName} ${lastName}`;
    
    // Update the user's display name
    await updateProfile(user, { displayName });

    // Send email verification
    await sendEmailVerification(user);

    // Create user profile in Firestore with superadmin role
    const userProfile = {
      uid: user.uid,
      email: user.email,
      firstName,
      lastName,
      displayName,
      role: 'superadmin',
      isActive: true,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      profileCompleted: true, // Superadmins have completed profiles by default
      // Add metadata to track superadmin creation
      superAdminInfo: {
        createdBy: 'superadmin-creation-script',
        createdAt: serverTimestamp(),
        version: '1.0'
      }
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);

    console.log('✅ Superadmin account created successfully!');
    console.log(`   • Email: ${email}`);
    console.log(`   • Name: ${firstName} ${lastName}`);
    console.log(`   • UID: ${user.uid}`);
    console.log(`   • Email verification sent to: ${email}`);
    
    return {
      success: true,
      uid: user.uid,
      email: email,
      name: displayName
    };
    
  } catch (error) {
    console.error('❌ Error creating superadmin:', error.message);
    
    if (error.code === 'auth/email-already-in-use') {
      console.error('   This email is already registered. Use a different email.');
    } else if (error.code === 'auth/weak-password') {
      console.error('   Password is too weak. Use a stronger password.');
    } else if (error.code === 'auth/invalid-email') {
      console.error('   Invalid email format.');
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

async function main() {
  console.log('🎯 QuestEdu Super Admin Creation Tool');
  console.log('=' .repeat(50));
  console.log('');
  
  try {
    // Check existing superadmins
    const existingCount = await checkExistingSuperAdmins();
    
    // Ask if user wants to continue
    if (existingCount > 0) {
      const shouldContinue = await prompt('Do you want to create another superadmin? (y/N): ');
      if (shouldContinue.toLowerCase() !== 'y' && shouldContinue.toLowerCase() !== 'yes') {
        console.log('Operation cancelled.');
        process.exit(0);
      }
      console.log('');
    }
    
    // Collect superadmin details
    console.log('📝 Enter superadmin details:');
    const firstName = await prompt('First Name: ');
    const lastName = await prompt('Last Name: ');
    const email = await prompt('Email: ');
    const password = await promptPassword('Password: ');
    const confirmPassword = await promptPassword('Confirm Password: ');
    
    console.log('');
    
    // Validate input
    if (!firstName || !lastName || !email || !password) {
      console.error('❌ All fields are required.');
      process.exit(1);
    }
    
    if (password !== confirmPassword) {
      console.error('❌ Passwords do not match.');
      process.exit(1);
    }
    
    if (password.length < 6) {
      console.error('❌ Password must be at least 6 characters long.');
      process.exit(1);
    }
    
    // Confirm creation
    console.log('📋 Superadmin Details:');
    console.log(`   • Name: ${firstName} ${lastName}`);
    console.log(`   • Email: ${email}`);
    console.log(`   • Role: superadmin`);
    console.log('');
    
    const confirm = await prompt('Create this superadmin account? (y/N): ');
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      console.log('Operation cancelled.');
      process.exit(0);
    }
    
    console.log('');
    
    // Create the superadmin
    const result = await createSuperAdmin(email, password, firstName, lastName);
    
    if (result.success) {
      console.log('');
      console.log('🎉 Superadmin creation completed successfully!');
      console.log('');
      console.log('📋 Next Steps:');
      console.log('   1. Ask the superadmin to verify their email');
      console.log('   2. They can now log into the admin dashboard');
      console.log('   3. Superadmin has access to:');
      console.log('      • Browse and view all courses');
      console.log('      • Manage all users (view, delete, deactivate)');
      console.log('      • Full administrator privileges');
      console.log('');
      console.log('⚠️  Security Notes:');
      console.log('   • Superadmin accounts have full system access');
      console.log('   • Use strong passwords and enable 2FA when available');
      console.log('   • Regularly review superadmin account activity');
    } else {
      console.log('');
      console.log('💥 Superadmin creation failed.');
      console.log('Please try again with different details.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n💥 Script failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nOperation cancelled by user.');
  rl.close();
  process.exit(0);
});

// Run the script
if (require.main === module) {
  main();
}

module.exports = { createSuperAdmin, checkExistingSuperAdmins };
