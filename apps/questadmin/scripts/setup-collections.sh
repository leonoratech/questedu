#!/bin/bash

# Firebase Collections Setup Wrapper Script
# This script compiles and runs the TypeScript setup script

set -e

echo "🔥 Firebase Collections Setup for QuestEdu Admin"
echo "================================================="

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the questadmin app directory"
    exit 1
fi

# Check if TypeScript is available
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx not found. Please install Node.js and npm"
    exit 1
fi

echo "📋 Compiling TypeScript setup script..."

# Compile and run the TypeScript script
npx ts-node scripts/setup-firebase-collections.ts "$@"

echo "✅ Setup script execution completed!"
