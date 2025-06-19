import React, { useEffect } from 'react';
import { initializeFirebase } from '../lib/firebase-config';

interface FirebaseProviderProps {
  children: React.ReactNode;
}

const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
  useEffect(() => {
    // Initialize Firebase when the app starts
    try {
      initializeFirebase();
      console.log('🔥 Firebase initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Firebase:', error);
    }
  }, []);

  return <>{children}</>;
};

export default FirebaseProvider;
