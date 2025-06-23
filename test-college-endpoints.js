#!/usr/bin/env node

/**
 * Test script to verify college-specific endpoints are working correctly
 * This script tests the endpoints that were returning 401 errors
 */

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api';

// Test data - replace with actual values from your system
const TEST_DATA = {
  collegeId: '7aKtFCAdnFLORHaNJBEO',
  programId: 'YHd6lXni8u2Ql7oM0zWK'
};

async function testEndpoint(path, token, description) {
  try {
    console.log(`\n🧪 Testing: ${description}`);
    console.log(`📍 Endpoint: ${path}`);
    
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const status = response.status;
    const statusText = response.statusText;
    
    console.log(`📊 Status: ${status} ${statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Success: Received data`);
      console.log(`📦 Response keys: ${Object.keys(data).join(', ')}`);
    } else {
      const errorData = await response.text();
      console.log(`❌ Error: ${errorData}`);
    }
    
    return { status, ok: response.ok };
    
  } catch (error) {
    console.log(`💥 Request failed: ${error.message}`);
    return { status: 0, ok: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Testing College-Specific Endpoints');
  console.log('=====================================');
  
  // Check if JWT token is provided
  const token = process.env.JWT_TOKEN || process.argv[2];
  
  if (!token) {
    console.log('❌ Error: JWT token required');
    console.log('Usage: JWT_TOKEN=your_token_here node test-college-endpoints.js');
    console.log('   or: node test-college-endpoints.js your_token_here');
    process.exit(1);
  }

  const endpoints = [
    {
      path: `/colleges/${TEST_DATA.collegeId}/programs/${TEST_DATA.programId}/subjects`,
      description: 'Get subjects for college program'
    },
    {
      path: `/colleges/${TEST_DATA.collegeId}/instructors`,
      description: 'Get instructors for college'
    },
    {
      path: `/colleges/${TEST_DATA.collegeId}`,
      description: 'Get college information'
    },
    {
      path: `/colleges/${TEST_DATA.collegeId}/stats`,
      description: 'Get college statistics'
    }
  ];

  let successCount = 0;
  let totalCount = endpoints.length;

  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint.path, token, endpoint.description);
    if (result.ok) {
      successCount++;
    }
  }

  console.log('\n📈 Test Summary');
  console.log('===============');
  console.log(`✅ Successful: ${successCount}/${totalCount}`);
  console.log(`❌ Failed: ${totalCount - successCount}/${totalCount}`);
  
  if (successCount === totalCount) {
    console.log('🎉 All endpoints working correctly!');
    process.exit(0);
  } else {
    console.log('⚠️  Some endpoints still have issues');
    process.exit(1);
  }
}

main().catch(console.error);
