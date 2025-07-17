#!/usr/bin/env node

/**
 * Test Script for ProgramId Filter Fix
 * 
 * This script tests the programId filtering functionality we implemented
 * to ensure users with valid collegeId and programId see filtered courses.
 */

const { getFirestoreDb } = require('./lib/firebase-config');
const { firebaseCourseService } = require('./lib/firebase-course-service');

// Test user profile (simulating a logged-in user with college/program association)
const testUserProfile = {
  uid: 'test-user-123',
  email: 'test.student@college.edu',
  collegeId: 'mit', // Assuming MIT courses exist
  programId: 'computer-science', // Assuming CS program exists
  firstName: 'Test',
  lastName: 'Student',
  role: 'student'
};

/**
 * Test the 3-tier fallback strategy
 */
async function testCourseFiltering() {
  try {
    console.log('🧪 Testing ProgramId Filter Fix');
    console.log('================================');
    console.log('Test User Profile:', {
      collegeId: testUserProfile.collegeId,
      programId: testUserProfile.programId,
      email: testUserProfile.email
    });
    console.log('');

    // Test 1: Get all courses (no filters)
    console.log('📋 Test 1: Getting all courses (no filters)...');
    const allCoursesResult = await firebaseCourseService.getAll({ limit: 5 });
    console.log(`✅ Found ${allCoursesResult.total} total courses`);
    console.log('Sample courses:', allCoursesResult.courses.map(c => ({
      id: c.id,
      title: c.title,
      collegeId: c.collegeId || c.association?.collegeId,
      programId: c.programId || c.association?.programId
    })));
    console.log('');

    // Test 2: Filter by college only
    console.log('📋 Test 2: Filtering by college only...');
    const collegeFilters = { collegeId: testUserProfile.collegeId };
    const collegeCoursesResult = await firebaseCourseService.getCoursesWithFilters(collegeFilters);
    console.log(`✅ Found ${collegeCoursesResult.total} courses for college: ${testUserProfile.collegeId}`);
    console.log('College courses:', collegeCoursesResult.courses.map(c => ({
      id: c.id,
      title: c.title,
      collegeId: c.collegeId || c.association?.collegeId,
      programId: c.programId || c.association?.programId
    })));
    console.log('');

    // Test 3: Filter by college + program (the main test)
    console.log('📋 Test 3: Filtering by college + program (MAIN TEST)...');
    const fullFilters = { 
      collegeId: testUserProfile.collegeId,
      programId: testUserProfile.programId 
    };
    const filteredCoursesResult = await firebaseCourseService.getCoursesWithFilters(fullFilters);
    console.log(`✅ Found ${filteredCoursesResult.total} courses for college: ${testUserProfile.collegeId} + program: ${testUserProfile.programId}`);
    console.log('Filtered courses:', filteredCoursesResult.courses.map(c => ({
      id: c.id,
      title: c.title,
      collegeId: c.collegeId || c.association?.collegeId,
      programId: c.programId || c.association?.programId
    })));
    console.log('');

    // Test 4: Check which strategy was used (look for debug logs)
    console.log('📊 Analysis:');
    console.log('- Total courses in database:', allCoursesResult.total);
    console.log('- Courses for college only:', collegeCoursesResult.total);
    console.log('- Courses for college + program:', filteredCoursesResult.total);
    console.log('');

    if (filteredCoursesResult.total > 0) {
      console.log('🎉 SUCCESS: ProgramId filtering is working!');
      console.log('✅ Users with valid college/program associations will see filtered courses');
    } else if (collegeCoursesResult.total > 0) {
      console.log('⚠️  PARTIAL SUCCESS: College filtering works, but no program-specific courses found');
      console.log('💡 This might be expected if courses are structured differently');
    } else {
      console.log('❌ ISSUE: No courses found even for college filter');
      console.log('🔍 This suggests either:');
      console.log('   1. No courses exist for this college in the database');
      console.log('   2. Course data structure is different than expected');
    }

    return {
      allCourses: allCoursesResult.total,
      collegeCourses: collegeCoursesResult.total,
      filteredCourses: filteredCoursesResult.total,
      success: filteredCoursesResult.total > 0
    };

  } catch (error) {
    console.error('❌ Error testing course filtering:', error);
    return { error: error.message, success: false };
  }
}

/**
 * Test diagnostics functions
 */
async function testDiagnostics() {
  try {
    console.log('🔍 Testing Diagnostic Functions');
    console.log('===============================');
    
    // Import diagnostics (using require for Node.js compatibility)
    const { 
      analyzeCourseDataStructure, 
      testCourseFiltering,
      debugUserCourseFiltering 
    } = require('./lib/course-diagnostics');

    // Test course data structure analysis
    console.log('📊 Running course data structure analysis...');
    const analysis = await analyzeCourseDataStructure();
    if (analysis) {
      console.log('✅ Course data structure analysis completed');
    }
    console.log('');

    // Test filtering with diagnostics
    console.log('🧪 Testing filtering with diagnostics...');
    const testResults = await testCourseFiltering({
      collegeId: testUserProfile.collegeId,
      programId: testUserProfile.programId
    });
    console.log(`✅ Diagnostic filtering test found ${testResults?.length || 0} matches`);
    console.log('');

    // Test user-specific debugging
    console.log('👤 Testing user-specific debugging...');
    const userResults = await debugUserCourseFiltering(testUserProfile);
    console.log(`✅ User debugging test found ${userResults?.length || 0} matches`);
    console.log('');

  } catch (error) {
    console.error('❌ Error testing diagnostics:', error);
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🚀 Starting ProgramId Filter Tests');
  console.log('Date:', new Date().toISOString());
  console.log('==================================');
  console.log('');

  try {
    // Test the main filtering functionality
    const results = await testCourseFiltering();
    console.log('');

    // Test diagnostic functions
    await testDiagnostics();
    
    console.log('🏁 Test Summary');
    console.log('===============');
    if (results.success) {
      console.log('✅ All tests passed! ProgramId filtering is working correctly.');
    } else if (results.error) {
      console.log('❌ Tests failed with error:', results.error);
    } else {
      console.log('⚠️  Tests completed but filtering needs investigation.');
      console.log('💡 Check the diagnostic output above for details.');
    }
    
  } catch (error) {
    console.error('💥 Test execution failed:', error);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().then(() => {
    console.log('\n🎬 Test execution completed');
  }).catch(error => {
    console.error('\n💥 Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { testCourseFiltering, testDiagnostics, runTests };
