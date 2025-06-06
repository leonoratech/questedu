# QuestEdu Admin Setup Guide

This guide explains how to set up and use the QuestAdmin dashboard alongside the QuestEdu mobile app.

## Overview

- **QuestEdu** (`apps/questedu`): React Native mobile app for students
- **QuestAdmin** (`apps/questadmin`): Next.js web dashboard for course management

Both apps share the same Firebase Firestore database for real-time synchronization.

## Quick Setup

### 1. Prerequisites

- Node.js 18+ 
- pnpm 8+
- Firebase project with Firestore enabled

### 2. Install Dependencies

```bash
git clone <repository>
cd questedu
pnpm install
```

### 3. Configure Firebase

Both apps use the same Firebase credentials. Set up the environment files:

**For QuestEdu (Mobile App):**
```bash
cd apps/questedu
cp .env.example .env
# Edit .env with your Firebase credentials
```

**For QuestAdmin (Web Dashboard):**
```bash
cd apps/questadmin  
cp .env.example .env.local
# Edit .env.local with the same Firebase credentials
```

### 4. Start Both Applications

**Option A: Start Both at Once**
```bash
# Terminal 1: Start mobile app
pnpm dev

# Terminal 2: Start admin dashboard  
pnpm admin
```

**Option B: Start Individually**
```bash
# Mobile app (Expo) - http://localhost:19006
cd apps/questedu && pnpm dev

# Admin dashboard (Next.js) - http://localhost:3001
cd apps/questadmin && pnpm dev
```

## Usage Workflow

### 1. Course Management (Admin Dashboard)

1. Open http://localhost:3001
2. Create/edit/delete courses
3. Set course details (title, instructor, category, description, image)
4. Changes are immediately saved to Firestore

### 2. Mobile App (QuestEdu)

1. Open the Expo app (scan QR code or press 'w' for web)
2. Initialize database if first time (use DatabaseInitializer component)
3. View courses that were created in admin dashboard
4. Pull to refresh to see latest changes

### 3. Real-time Sync

- Admin dashboard changes → Mobile app (refresh to see)
- Both apps use the same Firestore collection (`courses`)
- Course data structure is shared between both apps

## Available Scripts

From the project root:

```bash
# Mobile App (QuestEdu)
pnpm dev          # Start Expo development server
pnpm android      # Run on Android
pnpm ios          # Run on iOS  
pnpm web          # Run in web browser

# Admin Dashboard (QuestAdmin)
pnpm admin        # Start Next.js development server
pnpm admin:build  # Build for production
pnpm admin:start  # Start production server

# Both
pnpm install:clean # Clean install all dependencies
```

## Firebase Configuration

Both apps require the same Firebase environment variables:

```env
# For questedu (.env)
EXPO_PUBLIC_FIREBASE_API_KEY=your-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id

# For questadmin (.env.local) 
NEXT_PUBLIC_FIREBASE_API_KEY=your-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Firestore Security Rules

For development, use permissive rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    allow read, write: if true;
  }
}
```

⚠️ **Production**: Implement proper authentication and restrictive rules.

## Troubleshooting

### Common Issues

1. **Firebase connection errors**
   - Verify credentials in both `.env` files
   - Check Firestore is enabled in Firebase Console

2. **Permission denied errors**  
   - Update Firestore security rules
   - Ensure both apps use same Firebase project

3. **Courses not syncing**
   - Refresh mobile app (pull down on course list)
   - Check Firebase Console for data
   - Verify both apps use same collection name (`courses`)

4. **Port conflicts**
   - Mobile app: http://localhost:19006
   - Admin dashboard: http://localhost:3001
   - Ensure both ports are available

### Development Tips

- Use Firebase Console to monitor database changes
- Check browser/app console logs for errors
- Test course creation in admin → view in mobile app
- Use DatabaseInitializer in mobile app to seed initial data

## Next Steps

1. **Authentication**: Add admin login to web dashboard
2. **Real-time Updates**: Implement live updates in admin dashboard  
3. **Image Upload**: Add file upload for course images
4. **User Management**: Add student/instructor management
5. **Analytics**: Add course enrollment and progress tracking

## Support

- Check individual app READMEs for detailed documentation
- Review Firebase setup guides in `apps/questedu/` 
- Consult Firestore security rules documentation
