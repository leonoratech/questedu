# QuestEdu App

A React Native educational platform app built with Expo. **Now with standalone Firebase integration!**

## ✨ Recent Updates

- 🔥 **Standalone Firebase Integration**: Removed dependency on `@questedu/questdata` monorepo package
- 🚀 **Enhanced Performance**: Optimized Firebase operations and real-time subscriptions
- 📱 **Mobile-First**: Designed specifically for React Native with Expo support
- 🔧 **Type-Safe**: Complete TypeScript interfaces and type definitions
- 🛠️ **Developer Experience**: Comprehensive diagnostics and debugging tools

## Features

- 📚 **Course Management**: Create, read, update, delete courses
- 🔍 **Advanced Search**: Full-text search with filtering by category, level, and more
- 🔄 **Real-time Sync**: Live updates across devices
- 👤 **User Profiles**: Profile management and progress tracking
- 🔥 **Firebase Integration**: Standalone Firebase services (no external dependencies)
- 🎨 **Material Design**: Beautiful UI with react-native-paper
- 🧭 **Navigation**: Bottom tabs + drawer navigation
- 📱 **Cross-Platform**: iOS, Android, and Web support

## Tech Stack

- **Framework**: React Native with Expo
- **UI Library**: React Native Paper (Material Design)
- **Navigation**: React Navigation v7
- **Database**: Firebase Firestore (standalone integration)
- **Language**: TypeScript
- **State Management**: React Hooks + Context API
- **Real-time**: Firebase real-time subscriptions

## Development

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your Firebase credentials
# See Firebase Setup section below for details
```

### 2. Install Dependencies

This app is part of a pnpm monorepo. From the root directory:

```bash
# Install all dependencies
pnpm install

# Start development server
pnpm dev

# Start on specific platforms
pnpm android  # Android
pnpm ios      # iOS  
pnpm web      # Web browser
```

Or run commands directly in this directory:

```bash
cd apps/questedu

# Install dependencies (if needed)
pnpm install

# Start development server
pnpm dev

# Other commands
pnpm android
pnpm ios
pnpm web
pnpm build
pnpm lint
```

### 3. Firebase Setup

The app uses standalone Firebase integration. You'll need:

1. **Firebase Project**: Create a project at [Firebase Console](https://console.firebase.google.com)
2. **Firestore Database**: Enable Firestore in your project
3. **Environment Variables**: Configure in `.env` file

```env
# Required Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id

# Optional (for corporate networks)
EXPO_PUBLIC_DISABLE_SSL=true
```

### 4. Test the Setup

```javascript
// In your app, test Firebase connection
import { initializeFirebaseServices } from './lib/firebase-init';

await initializeFirebaseServices();
console.log('🎉 Firebase is ready!');
```

## Project Structure

```
├── app/                    # App screens using expo-router
│   ├── _layout.tsx        # Root layout
│   ├── index.tsx          # Home screen
│   ├── profile.tsx        # Profile screen
│   └── +not-found.tsx     # 404 screen
├── assets/                # Static assets (images, fonts)
├── components/            # Reusable React components
│   ├── tabs/             # Tab-specific components
│   └── ui/               # UI utility components
├── constants/             # App constants and themes
├── firebase/              # Firebase configuration and services
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── scripts/               # Utility scripts
```

## Environment Setup

Copy `.env.example` to `.env` and fill in your Firebase configuration:

```bash
cp .env.example .env
```

Required environment variables:
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`

## Firebase Setup

See the root directory documentation files for Firebase setup:
- `FIREBASE_SETUP.md`
- `DATABASE_INIT_GUIDE.md`
- `FIRESTORE_SECURITY_RULES.md`

## 🏗️ Architecture

### Standalone Firebase Integration

The app now uses a **standalone Firebase integration** instead of depending on the monorepo `@questedu/questdata` package. This provides:

- ✅ **Zero External Dependencies**: No monorepo package dependencies
- ✅ **Better Performance**: Optimized for mobile-first usage
- ✅ **Type Safety**: Full TypeScript integration with custom types
- ✅ **Real-time Features**: Live data synchronization
- ✅ **Corporate Network Support**: SSL bypass for enterprise environments

### Key Services

```
lib/
├── firebase-config.ts          # Firebase initialization & config
├── firebase-course-service.ts  # Course CRUD operations  
├── firebase-init.ts            # Setup helpers & diagnostics
├── course-service.ts           # Public API (backward compatible)
└── questdata-config.ts         # Legacy compatibility layer

types/
└── course.ts                   # Complete TypeScript definitions
```

### Data Flow

```
React Components
    ↓
Course Service API (lib/course-service.ts)
    ↓  
Firebase Course Service (lib/firebase-course-service.ts)
    ↓
Firebase Firestore
```

## 📱 Features Deep Dive

### Course Management
```typescript
import { getCourses, addCourse, updateCourse, deleteCourse } from './lib/course-service';

// Get all courses
const courses = await getCourses();

// Add new course
const courseId = await addCourse({
  title: 'React Native Mastery',
  instructor: 'John Doe',
  category: 'Development',
  progress: 0
});

// Update course progress
await updateCourse(courseId, { progress: 50 });
```

### Real-time Subscriptions
```typescript
import { subscribeToCoursesChanges } from './lib/course-service';

// Subscribe to live updates
const unsubscribe = subscribeToCoursesChanges((courses) => {
  console.log('Courses updated:', courses.length);
  // Update UI automatically
});

// Cleanup when component unmounts
unsubscribe();
```

### Advanced Search
```typescript
import { searchCourses } from './lib/course-service';

// Search with multiple criteria
const results = await searchCourses({
  query: 'React Native',
  category: 'Development', 
  level: 'Intermediate',
  featured: true,
  minProgress: 0,
  maxProgress: 50
});
```

## 🛠️ Development Features

### Firebase Diagnostics
```typescript
import { runFirebaseDiagnosticsComprehensive } from './lib/diagnostics';

// Run comprehensive Firebase tests
const results = await runFirebaseDiagnosticsComprehensive();
console.log('Health check:', results);
```

### Database Seeding
```typescript
import { initializeDatabase } from './lib/diagnostics';

// Seed with sample courses for development
await initializeDatabase();
```

### Connection Testing
```typescript
import { checkFirebaseConnection } from './lib/firebase-init';

// Test Firebase connectivity
const isConnected = await checkFirebaseConnection();
console.log('Firebase status:', isConnected);
```
