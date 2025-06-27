// Firebase Admin SDK configuration for server-side operations
import * as admin from 'firebase-admin'

/**
 * Initialize Firebase Admin SDK
 * This function ensures the Admin SDK is initialized only once
 */
function initializeFirebaseAdmin() {
  if (admin.apps.length === 0) {
    try {
      // Use environment variables for service account
      if (process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY && process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'questedu-cb2a4',
            clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          }),
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'questedu-cb2a4',
        })
      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'questedu-cb2a4',
        })
      } else {
        // For development/testing without credentials
        admin.initializeApp({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'questedu-cb2a4',
        })
      }
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error)
      throw error
    }
  }
  
  return admin
}

// Initialize and export Firebase Admin services
const adminApp = initializeFirebaseAdmin()
export const adminAuth = adminApp.auth()
export const adminDb = adminApp.firestore()
export const timestamp = (): admin.firestore.FieldValue => admin.firestore.FieldValue.serverTimestamp()
export default adminApp
