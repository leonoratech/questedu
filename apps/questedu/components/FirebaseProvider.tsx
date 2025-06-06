import React, { useEffect } from 'react';
import { getRepositories } from '../lib/questdata-config';

interface FirebaseProviderProps {
  children: React.ReactNode;
}

const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
  useEffect(() => {
    // Initialize questdata repositories when the app starts
    try {
      const repositories = getRepositories();
      console.log('🔥 QuestData repositories initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize QuestData repositories:', error);
    }
  }, []);

  return <>{children}</>;
};

export default FirebaseProvider;
