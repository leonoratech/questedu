import {
    createFirebaseRepositories,
    EnvironmentConfig,
    FirebaseConfig,
    getFirebaseProjectInfo,
    IRepositoryFactory,
    runFirebaseDiagnostics
} from '@questedu/questdata';

/**
 * Firebase configuration for questadmin app
 */
const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyALWHvJopjpZ9amcpV74jrBlYqEZzeWaTI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "questedu-cb2a4.firebaseapp.com", 
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "questedu-cb2a4",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "questedu-cb2a4.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "247130380208",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:247130380208:web:dfe0053ff32ae3194a6875"
};

/**
 * Environment configuration for Next.js
 */
const environmentConfig: EnvironmentConfig = {
  disableSSL: process.env.NEXT_PUBLIC_DISABLE_SSL === 'true',
  useEmulator: process.env.NODE_ENV === 'development',
  emulatorHost: 'localhost',
  emulatorPort: 8080,
  enableDebugLogging: process.env.NODE_ENV === 'development'
};

/**
 * Global repository factory instance
 */
let repositoryFactory: IRepositoryFactory | null = null;

/**
 * Initialize and get the repository factory
 */
export const getRepositories = (): IRepositoryFactory => {
  if (!repositoryFactory) {
    repositoryFactory = createFirebaseRepositories(firebaseConfig, environmentConfig);
  }
  return repositoryFactory;
};

/**
 * Get the course repository
 */
export const getCourseRepository = () => {
  return getRepositories().courseRepository;
};

/**
 * Run Firebase diagnostics
 */
export { getFirebaseProjectInfo, runFirebaseDiagnostics };

