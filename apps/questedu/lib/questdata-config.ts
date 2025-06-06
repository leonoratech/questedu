import type { EnvironmentConfig, FirebaseConfig, IRepositoryFactory } from '@questedu/questdata';
import { createFirebaseRepositories, getFirebaseProjectInfo, runFirebaseDiagnostics } from '@questedu/questdata';

/**
 * Firebase configuration for questedu app
 */
const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyALWHvJopjpZ9amcpV74jrBlYqEZzeWaTI",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "questedu-cb2a4.firebaseapp.com", 
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "questedu-cb2a4",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "questedu-cb2a4.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "247130380208",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:247130380208:web:dfe0053ff32ae3194a6875"
};

/**
 * Environment configuration for React Native Expo
 */
const environmentConfig: EnvironmentConfig = {
  enableDebugLogging: __DEV__ || true,
  disableSSL: process.env.EXPO_PUBLIC_DISABLE_SSL === 'true' || true,
  useEmulator: false, // Set to true for development with emulator
  emulatorHost: 'localhost',
  emulatorPort: 8080
};

/**
 * Initialize the questdata repositories
 */
let repositoryFactory: IRepositoryFactory | null = null;

export function getRepositoryFactory(): IRepositoryFactory {
  if (!repositoryFactory) {
    repositoryFactory = createFirebaseRepositories(firebaseConfig, environmentConfig);
  }
  return repositoryFactory;
}

/**
 * Get the course repository
 */
export function getCourseRepository() {
  return getRepositoryFactory().courseRepository;
}

/**
 * Run Firebase diagnostics
 */
export { getFirebaseProjectInfo, runFirebaseDiagnostics };

/**
 * Debug configuration logging
 */
if (__DEV__) {
  console.log('🔥 QuestData Firebase Config:', {
    projectId: firebaseConfig.projectId,
    apiKey: firebaseConfig.apiKey ? '***' + firebaseConfig.apiKey.slice(-4) : 'missing',
    authDomain: firebaseConfig.authDomain,
    environment: environmentConfig
  });
}
