#!/usr/bin/env node

/**
 * Database Seed Script for QuestAdmin - Single College Model
 * 
 * This script populates the database with data according to the new business requirements:
 * - Single college with three departments (Arts, Science, Vocational)
 * - Programs under departments with specified medium (English/Telugu)
 * - Subjects under programs with year and medium attributes
 * - Courses associated with program->subject->course hierarchy
 * - Remove all batch-related data
 * 
 * Usage: node scripts/seed-single-college.js [--clear-first]
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Import firebase-admin
let admin;
try {
  admin = require('firebase-admin');
} catch (error) {
  console.error('❌ Firebase Admin SDK not installed. Please run `npm install firebase-admin` in your questadmin directory.');
  process.exit(1);
}

// Load service account from environment variables
let serviceAccount;
if (process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL && process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY) {
  serviceAccount = {
    type: 'service_account',
    project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    client_email: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
    private_key: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  };
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  serviceAccount = null;
} else {
  console.error('❌ No service account credentials found in environment variables.');
  process.exit(1);
}

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    } else {
      admin.initializeApp();
    }
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error);
    process.exit(1);
  }
}

const db = admin.firestore();
const auth = admin.auth();

// Clear database first if requested
const clearFirst = process.argv.includes('--clear-first');

// Mock data for the single college model
const COLLEGE_DATA = {
  name: "Quest Educational Institute",
  accreditation: "NAAC A+ Grade",
  affiliation: "State University",
  address: {
    street: "123 Education Street",
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    postalCode: "500001"
  },
  contact: {
    phone: "+91-40-12345678",
    email: "info@questedu.edu.in",
    website: "https://questedu.edu.in"
  },
  website: "https://questedu.edu.in",
  principalName: "Dr. Rajesh Kumar",
  description: "A leading educational institution committed to excellence in education and research.",
  isActive: true,
  isDefault: true
};

const DEPARTMENTS = [
  { name: "Arts", description: "Department of Arts and Humanities" },
  { name: "Science", description: "Department of Science and Technology" },
  { name: "Vocational", description: "Department of Vocational Education" }
];

const PROGRAMS = [
  // Arts Programs
  { name: "BA", departmentName: "Arts", years: 3, medium: "English", description: "Bachelor of Arts" },
  { name: "BA", departmentName: "Arts", years: 3, medium: "Telugu", description: "Bachelor of Arts (Telugu Medium)" },
  
  // Science Programs
  { name: "MPC", departmentName: "Science", years: 2, medium: "English", description: "Mathematics, Physics, Chemistry" },
  { name: "MPC", departmentName: "Science", years: 2, medium: "Telugu", description: "Mathematics, Physics, Chemistry (Telugu Medium)" },
  { name: "HEC", departmentName: "Science", years: 2, medium: "English", description: "Home Science, Economics, Civics" },
  { name: "CEC", departmentName: "Science", years: 2, medium: "English", description: "Commerce, Economics, Civics" },
  
  // Vocational Programs
  { name: "Computer Applications", departmentName: "Vocational", years: 2, medium: "English", description: "Diploma in Computer Applications" },
  { name: "Accounting", departmentName: "Vocational", years: 2, medium: "Telugu", description: "Diploma in Accounting" }
];

const SUBJECTS = [
  // Arts Subjects
  { name: "English", programName: "BA", year: 1, medium: "English" },
  { name: "History", programName: "BA", year: 1, medium: "English" },
  { name: "Political Science", programName: "BA", year: 2, medium: "English" },
  { name: "Telugu", programName: "BA", year: 1, medium: "Telugu" },
  { name: "History", programName: "BA", year: 1, medium: "Telugu" },
  
  // Science Subjects
  { name: "Mathematics", programName: "MPC", year: 1, medium: "English" },
  { name: "Physics", programName: "MPC", year: 1, medium: "English" },
  { name: "Chemistry", programName: "MPC", year: 1, medium: "English" },
  { name: "Mathematics", programName: "MPC", year: 1, medium: "Telugu" },
  { name: "Physics", programName: "MPC", year: 1, medium: "Telugu" },
  { name: "Home Science", programName: "HEC", year: 1, medium: "English" },
  { name: "Economics", programName: "HEC", year: 1, medium: "English" },
  { name: "Civics", programName: "CEC", year: 1, medium: "English" },
  
  // Vocational Subjects
  { name: "Computer Fundamentals", programName: "Computer Applications", year: 1, medium: "English" },
  { name: "Programming", programName: "Computer Applications", year: 2, medium: "English" },
  { name: "Financial Accounting", programName: "Accounting", year: 1, medium: "Telugu" },
  { name: "Cost Accounting", programName: "Accounting", year: 2, medium: "Telugu" }
];

async function main() {
  console.log('🌱 Starting single college database seeding...');
  
  try {
    if (clearFirst) {
      console.log('🧹 Clearing existing data...');
      await clearBatchData(); // Remove batch data
      // Note: We'll keep existing colleges and add the new single college
    }
    
    // Create the single college
    console.log('🏫 Creating single college...');
    const collegeId = await createCollege();
    
    // Create departments
    console.log('🏢 Creating departments...');
    const departmentIds = await createDepartments(collegeId);
    
    // Create programs
    console.log('🎓 Creating programs...');
    const programIds = await createPrograms(collegeId, departmentIds);
    
    // Create subjects
    console.log('📚 Creating subjects...');
    const subjectIds = await createSubjects(collegeId, programIds);
    
    // Create sample courses
    console.log('📖 Creating sample courses...');
    await createSampleCourses(collegeId, programIds, subjectIds);
    
    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Created:
    - 1 College
    - ${Object.keys(departmentIds).length} Departments  
    - ${Object.keys(programIds).length} Programs
    - ${Object.keys(subjectIds).length} Subjects
    - Sample courses`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

async function clearBatchData() {
  console.log('🧹 Removing batch-related data...');
  
  try {
    // Delete all batch documents
    const batchesSnapshot = await db.collection('batches').get();
    const batch = db.batch();
    
    batchesSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    if (!batchesSnapshot.empty) {
      await batch.commit();
      console.log(`🗑️ Deleted ${batchesSnapshot.size} batch documents`);
    }
    
  } catch (error) {
    console.error('❌ Error clearing batch data:', error);
  }
}

async function createCollege() {
  console.log('🏫 Creating Quest Educational Institute...');
  
  const collegeRef = db.collection('colleges').doc();
  const collegeData = {
    ...COLLEGE_DATA,
    id: collegeRef.id,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: 'system'
  };
  
  await collegeRef.set(collegeData);
  console.log(`✅ Created college: ${COLLEGE_DATA.name}`);
  
  return collegeRef.id;
}

async function createDepartments(collegeId) {
  console.log('🏢 Creating departments...');
  
  const departmentIds = {};
  
  for (const dept of DEPARTMENTS) {
    const deptRef = db.collection('departments').doc();
    const departmentData = {
      ...dept,
      id: deptRef.id,
      collegeId,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: 'system'
    };
    
    await deptRef.set(departmentData);
    departmentIds[dept.name] = deptRef.id;
    console.log(`✅ Created department: ${dept.name}`);
  }
  
  return departmentIds;
}

async function createPrograms(collegeId, departmentIds) {
  console.log('🎓 Creating programs...');
  
  const programIds = {};
  
  for (const prog of PROGRAMS) {
    const programRef = db.collection('programs').doc();
    const programKey = `${prog.name}_${prog.departmentName}_${prog.medium}`;
    
    const programData = {
      id: programRef.id,
      name: prog.name,
      departmentId: departmentIds[prog.departmentName],
      years: prog.years,
      description: prog.description,
      collegeId,
      medium: prog.medium,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: 'system'
    };
    
    await programRef.set(programData);
    programIds[programKey] = programRef.id;
    console.log(`✅ Created program: ${prog.name} (${prog.departmentName} - ${prog.medium})`);
  }
  
  return programIds;
}

async function createSubjects(collegeId, programIds) {
  console.log('📚 Creating subjects...');
  
  const subjectIds = {};
  
  for (const subj of SUBJECTS) {
    const subjectRef = db.collection('subjects').doc();
    const programKey = `${subj.programName}_${getProgramDepartment(subj.programName)}_${subj.medium}`;
    const subjectKey = `${subj.name}_${programKey}_${subj.year}`;
    
    const subjectData = {
      id: subjectRef.id,
      name: subj.name,
      programId: programIds[programKey],
      collegeId,
      year: subj.year,
      medium: subj.medium,
      instructorId: 'system', // Will be updated when instructors are created
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: 'system'
    };
    
    await subjectRef.set(subjectData);
    subjectIds[subjectKey] = subjectRef.id;
    console.log(`✅ Created subject: ${subj.name} (${subj.programName} - Year ${subj.year})`);
  }
  
  return subjectIds;
}

async function createSampleCourses(collegeId, programIds, subjectIds) {
  console.log('📖 Creating sample courses...');
  
  let courseCount = 0;
  
  // Create sample courses for each subject
  for (const [subjectKey, subjectId] of Object.entries(subjectIds)) {
    const [subjectName, programKey, year] = subjectKey.split('_');
    
    const courseRef = db.collection('courses').doc();
    const courseData = {
      id: courseRef.id,
      title: `Introduction to ${subjectName}`,
      description: `A comprehensive course covering the fundamentals of ${subjectName}`,
      instructorId: 'system', // Will be updated when instructors are created
      programId: programIds[programKey.replace(`_${year}`, '')],
      subjectId,
      year: parseInt(year),
      medium: getMediumFromSubjectKey(subjectKey),
      collegeId,
      status: 'published',
      isPublished: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: 'system'
    };
    
    await courseRef.set(courseData);
    courseCount++;
    console.log(`✅ Created course: ${courseData.title}`);
  }
  
  console.log(`📊 Created ${courseCount} sample courses`);
}

function getProgramDepartment(programName) {
  const programDeptMap = {
    'BA': 'Arts',
    'MPC': 'Science',
    'HEC': 'Science', 
    'CEC': 'Science',
    'Computer Applications': 'Vocational',
    'Accounting': 'Vocational'
  };
  return programDeptMap[programName] || 'Science';
}

function getMediumFromSubjectKey(subjectKey) {
  return subjectKey.includes('_Telugu_') ? 'Telugu' : 'English';
}

// Run the seeding script
main().catch(console.error);
