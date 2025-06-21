#!/usr/bin/env node

/**
 * Database Management Runner
 * 
 * Provides easy access to all database management operations
 * 
 * Usage: node scripts/db-manager.js [command]
 * 
 * Commands:
 *   status    - Check database status
 *   clear     - Clear database (with confirmation)
 *   seed      - Populate with mock data
 *   reset     - Clear and seed database
 *   migrate   - Migrate college references
 *   test      - Run comprehensive tests
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
    description: 'Clear database with user confirmation',
    script: 'clear-database.js'
  },
  'clear-auto': {
    description: 'Clear database without confirmation',
    script: 'clear-database-auto.js'
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
  }
};

function showHelp() {
  console.log('🗄️  QuestAdmin Database Manager');
  console.log('=' .repeat(50));
  console.log('');
  console.log('Usage: node scripts/db-manager.js [command]');
  console.log('');
  console.log('Available commands:');
  console.log('');
  
  Object.entries(COMMANDS).forEach(([command, info]) => {
    console.log(`  ${command.padEnd(12)} - ${info.description}`);
  });
  
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/db-manager.js status   # Check database');
  console.log('  node scripts/db-manager.js reset    # Fresh start');
  console.log('  node scripts/db-manager.js seed     # Add mock data');
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
