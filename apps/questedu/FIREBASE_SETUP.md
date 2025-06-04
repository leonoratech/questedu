# QuestEdu - Firebase Firestore Integration

This project has been updated to use Firebase Firestore instead of hardcoded JSON data for course management.

## Setup Instructions

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable Firestore Database
4. Get your Firebase configuration from Project Settings

### 2. Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your Firebase credentials:
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=your-actual-api-key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-actual-project-id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

### 3. Zscaler Proxy Configuration

If you're behind a Zscaler proxy, the app is configured to disable SSL verification in development mode. This is handled automatically in the Firebase configuration.

### 4. Install Dependencies

```bash
npm install
```

### 5. Initialize Firestore Database

To populate your Firestore database with sample data, you can use the seed script:

1. Start the Expo development server:
   ```bash
   npm start
   ```

2. In your app, you can import and run the initialization script manually or run:
   ```javascript
   import { initializeDatabase } from './scripts/initializeFirestore';
   initializeDatabase();
   ```

### 6. Running the App

```bash
npm start
```

## Features

- ✅ Real-time course data from Firestore
- ✅ Search functionality
- ✅ Add/Edit/Delete courses
- ✅ Category filtering
- ✅ SSL verification disabled for Zscaler proxy
- ✅ Offline support (coming soon)
- ✅ Pull-to-refresh

## File Structure

```
firebase/
├── config.ts          # Firebase configuration with SSL settings
├── courseService.ts    # Firestore CRUD operations
└── seedData.ts        # Initial data seeding

hooks/
└── useCourses.ts      # React hooks for course management

components/
└── FirebaseProvider.tsx # Firebase initialization wrapper
```

## Troubleshooting

### SSL Certificate Issues (Zscaler)

If you encounter SSL certificate issues with Zscaler:

1. The app automatically disables SSL verification in development mode
2. Check that `EXPO_PUBLIC_DISABLE_SSL=true` is set in your `.env` file
3. Restart the development server after changing environment variables

### Firestore Connection Issues

1. Verify your Firebase configuration in `.env`
2. Check that Firestore is enabled in your Firebase project
3. Ensure your Firebase project has the correct security rules

### Data Not Loading

1. Check the console for Firebase initialization messages
2. Verify that the seed data has been populated
3. Check your network connection and proxy settings

## Security Rules

For development, you can use these basic Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /courses/{document} {
      allow read, write: if true; // Change this for production
    }
  }
}
```

**Important**: Update security rules for production deployment.
