import { addDoc, collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './config';

export interface DiagnosticResult {
  test: string;
  success: boolean;
  error?: any;
  message: string;
}

export const runFirestoreDiagnostics = async (): Promise<DiagnosticResult[]> => {
  const results: DiagnosticResult[] = [];

  // Test 1: Database Connection
  try {
    if (db) {
      results.push({
        test: 'Database Connection',
        success: true,
        message: 'Firestore instance initialized successfully'
      });
    } else {
      results.push({
        test: 'Database Connection',
        success: false,
        message: 'Firestore instance is null or undefined'
      });
    }
  } catch (error) {
    results.push({
      test: 'Database Connection',
      success: false,
      error,
      message: `Failed to initialize Firestore: ${error}`
    });
  }

  // Test 2: Read Operation
  try {
    const testDoc = doc(db, 'test', 'read-test');
    const docSnap = await getDoc(testDoc);
    
    results.push({
      test: 'Read Operation',
      success: true,
      message: `Read test successful. Document exists: ${docSnap.exists()}`
    });
  } catch (error: any) {
    results.push({
      test: 'Read Operation',
      success: false,
      error,
      message: `Read failed: ${error?.code || error?.message || 'Unknown error'}`
    });
  }

  // Test 3: Write Operation (Simple Document)
  try {
    const testDoc = doc(db, 'test', 'write-test');
    await setDoc(testDoc, {
      timestamp: new Date().toISOString(),
      test: 'write-test',
      success: true
    });
    
    results.push({
      test: 'Write Operation (setDoc)',
      success: true,
      message: 'Write test successful using setDoc'
    });
  } catch (error: any) {
    results.push({
      test: 'Write Operation (setDoc)',
      success: false,
      error,
      message: `Write failed: ${error?.code || error?.message || 'Unknown error'}`
    });
  }

  // Test 4: Collection Add Operation
  try {
    const testCollection = collection(db, 'test-collection');
    const docRef = await addDoc(testCollection, {
      timestamp: new Date().toISOString(),
      test: 'addDoc-test',
      success: true
    });
    
    results.push({
      test: 'Collection Add (addDoc)',
      success: true,
      message: `Collection add successful. Document ID: ${docRef.id}`
    });
  } catch (error: any) {
    results.push({
      test: 'Collection Add (addDoc)',
      success: false,
      error,
      message: `Collection add failed: ${error?.code || error?.message || 'Unknown error'}`
    });
  }

  // Test 5: Courses Collection Specific Test
  try {
    const coursesCollection = collection(db, 'courses');
    const testCourse = {
      title: 'Diagnostic Test Course',
      instructor: 'Test Instructor',
      progress: 0,
      image: 'https://via.placeholder.com/300',
      category: 'Test',
      description: 'This is a test course for diagnostics',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await addDoc(coursesCollection, testCourse);
    
    results.push({
      test: 'Courses Collection Test',
      success: true,
      message: `Successfully added test course. ID: ${docRef.id}`
    });
    
    // Clean up the test course
    try {
      await import('firebase/firestore').then(({ deleteDoc, doc }) => 
        deleteDoc(doc(db, 'courses', docRef.id))
      );
    } catch (cleanupError) {
      console.warn('Could not clean up test course:', cleanupError);
    }
    
  } catch (error: any) {
    results.push({
      test: 'Courses Collection Test',
      success: false,
      error,
      message: `Courses collection test failed: ${error?.code || error?.message || 'Unknown error'}`
    });
  }

  return results;
};

export const getFirebaseProjectInfo = () => {
  try {
    const config = {
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ? '***' + process.env.EXPO_PUBLIC_FIREBASE_API_KEY.slice(-4) : 'Not set',
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
    };
    
    return {
      success: true,
      config,
      message: 'Firebase configuration loaded successfully'
    };
  } catch (error) {
    return {
      success: false,
      error,
      message: `Failed to load Firebase configuration: ${error}`
    };
  }
};
