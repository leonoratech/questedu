/**
 * Firebase Initialization Script for QuestEdu React Native App
 * This script ensures Firebase is properly initialized and tests the connection
 */

import { initializeFirebase, runFirebaseDiagnostics } from './firebase-config';
import { firebaseCourseService } from './firebase-course-service';

/**
 * Initialize Firebase and run basic connectivity tests
 */
export async function initializeFirebaseServices(): Promise<void> {
  try {
    console.log('🔥 Initializing Firebase services...');
    
    // Initialize Firebase
    const app = initializeFirebase();
    console.log('✅ Firebase app initialized successfully');
    
    // Run diagnostics
    await runFirebaseDiagnostics();
    console.log('✅ Firebase diagnostics completed');
    
    // Test Firebase connection by fetching courses
    console.log('🔍 Testing Firebase connection...');
    const result = await firebaseCourseService.getAll({ limit: 1 });
    console.log(`✅ Firebase connection test successful - Found ${result.total} courses`);
    
    console.log('🎉 Firebase initialization completed successfully!');
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    throw error;
  }
}

/**
 * Check Firebase connection status
 */
export async function checkFirebaseConnection(): Promise<boolean> {
  try {
    const result = await firebaseCourseService.getAll({ limit: 1 });
    return true;
  } catch (error) {
    console.error('Firebase connection check failed:', error);
    return false;
  }
}

/**
 * Get Firebase service status
 */
export function getFirebaseServiceStatus() {
  return {
    courseService: firebaseCourseService ? 'initialized' : 'not initialized',
    timestamp: new Date().toISOString()
  };
}
