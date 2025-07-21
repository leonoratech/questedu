#!/usr/bin/env node

/**
 * Simple seed database runner script
 * Usage: npm run seed:db
 */

const { execSync } = require('child_process')
const path = require('path')

console.log('🚀 Starting database seeding...')

try {
  // Set environment variables if needed
  process.env.NODE_ENV = process.env.NODE_ENV || 'development'
  
  // Run the TypeScript seed script using ts-node
  const scriptPath = path.join(__dirname, 'seed-database.ts')
  
  execSync(`npx ts-node ${scriptPath}`, {
    stdio: 'inherit',
    cwd: __dirname,
    env: process.env
  })
  
} catch (error) {
  console.error('❌ Seeding failed:', error.message)
  process.exit(1)
}
