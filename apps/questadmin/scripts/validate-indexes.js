#!/usr/bin/env node

/**
 * Firestore Indexes Validation Script
 * Validates the indexes configuration and helps with deployment
 */

const fs = require('fs');
const path = require('path');

function validateIndexes() {
  console.log('🔍 Validating Firestore Indexes Configuration...\n');

  const indexesPath = path.join(__dirname, '..', 'firestore.indexes.json');
  
  if (!fs.existsSync(indexesPath)) {
    console.error('❌ firestore.indexes.json not found!');
    process.exit(1);
  }

  try {
    const indexesContent = fs.readFileSync(indexesPath, 'utf8');
    const indexesConfig = JSON.parse(indexesContent);
    
    console.log('✅ Indexes file is valid JSON');
    console.log(`📊 Total indexes configured: ${indexesConfig.indexes.length}`);
    
    // Check for subjects indexes
    const subjectIndexes = indexesConfig.indexes.filter(index => 
      index.collectionGroup === 'subjects'
    );
    
    console.log(`📋 Subjects collection indexes: ${subjectIndexes.length}`);
    
    if (subjectIndexes.length === 0) {
      console.log('⚠️  No indexes found for subjects collection');
    } else {
      console.log('\n📝 Subjects indexes:');
      subjectIndexes.forEach((index, i) => {
        const fields = index.fields.map(f => `${f.fieldPath}(${f.order})`).join(', ');
        console.log(`   ${i + 1}. ${fields}`);
      });
    }

    // Expected indexes for subjects collection
    const expectedIndexes = [
      ['programId', 'name'],
      ['programId', 'isActive', 'name'],
      ['collegeId', 'name'],
      ['collegeId', 'isActive', 'name'],
      ['isActive', 'name']
    ];

    console.log('\n🎯 Checking required indexes for subjects collection:');
    expectedIndexes.forEach((expectedFields, i) => {
      const exists = subjectIndexes.some(index => {
        const indexFields = index.fields.map(f => f.fieldPath);
        return expectedFields.every(field => indexFields.includes(field)) &&
               expectedFields.length === indexFields.length;
      });
      
      const status = exists ? '✅' : '❌';
      console.log(`   ${status} ${expectedFields.join(' + ')}`);
    });

    console.log('\n🚀 Next steps:');
    console.log('   1. Deploy indexes: firebase deploy --only firestore:indexes');
    console.log('   2. Monitor build progress in Firebase Console');
    console.log('   3. Test the API endpoints once indexes are built');

  } catch (error) {
    console.error('❌ Error validating indexes:', error.message);
    process.exit(1);
  }
}

function showDeploymentCommands() {
  console.log('\n📋 Deployment Commands:');
  console.log('=======================');
  console.log('');
  console.log('# Login to Firebase');
  console.log('firebase login');
  console.log('');
  console.log('# Set project');
  console.log('firebase use questedu-cb2a4');
  console.log('');
  console.log('# Deploy indexes only');
  console.log('firebase deploy --only firestore:indexes');
  console.log('');
  console.log('# Check deployment status');
  console.log('firebase firestore:indexes');
  console.log('');
}

// Main execution
validateIndexes();
showDeploymentCommands();
