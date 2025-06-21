# QuestAdmin Database Management Guide

## Overview

This guide provides comprehensive instructions for managing the QuestAdmin database, including clearing existing data and seeding fresh test data.

## Problem: Email Already in Use

When seeding the database, you may encounter "Firebase: Error (auth/email-already-in-use)" errors. This happens because Firebase Authentication retains user accounts even after clearing Firestore collections.

## Solution: Complete Database Reset

### Method 1: Using Firebase Console (Recommended)

1. **Clear Firebase Authentication Users:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project (`questedu-cb2a4`)
   - Navigate to **Authentication > Users**
   - Select all users and delete them manually
   - Alternatively, click on each user and delete individually

2. **Clear Firestore Collections:**
   ```bash
   cd /home/solmon/github/questedu/apps/questadmin
   node scripts/db-manager.js clear
   ```

3. **Seed Fresh Data:**
   ```bash
   node scripts/db-manager.js seed
   ```

### Method 2: Using Firebase CLI (Advanced)

1. **Install Firebase CLI (if not already installed):**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Clear Authentication Users:**
   ```bash
   # List all users
   firebase auth:export users.json --project questedu-cb2a4
   
   # Delete all users (this requires manual deletion via console for now)
   # Firebase CLI doesn't have a direct command to delete all users
   ```

3. **Clear Firestore and Seed:**
   ```bash
   node scripts/db-manager.js clear
   node scripts/db-manager.js seed
   ```

### Method 3: Firebase Admin SDK (For Developers)

If you have Firebase Admin SDK properly configured with service account credentials:

1. **Set up Service Account:**
   - Go to Firebase Console > Project Settings > Service Accounts
   - Generate and download a private key JSON file
   - Set environment variable:
     ```bash
     export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account.json"
     ```

2. **Clear Everything:**
   ```bash
   node scripts/db-manager.js clear  # This will clear both Firestore and Auth users
   ```

3. **Seed Fresh Data:**
   ```bash
   node scripts/db-manager.js seed
   ```

## Available Commands

### Database Management Commands

```bash
# Check database status
node scripts/db-manager.js status

# Clear Firestore collections only
node scripts/db-manager.js clear

# Clear Firebase Auth users only (requires Admin SDK)
node scripts/db-manager.js clear-auth

# Seed database with mock data
node scripts/db-manager.js seed

# Complete reset (clear + seed)
node scripts/db-manager.js reset

# Migrate data
node scripts/db-manager.js migrate

# Run tests
node scripts/db-manager.js test
```

### Index Management Commands

```bash
# Check index status
node scripts/db-manager.js indexes-status

# Deploy indexes
node scripts/db-manager.js indexes-deploy

# Recreate all indexes
node scripts/db-manager.js indexes-recreate

# Validate index configuration
node scripts/db-manager.js indexes-validate
```

### Setup Commands

```bash
# Setup Firebase CLI
node scripts/db-manager.js setup-firebase

# Setup Firebase Admin SDK
node scripts/db-manager.js setup-admin
```

## Test User Credentials

After successful seeding, you can use these test accounts:

### Superadmin
- **Email:** `superadmin@questedu.com`
- **Password:** `SuperAdmin123!`

### Sample Instructor
- **Email:** `prof.smith@questedu.com`
- **Password:** `Instructor123!`

### Sample Student
- **Email:** `alice.wilson@student.com`
- **Password:** `Student123!`

## Troubleshooting

### Issue: "auth/email-already-in-use"
**Solution:** Clear Firebase Authentication users first (see methods above)

### Issue: "Firebase Admin SDK not available"
**Solution:** 
```bash
cd apps/questadmin
pnpm add firebase-admin
```

### Issue: "Could not load the default credentials"
**Solution:** Either:
1. Use Firebase Console method (recommended for quick fixes)
2. Set up proper service account credentials for Admin SDK

### Issue: Script hangs or times out
**Solution:**
1. Check your internet connection
2. Verify Firebase configuration
3. Try clearing data manually via Firebase Console
4. Check for any network firewalls blocking Firebase API calls

### Issue: Index errors during queries
**Solution:**
```bash
# Deploy proper indexes
node scripts/db-manager.js indexes-deploy

# Or recreate all indexes
node scripts/db-manager.js indexes-recreate
```

## Best Practices

1. **Always clear authentication users** before seeding if you encounter email conflicts
2. **Use Firebase Console** for manual operations when scripts fail
3. **Set up proper service account** for production environments
4. **Backup important data** before running clear operations
5. **Test with sample accounts** after seeding to verify functionality

## Manual Cleanup Steps

If automated scripts fail, follow these manual steps:

1. **Firebase Console > Authentication:**
   - Delete all users manually

2. **Firebase Console > Firestore Database:**
   - Delete collections: `users`, `courses`, `courseTopics`, `courseQuestions`, `colleges`, `activities`, `enrollments`

3. **Run Seed Script:**
   ```bash
   node scripts/db-manager.js seed
   ```

## Environment Setup

Ensure your environment has:
- Node.js 18+
- Firebase CLI (optional but recommended)
- Proper Firebase configuration in your environment variables
- Network access to Firebase services

## Support

If you continue to have issues:
1. Check the script output for specific error messages
2. Verify your Firebase project configuration
3. Ensure proper permissions on your Firebase project
4. Consider using Firebase Local Emulator for development
