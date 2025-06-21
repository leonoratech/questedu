#!/usr/bin/env node

/**
 * Database Management Runner
 * 
 * Provides easy access to all database management operations including:
 * - Database operations (status, clear, seed, reset, migrate, test)
 * - Firestore index management (status, deploy, clear, recreate, validate)
 * 
 * Usage: node scripts/db-manager.js [command]
 * 
 * Database Commands:
 *   status    - Check database status
 *   clear     - Clear database (with confirmation)
 *   seed      - Populate with mock data
 *   reset     - Clear and seed database
 *   migrate   - Migrate college references
 *   test      - Run comprehensive tests
 * 
 * Index Management Commands:
 *   indexes-status     - Show current index status
 *   indexes-deploy     - Deploy indexes from firestore.indexes.json
 *   indexes-clear      - Instructions to clear all indexes
 *   indexes-recreate   - Clear and recreate all indexes
 *   indexes-validate   - Validate firestore.indexes.json
 */

const { execSync } = require('child_process');
const path = require('path');

// Available commands
const COMMANDS = {
  status: {
    description: 'Check database status and document counts',
    script: 'test-connection.js'
  },
  clear: {
    description: 'Clear database without confirmation',
    script: 'clear-database-auto.js'
  },
  'clear-auth': {
    description: 'Clear Firebase Authentication users only',
    script: 'clear-auth-users.js'
  },
  seed: {
    description: 'Populate database with mock data',
    script: 'seed-database.js'
  },
  reset: {
    description: 'Clear database and populate with mock data',
    script: 'seed-database.js',
    args: '--clear-first'
  },
  migrate: {
    description: 'Migrate college text references to IDs',
    script: 'migrate-college-references.js'
  },
  test: {
    description: 'Run comprehensive database tests',
    script: 'test-database-scripts.js'
  },
  'indexes-status': {
    description: 'Show current Firestore index status',
    script: 'manage-indexes.js',
    args: 'status'
  },
  'indexes-deploy': {
    description: 'Deploy indexes from firestore.indexes.json',
    script: 'manage-indexes.js',
    args: 'deploy'
  },
  'indexes-clear': {
    description: 'Show instructions to clear all Firestore indexes',
    script: 'manage-indexes.js',
    args: 'clear'
  },
  'indexes-recreate': {
    description: 'Clear and recreate all Firestore indexes',
    script: 'manage-indexes.js',
    args: 'recreate'
  },
  'indexes-validate': {
    description: 'Validate firestore.indexes.json file',
    script: 'manage-indexes.js',
    args: 'validate'
  },
  'setup-firebase': {
    description: 'Check and setup Firebase CLI for index management',
    script: 'setup-firebase-cli.js'
  },
  'setup-admin': {
    description: 'Install and setup Firebase Admin SDK for user management',
    script: 'setup-firebase-admin.js'
  }
};

function showHelp() {
  console.log('🗄️  QuestAdmin Database Manager');
  console.log('=' .repeat(50));
  console.log('');
  console.log('Usage: node scripts/db-manager.js [command]');
  console.log('');
  console.log('Database Commands:');
  console.log('');
  
  // Show database commands first
  const dbCommands = ['status', 'clear', 'clear-auth', 'seed', 'reset', 'migrate', 'test'];
  dbCommands.forEach(command => {
    const info = COMMANDS[command];
    if (info) {
      console.log(`  ${command.padEnd(16)} - ${info.description}`);
    }
  });
  
  console.log('');
  console.log('Index Management Commands:');
  console.log('');
  
  // Show index commands
  const indexCommands = ['indexes-status', 'indexes-deploy', 'indexes-clear', 'indexes-recreate', 'indexes-validate', 'setup-firebase', 'setup-admin'];
  indexCommands.forEach(command => {
    const info = COMMANDS[command];
    if (info) {
      console.log(`  ${command.padEnd(16)} - ${info.description}`);
    }
  });
  
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/db-manager.js status           # Check database');
  console.log('  node scripts/db-manager.js clear-auth       # Clear auth users only');
  console.log('  node scripts/db-manager.js reset            # Fresh start');
  console.log('  node scripts/db-manager.js seed             # Add mock data');
  console.log('  node scripts/db-manager.js indexes-status   # Check indexes');
  console.log('  node scripts/db-manager.js indexes-recreate # Recreate indexes');
  console.log('  node scripts/db-manager.js setup-firebase   # Setup Firebase CLI');
  console.log('  node scripts/db-manager.js setup-admin      # Setup Firebase Admin SDK');
  console.log('');
}

function runCommand(command) {
  const cmd = COMMANDS[command];
  
  if (!cmd) {
    console.error(`❌ Unknown command: ${command}`);
    console.log('');
    showHelp();
    process.exit(1);
  }
  
  console.log(`🚀 Running: ${cmd.description}`);
  console.log('=' .repeat(50));
  console.log('');
  
  try {
    const scriptPath = path.join(__dirname, cmd.script);
    const fullCommand = `node "${scriptPath}"${cmd.args ? ' ' + cmd.args : ''}`;
    
    console.log(`Executing: ${fullCommand}`);
    console.log('');
    
    execSync(fullCommand, {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    console.log('');
    console.log('✅ Command completed successfully!');
    
  } catch (error) {
    console.error('');
    console.error('❌ Command failed:', error.message);
    process.exit(1);
  }
}

// Main execution
function main() {
  const command = process.argv[2];
  
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    showHelp();
    return;
  }
  
  runCommand(command);
}

// Run if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = { runCommand, COMMANDS };
