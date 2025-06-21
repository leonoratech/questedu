#!/usr/bin/env node

/**
 * Setup Firebase Admin SDK for QuestAdmin
 * 
 * This script installs Firebase Admin SDK which is required for:
 * - Clearing Firebase Authentication users
 * - Advanced user management operations
 * - Server-side Firebase operations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function logSuccess(message) {
  log('✅ ' + message, 'green');
}

function logError(message) {
  log('❌ ' + message, 'red');
}

function logWarning(message) {
  log('⚠️  ' + message, 'yellow');
}

function logInfo(message) {
  log('ℹ️  ' + message, 'blue');
}

/**
 * Check if Firebase Admin SDK is already installed
 */
function checkAdminSDK() {
  try {
    require('firebase-admin');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Install Firebase Admin SDK
 */
function installAdminSDK() {
  log('📦 Installing Firebase Admin SDK...', 'bright');
  
  try {
    const packageManager = fs.existsSync('pnpm-lock.yaml') ? 'pnpm' : 
                          fs.existsSync('yarn.lock') ? 'yarn' : 'npm';
    
    logInfo(`Using package manager: ${packageManager}`);
    
    const installCommand = packageManager === 'pnpm' ? 'pnpm add firebase-admin' :
                          packageManager === 'yarn' ? 'yarn add firebase-admin' :
                          'npm install firebase-admin';
    
    logInfo(`Running: ${installCommand}`);
    
    execSync(installCommand, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    logSuccess('Firebase Admin SDK installed successfully!');
    return true;
    
  } catch (error) {
    logError('Failed to install Firebase Admin SDK: ' + error.message);
    return false;
  }
}

/**
 * Create service account setup instructions
 */
function showServiceAccountInstructions() {
  log('\n🔑 Firebase Service Account Setup', 'bright');
  log('=' .repeat(50), 'cyan');
  log('');
  log('For production use, you need to set up a Firebase service account:', 'bright');
  log('');
  log('1. Go to Firebase Console > Project Settings > Service Accounts', 'blue');
  log('2. Click "Generate new private key" and download the JSON file', 'blue');
  log('3. Save the file securely (e.g., as firebase-service-account.json)', 'blue');
  log('4. Set the environment variable:', 'blue');
  log('   export GOOGLE_APPLICATION_CREDENTIALS="path/to/firebase-service-account.json"', 'yellow');
  log('');
  log('For development/testing:', 'bright');
  log('• The script will work without service account credentials', 'blue');
  log('• Some advanced features may be limited', 'blue');
  log('');
  log('Security Note:', 'bright');
  log('• Never commit service account files to version control', 'yellow');
  log('• Add firebase-service-account.json to your .gitignore', 'yellow');
  log('');
}

/**
 * Test Firebase Admin SDK
 */
function testAdminSDK() {
  log('\n🧪 Testing Firebase Admin SDK...', 'bright');
  
  try {
    const admin = require('firebase-admin');
    
    // Try to initialize (this will work even without credentials for testing)
    if (!admin.apps.length) {
      admin.initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'questedu-cb2a4'
      });
    }
    
    logSuccess('Firebase Admin SDK is working correctly!');
    
    // Check if we have credentials
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      logSuccess('Service account credentials detected');
    } else {
      logWarning('No service account credentials detected');
      logInfo('Some features may be limited without credentials');
    }
    
    return true;
    
  } catch (error) {
    logError('Firebase Admin SDK test failed: ' + error.message);
    return false;
  }
}

/**
 * Update .gitignore to exclude service account files
 */
function updateGitignore() {
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  
  try {
    let gitignoreContent = '';
    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    }
    
    const servicAccountPattern = 'firebase-service-account*.json';
    
    if (!gitignoreContent.includes(servicAccountPattern)) {
      const newContent = gitignoreContent + 
        (gitignoreContent.endsWith('\n') ? '' : '\n') +
        '\n# Firebase Service Account (sensitive)\n' +
        servicAccountPattern + '\n';
      
      fs.writeFileSync(gitignorePath, newContent);
      logSuccess('Updated .gitignore to exclude service account files');
    } else {
      logInfo('.gitignore already configured for service account files');
    }
    
  } catch (error) {
    logWarning('Could not update .gitignore: ' + error.message);
  }
}

/**
 * Main setup function
 */
function main() {
  log('🔥 Firebase Admin SDK Setup', 'bright');
  log('=' .repeat(50), 'cyan');
  log('');
  
  // Check if already installed
  if (checkAdminSDK()) {
    logSuccess('Firebase Admin SDK is already installed!');
  } else {
    logInfo('Firebase Admin SDK not found. Installing...');
    if (!installAdminSDK()) {
      process.exit(1);
    }
  }
  
  // Test the installation
  if (!testAdminSDK()) {
    logError('Firebase Admin SDK is not working correctly');
    process.exit(1);
  }
  
  // Update .gitignore
  updateGitignore();
  
  // Show setup instructions
  showServiceAccountInstructions();
  
  log('🎉 Firebase Admin SDK setup completed!', 'green');
  log('');
  logInfo('You can now use advanced Firebase operations including:');
  log('• Clearing Firebase Authentication users', 'blue');
  log('• Advanced user management', 'blue');
  log('• Server-side Firebase operations', 'blue');
  log('');
  logInfo('Next steps:');
  log('1. Test with: node scripts/db-manager.js clear', 'blue');
  log('2. Set up service account for production (see instructions above)', 'blue');
  log('');
}

// Run if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = { 
  checkAdminSDK, 
  installAdminSDK, 
  testAdminSDK 
};
