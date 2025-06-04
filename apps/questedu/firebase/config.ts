import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyALWHvJopjpZ9amcpV74jrBlYqEZzeWaTI",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "questedu-cb2a4.firebaseapp.com", 
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "questedu-cb2a4",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "questedu-cb2a4.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "247130380208",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:247130380208:web:dfe0053ff32ae3194a6875"
};

// Debug: Log configuration (remove in production)
console.log('🔥 Firebase Config:', {
  projectId: firebaseConfig.projectId,
  apiKey: firebaseConfig.apiKey ? '***' + firebaseConfig.apiKey.slice(-4) : 'missing',
  authDomain: firebaseConfig.authDomain
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// For development/testing - you might want to use emulator
// if (__DEV__ && process.env.EXPO_PUBLIC_USE_EMULATOR === 'true') {
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   console.log('🔧 Connected to Firestore Emulator');
// }

console.log('✅ Firestore initialized successfully');

export { app, db };
export default app;
