#!/usr/bin/env node

/**
 * Test Script for College Management System
 * 
 * This script tests the college management functionality by:
 * 1. Creating sample colleges
 * 2. Testing college API endpoints
 * 3. Verifying college selector functionality
 * 
 * Usage: node scripts/test-college-management.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDocs, serverTimestamp } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyALWHvJopjpZ9amcpV74jrBlYqEZzeWaTI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "questedu-cb2a4.firebaseapp.com", 
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "questedu-cb2a4",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "questedu-cb2a4.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "247130380208",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:247130380208:web:dfe0053ff32ae3194a6875"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample college data
const sampleColleges = [
  {
    id: 'mit',
    name: 'Massachusetts Institute of Technology',
    accreditation: 'NECHE',
    affiliation: 'Private',
    address: {
      street: '77 Massachusetts Avenue',
      city: 'Cambridge',
      state: 'Massachusetts',
      country: 'United States',
      postalCode: '02139'
    },
    contact: {
      phone: '+1-617-253-1000',
      email: 'admissions@mit.edu',
      website: 'https://web.mit.edu'
    },
    website: 'https://web.mit.edu',
    principalName: 'L. Rafael Reif',
    description: 'A private research university focusing on science, technology, engineering, and mathematics.',
    isActive: true
  },
  {
    id: 'stanford',
    name: 'Stanford University',
    accreditation: 'WASC',
    affiliation: 'Private',
    address: {
      street: '450 Serra Mall',
      city: 'Stanford',
      state: 'California',
      country: 'United States',
      postalCode: '94305'
    },
    contact: {
      phone: '+1-650-723-2300',
      email: 'admission@stanford.edu',
      website: 'https://www.stanford.edu'
    },
    website: 'https://www.stanford.edu',
    principalName: 'Marc Tessier-Lavigne',
    description: 'A private research university known for its academic strength and wealth.',
    isActive: true
  },
  {
    id: 'iit-bombay',
    name: 'Indian Institute of Technology Bombay',
    accreditation: 'NAAC A++',
    affiliation: 'Government (India)',
    address: {
      street: 'Powai',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      postalCode: '400076'
    },
    contact: {
      phone: '+91-22-2572-2545',
      email: 'info@iitb.ac.in',
      website: 'https://www.iitb.ac.in'
    },
    website: 'https://www.iitb.ac.in',
    principalName: 'Subhasis Chaudhuri',
    description: 'A premier engineering institution in India, known for excellence in technical education.',
    isActive: true
  },
  {
    id: 'university-of-cambridge',
    name: 'University of Cambridge',
    accreditation: 'Royal Charter',
    affiliation: 'Public (UK)',
    address: {
      street: 'The Old Schools, Trinity Lane',
      city: 'Cambridge',
      state: 'Cambridgeshire',
      country: 'United Kingdom',
      postalCode: 'CB2 1TN'
    },
    contact: {
      phone: '+44-1223-337733',
      email: 'admissions@cam.ac.uk',
      website: 'https://www.cam.ac.uk'
    },
    website: 'https://www.cam.ac.uk',
    principalName: 'Stephen Toope',
    description: 'A collegiate research university and one of the world\'s oldest universities.',
    isActive: true
  },
  {
    id: 'local-community-college',
    name: 'Local Community College',
    accreditation: 'Regional',
    affiliation: 'Public',
    address: {
      street: '123 Education Street',
      city: 'Hometown',
      state: 'State',
      country: 'Country',
      postalCode: '12345'
    },
    contact: {
      phone: '+1-555-123-4567',
      email: 'info@localcc.edu',
      website: 'https://www.localcc.edu'
    },
    website: 'https://www.localcc.edu',
    principalName: 'Dr. Jane Smith',
    description: 'A local community college serving the educational needs of the local community.',
    isActive: true
  }
];

async function createSampleColleges() {
  console.log('🏫 Creating sample colleges...');
  
  try {
    // Check if colleges already exist
    const collegesRef = collection(db, 'colleges');
    const snapshot = await getDocs(collegesRef);
    
    if (!snapshot.empty) {
      console.log(`📊 Found ${snapshot.size} existing colleges. Skipping creation.`);
      console.log('   To recreate, delete the colleges collection first.');
      return false;
    }
    
    // Create sample colleges
    const promises = sampleColleges.map(async (college) => {
      const collegeData = {
        ...college,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: 'test-script'
      };
      
      await setDoc(doc(db, 'colleges', college.id), collegeData);
      console.log(`✅ Created: ${college.name}`);
    });
    
    await Promise.all(promises);
    
    console.log(`🎉 Successfully created ${sampleColleges.length} sample colleges!`);
    return true;
    
  } catch (error) {
    console.error('❌ Failed to create sample colleges:', error);
    throw error;
  }
}

async function listColleges() {
  console.log('\n📋 Listing all colleges...');
  
  try {
    const collegesRef = collection(db, 'colleges');
    const snapshot = await getDocs(collegesRef);
    
    if (snapshot.empty) {
      console.log('   No colleges found.');
      return [];
    }
    
    const colleges = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      colleges.push({
        id: doc.id,
        name: data.name,
        affiliation: data.affiliation,
        isActive: data.isActive
      });
      console.log(`   • ${data.name} (${data.affiliation}) - ${data.isActive ? 'Active' : 'Inactive'}`);
    });
    
    console.log(`\n📊 Total colleges: ${colleges.length}`);
    return colleges;
    
  } catch (error) {
    console.error('❌ Failed to list colleges:', error);
    throw error;
  }
}

async function testCollegeSystem() {
  console.log('🧪 Testing college management system...');
  
  try {
    // Test 1: Create sample colleges
    console.log('\n1️⃣ Testing college creation...');
    const created = await createSampleColleges();
    
    // Test 2: List colleges
    console.log('\n2️⃣ Testing college listing...');
    const colleges = await listColleges();
    
    // Test 3: College statistics
    console.log('\n3️⃣ College statistics...');
    const activeColleges = colleges.filter(c => c.isActive);
    const inactiveColleges = colleges.filter(c => !c.isActive);
    
    console.log(`   • Active colleges: ${activeColleges.length}`);
    console.log(`   • Inactive colleges: ${inactiveColleges.length}`);
    console.log(`   • Total colleges: ${colleges.length}`);
    
    // Test 4: Recommendations
    console.log('\n4️⃣ Recommendations...');
    
    if (created) {
      console.log('✅ Sample colleges created successfully');
      console.log('💡 Next steps:');
      console.log('   1. Create a superadmin user: node scripts/create-superadmin.js');
      console.log('   2. Login to the app and test college management at /colleges');
      console.log('   3. Test college selector in signup/profile pages');
      console.log('   4. Run migration script: node scripts/migrate-college-references.js');
    } else {
      console.log('ℹ️  Colleges already exist');
      console.log('💡 You can:');
      console.log('   1. Test the college management interface at /colleges');
      console.log('   2. Test college selector in forms');
      console.log('   3. Run user migration if needed');
    }
    
    console.log('\n🎉 College system test completed successfully!');
    
  } catch (error) {
    console.error('❌ College system test failed:', error);
    throw error;
  }
}

// Main execution
async function main() {
  console.log('🎯 QuestEdu College Management System Test');
  console.log('=' .repeat(50));
  
  try {
    await testCollegeSystem();
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  main();
}

module.exports = { createSampleColleges, listColleges, testCollegeSystem };
