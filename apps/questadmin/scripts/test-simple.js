#!/usr/bin/env node

console.log('🚀 Script is running!');
console.log('Node version:', process.version);
console.log('Current directory:', process.cwd());

try {
  const firebase = require('firebase/app');
  console.log('✅ Firebase module loaded successfully');
} catch (error) {
  console.error('❌ Firebase module failed to load:', error.message);
}

console.log('🏁 Script completed!');
