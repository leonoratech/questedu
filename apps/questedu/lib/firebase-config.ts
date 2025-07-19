import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, Firestore, getFirestore } from 'firebase/firestore';
import { FirebaseStorage, getStorage } from 'firebase/storage';

/**
 * Firebase configuration for React Native app
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
 * Environment configuration for React Native Expo
 */
export interface EnvironmentConfig {
  enableDebugLogging: boolean;
  disableSSL: boolean;
  useEmulator: boolean;
  emulatorHost: string;
  emulatorPort: number;
}

const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyALWHvJopjpZ9amcpV74jrBlYqEZzeWaTI",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "leonora-c9f8b.firebaseapp.com", 
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "leonora-c9f8b",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "leonora-c9f8b.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "247130380208",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:247130380208:web:dfe0053ff32ae3194a6875"
};

/**
 * Environment configuration for React Native Expo
 */
const environmentConfig: EnvironmentConfig = {
  enableDebugLogging: __DEV__ || true,
  disableSSL: process.env.EXPO_PUBLIC_DISABLE_SSL === 'true' || true,
  useEmulator: process.env.EXPO_PUBLIC_USE_EMULATOR === 'true' || false,
  emulatorHost: process.env.EXPO_PUBLIC_EMULATOR_HOST || 'localhost',
  emulatorPort: parseInt(process.env.EXPO_PUBLIC_EMULATOR_PORT || '8080')
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
    firebaseApp = initializeApp(firebaseConfig);
    
    // Initialize services
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);
    storage = getStorage(firebaseApp);
    
    // Connect to emulator if needed
    if (environmentConfig.useEmulator && __DEV__) {
      try {
        connectFirestoreEmulator(firestore, environmentConfig.emulatorHost, environmentConfig.emulatorPort);
        if (environmentConfig.enableDebugLogging) {
          console.log(`Connected to Firestore emulator at ${environmentConfig.emulatorHost}:${environmentConfig.emulatorPort}`);
        }
      } catch (error) {
        if (environmentConfig.enableDebugLogging) {
          console.warn('Firestore emulator connection failed:', error);
        }
      }
    }
    
    if (environmentConfig.enableDebugLogging) {
      console.log('Firebase initialized for React Native app');
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
    environment: __DEV__ ? 'development' : 'production',
    config: environmentConfig
  };
}

/**
 * Run Firebase diagnostics
 */
export async function runFirebaseDiagnostics(): Promise<void> {
  try {
    const info = getProjectInfo();
    console.log('🔧 Firebase Configuration Diagnostics');
    console.log('=====================================');
    console.log('Project ID:', info.projectId);
    console.log('Auth Domain:', info.authDomain);
    console.log('Storage Bucket:', info.storageBucket);
    console.log('Environment:', info.environment);
    console.log('Debug Logging:', info.config.enableDebugLogging);
    console.log('SSL Disabled:', info.config.disableSSL);
    console.log('Using Emulator:', info.config.useEmulator);
    
    if (info.config.useEmulator) {
      console.log('Emulator Host:', info.config.emulatorHost);
      console.log('Emulator Port:', info.config.emulatorPort);
    }
    
    console.log('=====================================');
  } catch (error) {
    console.error('Firebase diagnostics failed:', error);
  }
}
