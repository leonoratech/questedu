import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { FirebaseStorage, getStorage } from 'firebase/storage';

/**
 * Firebase configuration for questadmin app
 */
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

/**
 * Environment configuration for Next.js
 */
export interface EnvironmentConfig {
  enableDebugLogging: boolean;
  disableSSL: boolean;
  enablePerformanceLogging: boolean;
  enableValidation: boolean;
  maxRetries: number;
  requestTimeout: number;
}

const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyA3V83lcLFMLiJ8wvAalRUYDWDVlMaCl4o",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "leonora-c9f8b.firebaseapp.com", 
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "leonora-c9f8b",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "leonora-c9f8b.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "67131698156",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:67131698156:web:303bc1740883366d99aec9"
};

/**
 * Environment configuration for Next.js
 */
const environmentConfig: EnvironmentConfig = {
  enableDebugLogging: process.env.NODE_ENV === 'development' || true,
  disableSSL: process.env.NEXT_PUBLIC_DISABLE_SSL === 'true' || false,
  enablePerformanceLogging: process.env.NODE_ENV === 'development',
  enableValidation: true,
  maxRetries: 3,
  requestTimeout: 30000
};

/**
 * Firebase services instance
 */
let firebaseApp: FirebaseApp | null = null;
let firestore: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;

/**
 * Initialize Firebase configuration
 */
export function initializeFirebase(): FirebaseApp {
  if (!firebaseApp) {
    console.log('🚀 Initializing Firebase configuration...');
    
    firebaseApp = initializeApp(firebaseConfig);
    firestore = getFirestore(firebaseApp);
    auth = getAuth(firebaseApp);
    storage = getStorage(firebaseApp);
    
    // Connect to emulator in development if specified
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
      try {
        connectFirestoreEmulator(firestore, 'localhost', 8080);
        console.log('🔧 Connected to Firestore emulator');
      } catch (error) {
        console.log('ℹ️ Firestore emulator already connected or not available');
      }
    }
    
    console.log('✅ Firebase configuration initialized successfully');
    
    // Run diagnostics in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Firebase diagnostics:');
      console.log('- Project ID:', firebaseConfig.projectId);
      console.log('- Auth Domain:', firebaseConfig.authDomain);
      console.log('- Storage Bucket:', firebaseConfig.storageBucket);
    }
  }
  
  return firebaseApp;
}

/**
 * Get Firestore instance
 */
export function getFirestoreDb(): Firestore {
  if (!firestore) {
    initializeFirebase();
  }
  return firestore!;
}

/**
 * Get Auth instance
 */
export function getFirebaseAuth(): Auth {
  if (!auth) {
    initializeFirebase();
  }
  return auth!;
}

/**
 * Get Storage instance
 */
export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) {
    initializeFirebase();
  }
  return storage!;
}

/**
 * Get project info and configuration
 */
export function getProjectInfo() {
  return {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    storageBucket: firebaseConfig.storageBucket,
    environment: process.env.NODE_ENV || 'development',
    config: environmentConfig
  };
}

/**
 * Export configurations for external use
 */
export { environmentConfig, firebaseConfig };

