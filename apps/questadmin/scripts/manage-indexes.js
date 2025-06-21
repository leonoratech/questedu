#!/usr/bin/env node

/**
 * Firestore Index Management Script
 * 
 * This script provides functionality to:
 * - Clear all existing Firestore indexes
 * - Recreate indexes from firestore.indexes.json
 * - View current index status
 * 
 * Usage: node scripts/manage-indexes.js [command]
 * 
 * Commands:
 *   status     - Show current index status
 *   clear      - Clear all indexes
 *   recreate   - Clear and recreate all indexes
 *   deploy     - Deploy indexes from firestore.indexes.json
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

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
 * Check if Firebase CLI is available
 */
function checkFirebaseCLI() {
  try {
    execSync('firebase --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    logError('Firebase CLI is not installed or not available in PATH');
    log('Please install Firebase CLI: npm install -g firebase-tools', 'yellow');
    return false;
  }
}

/**
 * Check if we're in a Firebase project directory
 */
function checkFirebaseProject() {
  const firebaseJsonPath = path.join(process.cwd(), 'firebase.json');
  if (!fs.existsSync(firebaseJsonPath)) {
    logError('firebase.json not found. Make sure you\'re in the questadmin directory.');
    return false;
  }
  return true;
}

/**
 * Check if firestore.indexes.json exists
 */
function checkIndexesFile() {
  const indexesPath = path.join(process.cwd(), 'firestore.indexes.json');
  if (!fs.existsSync(indexesPath)) {
    logError('firestore.indexes.json not found.');
    return false;
  }
  return true;
}

/**
 * Show current index status
 */
function showIndexStatus() {
  log('\n📋 Checking Firestore Index Status...', 'bright');
  log('=' .repeat(50), 'cyan');
  
  try {
    logInfo('Fetching current indexes from Firestore...');
    const output = execSync('firebase firestore:indexes', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    console.log('\nCurrent Indexes:');
    console.log(output);
    
    // Also show local index configuration
    if (checkIndexesFile()) {
      const indexesPath = path.join(process.cwd(), 'firestore.indexes.json');
      const indexesContent = fs.readFileSync(indexesPath, 'utf8');
      const indexesConfig = JSON.parse(indexesContent);
      
      log('\n📄 Local Index Configuration:', 'bright');
      log(`Found ${indexesConfig.indexes.length} indexes in firestore.indexes.json`, 'blue');
      
      indexesConfig.indexes.forEach((index, i) => {
        const fields = index.fields.map(f => `${f.fieldPath} (${f.order})`).join(', ');
        console.log(`  ${i + 1}. Collection: ${index.collectionGroup} | Fields: ${fields}`);
      });
    }
    
  } catch (error) {
    logError('Failed to fetch index status: ' + error.message);
    return false;
  }
  
  return true;
}

/**
 * Clear all existing indexes
 */
function clearAllIndexes() {
  log('\n🧹 Clearing All Firestore Indexes...', 'bright');
  log('=' .repeat(50), 'cyan');
  
  logWarning('This will delete ALL existing Firestore indexes!');
  
  try {
    logInfo('Fetching current indexes...');
    const output = execSync('firebase firestore:indexes', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    // Extract index IDs from the output
    // This is a simplified approach - in practice, you might need more sophisticated parsing
    const indexLines = output.split('\n').filter(line => line.includes('│') && !line.includes('─'));
    
    if (indexLines.length <= 1) { // Header line only
      logInfo('No indexes found to delete.');
      return true;
    }
    
    logInfo(`Found ${indexLines.length - 1} indexes to delete.`);
    
    // Note: Firebase CLI doesn't have a direct command to delete all indexes
    // We'll use the indexes delete command with individual index IDs
    // For now, we'll provide instructions
    logWarning('To delete indexes individually, use:');
    log('firebase firestore:indexes:delete [INDEX_ID]', 'yellow');
    
    logInfo('Alternatively, you can delete all indexes from the Firebase Console:');
    log('https://console.firebase.google.com/project/[PROJECT_ID]/firestore/indexes', 'blue');
    
  } catch (error) {
    logError('Failed to clear indexes: ' + error.message);
    return false;
  }
  
  return true;
}

/**
 * Deploy indexes from firestore.indexes.json
 */
function deployIndexes() {
  log('\n🚀 Deploying Firestore Indexes...', 'bright');
  log('=' .repeat(50), 'cyan');
  
  if (!checkIndexesFile()) {
    return false;
  }
  
  try {
    logInfo('Deploying indexes from firestore.indexes.json...');
    
    const output = execSync('firebase deploy --only firestore:indexes', { 
      encoding: 'utf8',
      stdio: 'inherit'
    });
    
    logSuccess('Indexes deployed successfully!');
    
  } catch (error) {
    logError('Failed to deploy indexes: ' + error.message);
    return false;
  }
  
  return true;
}

/**
 * Clear and recreate all indexes
 */
function recreateIndexes() {
  log('\n🔄 Recreating All Firestore Indexes...', 'bright');
  log('=' .repeat(50), 'cyan');
  
  logWarning('This will clear all existing indexes and recreate them from firestore.indexes.json');
  logWarning('This process may take several minutes and queries may fail during recreation.');
  
  // Show current status first
  if (!showIndexStatus()) {
    return false;
  }
  
  // Step 1: Clear existing indexes
  log('\n Step 1: Clear existing indexes', 'yellow');
  logInfo('Please manually delete existing indexes from Firebase Console or use Firebase CLI:');
  log('firebase firestore:indexes:delete [INDEX_ID]', 'blue');
  
  // Step 2: Deploy new indexes
  log('\n Step 2: Deploy new indexes', 'yellow');
  if (!deployIndexes()) {
    return false;
  }
  
  logSuccess('Index recreation process completed!');
  logInfo('Note: Index creation is asynchronous and may take time to complete.');
  
  return true;
}

/**
 * Validate firestore.indexes.json structure
 */
function validateIndexesFile() {
  log('\n🔍 Validating firestore.indexes.json...', 'bright');
  
  if (!checkIndexesFile()) {
    return false;
  }
  
  try {
    const indexesPath = path.join(process.cwd(), 'firestore.indexes.json');
    const indexesContent = fs.readFileSync(indexesPath, 'utf8');
    const indexesConfig = JSON.parse(indexesContent);
    
    // Basic validation
    if (!indexesConfig.indexes || !Array.isArray(indexesConfig.indexes)) {
      logError('Invalid firestore.indexes.json: missing or invalid "indexes" array');
      return false;
    }
    
    logSuccess(`Valid indexes file with ${indexesConfig.indexes.length} indexes`);
    
    // Show summary
    const collections = new Set();
    indexesConfig.indexes.forEach(index => {
      collections.add(index.collectionGroup);
    });
    
    logInfo(`Collections with indexes: ${Array.from(collections).join(', ')}`);
    
  } catch (error) {
    logError('Failed to validate indexes file: ' + error.message);
    return false;
  }
  
  return true;
}

/**
 * Show help information
 */
function showHelp() {
  log('🗂️  Firestore Index Manager', 'bright');
  log('=' .repeat(50), 'cyan');
  log('');
  log('Usage: node scripts/manage-indexes.js [command]', 'blue');
  log('');
  log('Available commands:', 'bright');
  log('');
  log('  status     - Show current index status and local configuration', 'green');
  log('  clear      - Show instructions to clear all existing indexes', 'yellow');
  log('  deploy     - Deploy indexes from firestore.indexes.json', 'green');
  log('  recreate   - Clear and recreate all indexes (guided process)', 'yellow');
  log('  validate   - Validate firestore.indexes.json file structure', 'blue');
  log('');
  log('Examples:', 'bright');
  log('  node scripts/manage-indexes.js status', 'blue');
  log('  node scripts/manage-indexes.js deploy', 'blue');
  log('  node scripts/manage-indexes.js recreate', 'blue');
  log('');
  log('Notes:', 'bright');
  log('  • Make sure you\'re in the questadmin directory', 'yellow');
  log('  • Firebase CLI must be installed and authenticated', 'yellow');
  log('  • Index creation/deletion is asynchronous and may take time', 'yellow');
  log('');
}

/**
 * Main execution function
 */
function main() {
  const command = process.argv[2];
  
  // Show help if no command or help requested
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    showHelp();
    return;
  }
  
  // Pre-flight checks
  if (!checkFirebaseCLI()) {
    process.exit(1);
  }
  
  if (!checkFirebaseProject()) {
    process.exit(1);
  }
  
  // Execute command
  let success = false;
  
  switch (command) {
    case 'status':
      success = showIndexStatus();
      break;
      
    case 'clear':
      success = clearAllIndexes();
      break;
      
    case 'deploy':
      success = deployIndexes();
      break;
      
    case 'recreate':
      success = recreateIndexes();
      break;
      
    case 'validate':
      success = validateIndexesFile();
      break;
      
    default:
      logError(`Unknown command: ${command}`);
      log('');
      showHelp();
      process.exit(1);
  }
  
  if (success) {
    log('\n✨ Operation completed successfully!', 'green');
  } else {
    log('\n💥 Operation failed!', 'red');
    process.exit(1);
  }
}

// Run if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  showIndexStatus,
  clearAllIndexes,
  deployIndexes,
  recreateIndexes,
  validateIndexesFile
};
