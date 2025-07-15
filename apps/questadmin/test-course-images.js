/**
 * Test script to validate course image functionality
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Import firebase-admin
let admin;
try {
  admin = require('firebase-admin');
} catch (error) {
  console.error('❌ Firebase Admin SDK not installed.');
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
    private_key_id: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY_ID,
    client_id: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL)}`
  };
} else {
  console.error('❌ Firebase service account environment variables not found.');
  process.exit(1);
}

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  });
}

const adminDb = admin.firestore();

async function testCourseImageFields() {
  try {
    console.log('Testing course image fields...');
    
    // Get a sample course from the database
    const coursesSnapshot = await adminDb.collection('courses').limit(1).get();
    
    if (coursesSnapshot.empty) {
      console.log('No courses found in database. Please seed first.');
      return;
    }
    
    const courseDoc = coursesSnapshot.docs[0];
    const courseData = courseDoc.data();
    
    console.log('Sample course data:');
    console.log('ID:', courseDoc.id);
    console.log('Title:', courseData.title);
    console.log('Image:', courseData.image);
    console.log('ImageFileName:', courseData.imageFileName);
    console.log('ImageStoragePath:', courseData.imageStoragePath);
    console.log('ThumbnailUrl:', courseData.thumbnailUrl);
    console.log('CategoryId:', courseData.categoryId);
    console.log('DifficultyId:', courseData.difficultyId);
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testCourseImageFields();
