# Quick Database Initialization Guide

## 🚨 Getting "Bad Request" Error?

**Most Common Issue**: Firestore security rules are blocking database writes.

### Quick Fix:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project → Firestore → Rules
3. Replace rules with: `allow read, write: if true;`
4. Click Publish and wait 30 seconds
5. Try initialization again

**Detailed Fix**: See `FIRESTORE_SECURITY_RULES.md` for complete instructions.

---

## Step-by-Step Instructions

### 1. Setup Firebase Credentials

First, make sure you have your Firebase project set up:

1. **Copy the environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Update `.env` with your Firebase credentials:**
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=your-actual-api-key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-actual-project-id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

### 2. Fix Firestore Security Rules (IMPORTANT!)

**This step is crucial** - without it, you'll get "bad request" errors:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `questedu-cb2a4`
3. Navigate to **Firestore Database** → **Rules**
4. Replace existing rules with:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       allow read, write: if true;
     }
   }
   ```
5. Click **Publish** and wait 30-60 seconds

### 3. Start the Development Server

```bash
npm start
```

### 4. Open the App

- For iOS: Press `i` or scan QR code with camera
- For Android: Press `a` or scan QR code with Expo Go app
- For Web: Press `w` or open http://localhost:19006

### 5. Initialize Database

Once the app loads:

1. **You'll see a "Database Initialization" card** at the bottom of the home screen
2. **Run diagnostics first**: Click "Run Diagnostics" to test your connection
3. **If diagnostics pass**: Click "Initialize Database" button
4. **Wait for success message**: "✅ Database initialized successfully with sample courses!"
5. **Your courses should now load** from Firestore instead of being empty

### 6. Verify Database

After initialization:
- Pull down to refresh the course list
- You should see 4 sample courses loaded from Firestore
- Try searching for courses to test the search functionality

### 6. Remove Initialization Component (Optional)

Once you've successfully initialized the database, you can remove the DatabaseInitializer component:

1. Open `app/index.tsx`
2. Remove the import: `import DatabaseInitializer from '../components/DatabaseInitializer';`
3. Remove the component: `<DatabaseInitializer />`

## Troubleshooting

### If you see "Failed to initialize database":

1. **Check your Firebase credentials** in `.env`
2. **Verify your Firebase project** has Firestore enabled
3. **Check the console logs** for specific error messages
4. **Ensure you're connected to the internet**
5. **If behind Zscaler proxy**, the SSL settings should handle this automatically

### If courses don't appear:

1. **Pull down to refresh** the course list
2. **Check Firebase console** to see if data was actually added
3. **Restart the app** and try again

### Firebase Console Access:

You can also verify the data was added by checking your Firebase Console:
1. Go to https://console.firebase.google.com/
2. Select your project
3. Go to Firestore Database
4. Look for the "courses" collection

## Alternative Methods

### Method 1: Via Code (Advanced Users)

If you prefer to run initialization via code:

```javascript
import { initializeDatabase } from './scripts/initializeFirestore';

// Run this in your app or console
initializeDatabase();
```

### Method 2: Direct Service Call

```javascript
import { seedCourses } from './firebase/seedData';

// Run this directly
seedCourses();
```

## Success Indicators

✅ You'll see "Database initialized successfully" message
✅ Course list will populate with 4 sample courses
✅ Search functionality will work
✅ Real-time updates will be active
✅ Pull-to-refresh will work

The DatabaseInitializer component is now available on your home screen and ready to use!
