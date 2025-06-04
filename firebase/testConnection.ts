import { db } from './config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  try {
    console.log('🔍 Testing Firebase connection...');
    
    // Test 1: Check if database is initialized
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }
    console.log('✅ Database instance exists');
    
    // Test 2: Try to read a simple document (will fail if no permission but at least tests connectivity)
    const testDoc = doc(db, 'test', 'connection');
    console.log('🔗 Testing document read...');
    
    try {
      const docSnap = await getDoc(testDoc);
      console.log('✅ Document read test successful');
      
      // Test 3: Try to write a simple document
      console.log('📝 Testing document write...');
      await setDoc(testDoc, {
        timestamp: new Date().toISOString(),
        test: true
      });
      console.log('✅ Document write test successful');
      
      return { success: true, message: 'Firebase connection is working' };
    } catch (readError: any) {
      console.log('📖 Read test result:', readError.code || readError.message);
      
      if (readError.code === 'permission-denied') {
        return { 
          success: false, 
          message: 'Permission denied - Check Firestore security rules',
          error: readError
        };
      } else if (readError.code === 'failed-precondition') {
        return { 
          success: false, 
          message: 'Firestore not enabled or misconfigured',
          error: readError
        };
      } else {
        throw readError;
      }
    }
    
  } catch (error: any) {
    console.error('❌ Firebase connection test failed:', error);
    return { 
      success: false, 
      message: `Connection failed: ${error.message}`,
      error
    };
  }
};
