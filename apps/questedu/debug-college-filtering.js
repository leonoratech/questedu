#!/usr/bin/env node

/**
 * Debug script to test college course filtering functionality
 * This script will help identify why filtered courses aren't showing up
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, doc, getDoc } = require('firebase/firestore');

// Firebase config for questedu
const firebaseConfig = {
  apiKey: "AIzaSyAGRGK0mX9HBOwSJmvkJvKLUDFBP0y0AW8",
  authDomain: "questedu-58f67.firebaseapp.com",
  projectId: "questedu-58f67",
  storageBucket: "questedu-58f67.firebasestorage.app",
  messagingSenderId: "774825005063",
  appId: "1:774825005063:web:b4b62a1b8bef5acbbd94c4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugCollegeFiltering() {
  console.log('🔍 Starting college filtering debug...\n');

  try {
    // 1. Check total courses
    console.log('1. Checking total courses...');
    const coursesRef = collection(db, 'courses');
    const allCoursesSnapshot = await getDocs(coursesRef);
    console.log(`   Total courses in database: ${allCoursesSnapshot.size}`);

    // 2. Check courses with associations
    console.log('\n2. Checking courses with associations...');
    const coursesWithAssociations = [];
    allCoursesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.association) {
        coursesWithAssociations.push({
          id: doc.id,
          title: data.title,
          association: data.association
        });
      }
    });
    console.log(`   Courses with associations: ${coursesWithAssociations.length}`);
    
    if (coursesWithAssociations.length > 0) {
      console.log('   Sample associated courses:');
      coursesWithAssociations.slice(0, 3).forEach(course => {
        console.log(`     - ${course.title}: ${JSON.stringify(course.association)}`);
      });
    }

    // 3. Check available colleges
    console.log('\n3. Checking available colleges...');
    const collegesRef = collection(db, 'colleges');
    const collegesSnapshot = await getDocs(collegesRef);
    const colleges = [];
    collegesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      colleges.push({
        id: doc.id,
        name: data.name,
        isActive: data.isActive
      });
    });
    console.log(`   Total colleges: ${colleges.length}`);
    if (colleges.length > 0) {
      console.log('   Sample colleges:');
      colleges.slice(0, 3).forEach(college => {
        console.log(`     - ${college.name} (${college.id}) - Active: ${college.isActive}`);
      });
    }

    // 4. Test filtering with specific college ID
    if (colleges.length > 0) {
      const testCollegeId = colleges.find(c => c.isActive)?.id || colleges[0].id;
      console.log(`\n4. Testing filtering with college ID: ${testCollegeId}`);
      
      const filteredQuery = query(
        coursesRef,
        where('association.collegeId', '==', testCollegeId)
      );
      const filteredSnapshot = await getDocs(filteredQuery);
      console.log(`   Courses for college ${testCollegeId}: ${filteredSnapshot.size}`);
      
      if (filteredSnapshot.size > 0) {
        console.log('   Found courses:');
        filteredSnapshot.docs.slice(0, 3).forEach(doc => {
          const data = doc.data();
          console.log(`     - ${data.title} (${doc.id})`);
        });
      }
    }

    // 5. Check programs for a college
    if (colleges.length > 0) {
      const testCollegeId = colleges.find(c => c.isActive)?.id || colleges[0].id;
      console.log(`\n5. Checking programs for college: ${testCollegeId}`);
      
      const programsRef = collection(db, 'programs');
      const programsQuery = query(programsRef, where('collegeId', '==', testCollegeId));
      const programsSnapshot = await getDocs(programsQuery);
      
      console.log(`   Programs for college: ${programsSnapshot.size}`);
      if (programsSnapshot.size > 0) {
        console.log('   Sample programs:');
        programsSnapshot.docs.slice(0, 3).forEach(doc => {
          const data = doc.data();
          console.log(`     - ${data.name} (${doc.id})`);
        });

        // Test filtering by program
        const testProgramId = programsSnapshot.docs[0].id;
        console.log(`\n6. Testing filtering with program ID: ${testProgramId}`);
        
        const programFilteredQuery = query(
          coursesRef,
          where('association.programId', '==', testProgramId)
        );
        const programFilteredSnapshot = await getDocs(programFilteredQuery);
        console.log(`   Courses for program ${testProgramId}: ${programFilteredSnapshot.size}`);
      }
    }

    // 7. Check for any index issues
    console.log('\n7. Testing compound queries...');
    if (colleges.length > 0 && coursesWithAssociations.length > 0) {
      const testCollegeId = colleges.find(c => c.isActive)?.id || colleges[0].id;
      
      try {
        const compoundQuery = query(
          coursesRef,
          where('association.collegeId', '==', testCollegeId),
          where('association.programId', '!=', null)
        );
        const compoundSnapshot = await getDocs(compoundQuery);
        console.log(`   ✅ Compound query successful: ${compoundSnapshot.size} results`);
      } catch (error) {
        console.log(`   ❌ Compound query failed: ${error.message}`);
        console.log('   This might indicate missing composite indexes');
      }
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run the debug
debugCollegeFiltering().then(() => {
  console.log('\n✅ Debug completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Debug script failed:', error);
  process.exit(1);
});
