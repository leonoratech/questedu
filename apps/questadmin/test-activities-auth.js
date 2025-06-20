#!/usr/bin/env node
/**
 * Test script to debug activities authentication
 */

const BASE_URL = 'http://localhost:3001';

async function testActivitiesAuth() {
  console.log('🧪 Testing Activities API Authentication...\n');

  try {
    console.log('1. 🔍 Testing activities API without authentication...');
    
    const activitiesResponse = await fetch(`${BASE_URL}/api/activities?limit=5`);
    const activitiesData = await activitiesResponse.json();
    
    console.log('Activities API Response (no auth):', {
      status: activitiesResponse.status,
      ok: activitiesResponse.ok,
      data: activitiesData
    });

    if (activitiesResponse.status === 401) {
      console.log('✅ Good! API correctly requires authentication');
    }

    console.log('\n2. 🔍 Testing auth test endpoint...');
    
    const authTestResponse = await fetch(`${BASE_URL}/api/auth/test`);
    const authTestData = await authTestResponse.json();
    
    console.log('Auth Test Response (no auth):', {
      status: authTestResponse.status,
      ok: authTestResponse.ok,
      data: authTestData
    });

    console.log('\n3. 💡 Next steps:');
    console.log('   • Create or login as instructor user');
    console.log('   • Get JWT token from browser localStorage');
    console.log('   • Test activities API with proper authentication');
    console.log('   • Check user role in database');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testActivitiesAuth().catch(console.error);
