import React, { useEffect } from 'react';
import '../firebase/config'; // This initializes Firebase

interface FirebaseProviderProps {
  children: React.ReactNode;
}

const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
  useEffect(() => {
    // Initialize Firebase when the app starts
    console.log('🔥 Firebase initialized with SSL disabled for Zscaler proxy');
  }, []);

  return <>{children}</>;
};

export default FirebaseProvider;
