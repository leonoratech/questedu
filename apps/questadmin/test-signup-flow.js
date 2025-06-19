#!/usr/bin/env node

/**
 * Test script to verify the new student signup flow
 * This script simulates the signup process and checks the profile completion flow
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

async function testSignupFlow() {
  console.log('🧪 Testing New Student Signup Flow...\n');

  // Test data
  const testUser = {
    email: `test-student-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'Student',
    role: 'student'
  };

  try {
    console.log('1. 📝 Testing user signup...');
    
    const signupResponse = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    const signupData = await signupResponse.json();
    
    if (!signupResponse.ok) {
      console.error('❌ Signup failed:', signupData.error);
      return;
    }

    console.log('✅ Signup successful!');
    console.log('   User created with profileCompleted:', signupData.user?.profileCompleted);
    console.log('   JWT token received:', !!signupData.token);

    if (signupData.user?.profileCompleted !== false) {
      console.error('❌ Expected profileCompleted to be false for new users');
      return;
    }

    console.log('\n2. 🔍 Testing profile retrieval...');
    
    // Test getting user profile with the token
    const profileResponse = await fetch(`${BASE_URL}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${signupData.token}`,
      },
    });

    if (!profileResponse.ok) {
      console.error('❌ Profile retrieval failed');
      return;
    }

    const profileData = await profileResponse.json();
    console.log('✅ Profile retrieved successfully');
    console.log('   Profile completion status:', profileData.user?.profileCompleted);

    console.log('\n3. ✨ Testing profile completion...');
    
    // Test completing the profile
    const completeProfileResponse = await fetch(`${BASE_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${signupData.token}`,
      },
      body: JSON.stringify({
        college: 'Test University',
        description: 'I am a test student interested in learning new things.',
        mainSubjects: ['Computer Science', 'Mathematics'],
        class: 'Final Year',
        profileCompleted: true
      }),
    });

    if (!completeProfileResponse.ok) {
      const errorData = await completeProfileResponse.json();
      console.error('❌ Profile completion failed:', errorData.error);
      return;
    }

    const completedProfileData = await completeProfileResponse.json();
    console.log('✅ Profile completion successful');
    console.log('   Updated profile completion status:', completedProfileData.user?.profileCompleted);

    console.log('\n🎉 All tests passed! The signup flow is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testSignupFlow();
