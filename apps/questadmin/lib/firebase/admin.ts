import admin from 'firebase-admin'

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'leonora-c9f8b',
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'leonora-c9f8b',
  })
  
  // Configure Firestore to ignore undefined properties
  admin.firestore().settings({
    ignoreUndefinedProperties: true
  })
}

export const adminAuth = admin.auth()
export const adminDb = admin.firestore()

export default admin
