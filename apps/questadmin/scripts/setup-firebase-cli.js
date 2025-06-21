#!/usr/bin/env node

/**
 * Firebase CLI Setup Script
 * 
 * This script helps set up Firebase CLI for index management operations.
 * It checks if Firebase CLI is installed and provides setup instructions.
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
  magenta: '\x1b[35m',
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
 * Check if Firebase CLI is installed
 */
function checkFirebaseCLI() {
  try {
    const version = execSync('firebase --version', { 
      encoding: 'utf8', 
      stdio: 'pipe',
      timeout: 3000 // 3 second timeout
    });
    logSuccess(`Firebase CLI is installed: ${version.trim()}`);
    return true;
  } catch (error) {
    if (error.code === 'TIMEOUT') {
      logWarning('Firebase CLI command timed out');
    } else {
      logError('Firebase CLI is not installed or not available in PATH');
    }
    return false;
  }
}

/**
 * Check if user is logged in to Firebase
 */
function checkFirebaseAuth() {
  try {
    const result = execSync('firebase list --json', { 
      encoding: 'utf8', 
      stdio: 'pipe',
      timeout: 5000 // 5 second timeout
    });
    const projects = JSON.parse(result);
    
    if (projects && projects.length > 0) {
      logSuccess('You are logged in to Firebase');
      logInfo(`Available projects: ${projects.map(p => p.projectId).join(', ')}`);
      return true;
    } else {
      logWarning('No Firebase projects found');
      return false;
    }
  } catch (error) {
    if (error.code === 'TIMEOUT') {
      logWarning('Firebase command timed out - may need authentication');
    } else {
      logWarning('Not logged in to Firebase or authentication error');
    }
    return false;
  }
}

/**
 * Check Firebase project configuration
 */
function checkProjectConfig() {
  const firebaseJsonPath = path.join(process.cwd(), 'firebase.json');
  
  if (!fs.existsSync(firebaseJsonPath)) {
    logError('firebase.json not found in current directory');
    return false;
  }
  
  try {
    const config = JSON.parse(fs.readFileSync(firebaseJsonPath, 'utf8'));
    
    if (config.firestore) {
      logSuccess('Firebase project is configured with Firestore');
      
      if (config.firestore.indexes) {
        logInfo(`Indexes file: ${config.firestore.indexes}`);
      }
      
      if (config.firestore.rules) {
        logInfo(`Rules file: ${config.firestore.rules}`);
      }
      
      return true;
    } else {
      logWarning('Firestore is not configured in firebase.json');
      return false;
    }
  } catch (error) {
    logError('Error reading firebase.json: ' + error.message);
    return false;
  }
}

/**
 * Show installation instructions
 */
function showInstallInstructions() {
  log('\n📦 Firebase CLI Installation Instructions', 'bright');
  log('=' .repeat(50), 'cyan');
  log('');
  
  log('Option 1: Install globally with npm:', 'bright');
  log('  npm install -g firebase-tools', 'blue');
  log('');
  
  log('Option 2: Install globally with yarn:', 'bright');
  log('  yarn global add firebase-tools', 'blue');
  log('');
  
  log('Option 3: Install globally with pnpm:', 'bright');
  log('  pnpm add -g firebase-tools', 'blue');
  log('');
  
  log('After installation, authenticate with:', 'bright');
  log('  firebase login', 'blue');
  log('');
}

/**
 * Show authentication instructions
 */
function showAuthInstructions() {
  log('\n🔐 Firebase Authentication Instructions', 'bright');
  log('=' .repeat(50), 'cyan');
  log('');
  
  log('1. Login to Firebase:', 'bright');
  log('   firebase login', 'blue');
  log('');
  
  log('2. List available projects:', 'bright');
  log('   firebase projects:list', 'blue');
  log('');
  
  log('3. Set the project for this directory (if needed):', 'bright');
  log('   firebase use <project-id>', 'blue');
  log('');
}

/**
 * Show project setup instructions
 */
function showProjectSetupInstructions() {
  log('\n🔧 Firebase Project Setup Instructions', 'bright');
  log('=' .repeat(50), 'cyan');
  log('');
  
  log('1. Initialize Firebase in this directory:', 'bright');
  log('   firebase init firestore', 'blue');
  log('');
  
  log('2. Or create firebase.json manually with Firestore config:', 'bright');
  log('   {', 'blue');
  log('     "firestore": {', 'blue');
  log('       "rules": "firestore.rules",', 'blue');
  log('       "indexes": "firestore.indexes.json"', 'blue');
  log('     }', 'blue');
  log('   }', 'blue');
  log('');
}

/**
 * Main setup check function
 */
function checkSetup() {
  log('🔥 Firebase CLI Setup Checker', 'bright');
  log('=' .repeat(50), 'cyan');
  log('');
  
  let allGood = true;
  
  // Check CLI installation
  log('1. Checking Firebase CLI installation...', 'bright');
  if (!checkFirebaseCLI()) {
    allGood = false;
    showInstallInstructions();
  }
  log('');
  
  // Check authentication (only if CLI is installed)
  if (allGood) {
    log('2. Checking Firebase authentication...', 'bright');
    if (!checkFirebaseAuth()) {
      allGood = false;
      showAuthInstructions();
    }
    log('');
  }
  
  // Check project configuration
  log('3. Checking Firebase project configuration...', 'bright');
  if (!checkProjectConfig()) {
    allGood = false;
    showProjectSetupInstructions();
  }
  log('');
  
  // Final status
  if (allGood) {
    logSuccess('✨ All Firebase CLI requirements are met!');
    log('');
    logInfo('You can now use index management commands:');
    log('  node scripts/db-manager.js indexes-status', 'blue');
    log('  node scripts/db-manager.js indexes-deploy', 'blue');
    log('  node scripts/db-manager.js indexes-recreate', 'blue');
  } else {
    logWarning('⚠️  Some setup requirements are missing.');
    log('Please follow the instructions above to complete the setup.');
  }
  
  log('');
}

/**
 * Main execution
 */
function main() {
  const command = process.argv[2];
  
  if (command === 'help' || command === '--help' || command === '-h') {
    log('🔥 Firebase CLI Setup Helper', 'bright');
    log('=' .repeat(50), 'cyan');
    log('');
    log('Usage: node scripts/setup-firebase-cli.js', 'blue');
    log('');
    log('This script checks and helps set up Firebase CLI for index management.', 'blue');
    log('');
    return;
  }
  
  checkSetup();
}

// Run if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  checkFirebaseCLI,
  checkFirebaseAuth,
  checkProjectConfig
};
