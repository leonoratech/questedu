# Fixing "Bad Request" Error - Firestore Security Rules

## The Problem

The "bad request" error you're seeing is most likely caused by Firestore security rules that are blocking write operations. By default, Firestore denies all read and write operations for security.

## Solution: Update Firestore Security Rules

### Step 1: Go to Firebase Console

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `questedu-cb2a4`
3. Go to **Firestore Database** in the left sidebar
4. Click on the **Rules** tab

### Step 2: Update Security Rules

Replace the existing rules with this **development-friendly** version:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read and write access to all documents (DEVELOPMENT ONLY)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Step 3: Publish the Rules

1. Click **Publish** button
2. Wait for the rules to be deployed (usually takes a few seconds)

## ⚠️ Important Security Note

**The above rules allow unrestricted access and should ONLY be used for development/testing.**

For production, use more restrictive rules like:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Courses collection - read/write access for authenticated users
    match /courses/{courseId} {
      allow read: if true; // Allow public read
      allow write: if request.auth != null; // Require authentication for writes
    }
    
    // Test collection for connection testing
    match /test/{document} {
      allow read, write: if true;
    }
  }
}
```

## Alternative: Quick Test Rules

If you want to be slightly more restrictive but still allow testing:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all operations on courses collection
    match /courses/{document} {
      allow read, write: if true;
    }
    
    // Allow all operations on test collection
    match /test/{document} {
      allow read, write: if true;
    }
    
    // Deny everything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## After Updating Rules

1. **Wait 30 seconds** for rules to propagate
2. **Restart your Expo development server**:
   ```bash
   # Stop the current server (Ctrl+C)
   npm start
   ```
3. **Try the "Test Connection" button** in your app
4. **Then try "Initialize Database"**

## Verification

After updating the rules, you should see:
- ✅ "Test Connection" button works
- ✅ "Initialize Database" succeeds
- ✅ Courses load in the app
- ✅ No more "bad request" errors

## Common Rule Errors

### Error: `permission-denied`
- Rules are too restrictive
- Use the development rules above

### Error: `failed-precondition` 
- Firestore is not enabled
- Go to Firestore Database → Create database

### Error: `unauthenticated`
- Rules require authentication but user is not signed in
- Use `allow read, write: if true;` for testing

The security rules are the most common cause of the "bad request" error you're experiencing.
