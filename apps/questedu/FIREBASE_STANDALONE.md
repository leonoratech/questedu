# QuestEdu React Native App - Standalone Firebase Integration

This document describes the standalone Firebase integration for the QuestEdu React Native app, replacing the dependency on the `@questedu/questdata` monorepo package.

## 🔧 Architecture Changes

The app has been updated to use standalone Firebase services instead of the monorepo dependency:

### Before (Monorepo Dependency)
```
@questedu/questdata → Firebase
```

### After (Standalone)
```
Local Firebase Services → Firebase
```

## 📁 New File Structure

```
lib/
├── firebase-config.ts          # Firebase configuration and initialization
├── firebase-course-service.ts  # Course CRUD operations and subscriptions
├── firebase-init.ts            # Firebase initialization helpers
├── course-service.ts           # Updated to use local Firebase service
└── questdata-config.ts         # Backward compatibility layer

types/
└── course.ts                   # Course data types and interfaces
```

## 🔥 Firebase Services

### 1. Firebase Configuration (`firebase-config.ts`)

Handles Firebase app initialization and configuration:
- Environment-based configuration
- Emulator support for development
- SSL configuration for corporate environments
- Comprehensive diagnostics

### 2. Course Service (`firebase-course-service.ts`)

Provides complete course management functionality:
- **CRUD Operations**: Create, Read, Update, Delete courses
- **Search & Filtering**: Text search, category filtering, advanced queries
- **Real-time Subscriptions**: Live updates for course data
- **Batch Operations**: Efficient bulk updates
- **Featured Courses**: Get promoted/featured courses
- **Categories**: Dynamic category management

### 3. Course Types (`types/course.ts`)

Comprehensive TypeScript interfaces:
- `Course` - Main course interface
- `CourseSearchCriteria` - Search parameters
- `CreateCourseData` - Course creation data
- `UpdateCourseData` - Course update data
- `OperationResult<T>` - Generic operation results
- `QueryResult<T>` - Paginated query results
- Utility functions and enums

## 🚀 Key Features

### Real-time Synchronization
```typescript
import { subscribeToCoursesChanges } from './lib/course-service';

// Subscribe to all course changes
const unsubscribe = subscribeToCoursesChanges((courses) => {
  console.log('Courses updated:', courses.length);
});

// Cleanup
unsubscribe();
```

### Advanced Search
```typescript
import { searchCourses } from './lib/course-service';

// Search with multiple criteria
const courses = await searchCourses({
  query: 'React Native',
  category: 'Development',
  level: CourseLevel.INTERMEDIATE,
  featured: true,
  minProgress: 0,
  maxProgress: 50
});
```

### Course Management
```typescript
import { addCourse, updateCourse, deleteCourse } from './lib/course-service';

// Add new course
const courseId = await addCourse({
  title: 'New Course',
  instructor: 'John Doe',
  category: 'Development',
  progress: 0,
  description: 'Learn amazing things'
});

// Update course
await updateCourse(courseId, {
  progress: 50,
  description: 'Updated description'
});

// Delete course
await deleteCourse(courseId);
```

## 🔧 Environment Configuration

### Environment Variables
```env
# Required Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id

# Optional Configuration
EXPO_PUBLIC_DISABLE_SSL=true  # For corporate environments
EXPO_PUBLIC_USE_EMULATOR=true  # For development
EXPO_PUBLIC_EMULATOR_HOST=localhost
EXPO_PUBLIC_EMULATOR_PORT=8080
```

### Firebase Project Setup

1. **Create/Configure Firebase Project**
   - Enable Firestore Database
   - Configure authentication (if needed)
   - Set up security rules

2. **Firestore Security Rules (Development)**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /courses/{document} {
         allow read, write: if true; // Update for production
       }
     }
   }
   ```

3. **Production Security Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /courses/{document} {
         allow read: if true;
         allow write: if request.auth != null; // Requires authentication
       }
     }
   }
   ```

## 🧪 Testing & Diagnostics

### Firebase Connection Test
```typescript
import { initializeFirebaseServices, checkFirebaseConnection } from './lib/firebase-init';

// Initialize and test Firebase
await initializeFirebaseServices();

// Check connection status
const isConnected = await checkFirebaseConnection();
console.log('Firebase connected:', isConnected);
```

### Diagnostics
```typescript
import { runFirebaseDiagnosticsComprehensive } from './lib/diagnostics';

// Run comprehensive diagnostics
const results = await runFirebaseDiagnosticsComprehensive();
console.log('Diagnostic results:', results);
```

### Database Initialization
```typescript
import { initializeDatabase } from './lib/diagnostics';

// Seed database with sample courses
await initializeDatabase();
```

## 🔄 Migration Guide

### From Monorepo Dependency

The migration is already complete! The following changes were made:

1. **Removed Dependency**: `@questedu/questdata` package dependency removed
2. **Local Services**: Created standalone Firebase services
3. **Type Definitions**: Moved to local `types/course.ts`
4. **Backward Compatibility**: Maintained same API interface
5. **Enhanced Features**: Added new capabilities like batch operations

### API Compatibility

All existing code should continue to work without changes:
```typescript
// This still works exactly the same
import { getCourses, getCourseById, searchCourses } from './lib/course-service';
import { Course } from './lib/course-service'; // Now from local types
```

## 📱 React Native Specific Features

### Expo Integration
- Uses `EXPO_PUBLIC_*` environment variables
- Compatible with Expo managed workflow
- Supports web, iOS, and Android platforms

### Performance Optimizations
- Client-side caching for search results
- Efficient real-time subscriptions
- Optimized batch operations
- Minimal bundle size impact

### Offline Support (Future)
The architecture supports offline capabilities:
- Local caching with AsyncStorage
- Offline-first data synchronization
- Background sync when connection restored

## 🛠️ Development Workflow

### 1. Setup
```bash
# Install dependencies (Firebase already included)
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your Firebase credentials
```

### 2. Development
```bash
# Start development server
pnpm dev

# Run with specific platform
pnpm android  # Android
pnpm ios      # iOS
pnpm web      # Web
```

### 3. Testing
```typescript
// Test Firebase connection
import { checkFirebaseConnection } from './lib/firebase-init';
await checkFirebaseConnection();

// Test course operations
import { getCourses } from './lib/course-service';
const courses = await getCourses();
```

## 🚨 Troubleshooting

### Common Issues

1. **Firebase Connection Failed**
   - Check environment variables
   - Verify Firebase project configuration
   - Check network connectivity
   - For corporate networks: Set `EXPO_PUBLIC_DISABLE_SSL=true`

2. **Permission Denied**
   - Update Firestore security rules
   - Check authentication status
   - Verify project permissions

3. **Type Errors**
   - Run `pnpm install` to ensure TypeScript types are available
   - Check import paths for local types

### Debug Mode

Enable debug logging:
```typescript
// Firebase service automatically enables debug logging in __DEV__ mode
console.log('Debug mode:', __DEV__);
```

### Diagnostics

Use built-in diagnostics:
```typescript
import { runFirebaseDiagnostics } from './lib/firebase-config';
await runFirebaseDiagnostics();
```

## 🔮 Future Enhancements

1. **Authentication Integration**
   - User authentication with Firebase Auth
   - Role-based access control
   - Social login providers

2. **Offline Support**
   - Local data caching
   - Offline-first architecture
   - Background synchronization

3. **Advanced Features**
   - Full-text search with Algolia
   - Image upload and management
   - Push notifications
   - Analytics integration

4. **Performance**
   - Query optimization
   - Pagination improvements
   - Caching strategies

## 📞 Support

For issues related to the Firebase integration:

1. Check the troubleshooting section above
2. Run diagnostics to identify the problem
3. Check Firebase Console for project status
4. Verify environment configuration
5. Review Firestore security rules

The standalone Firebase integration provides a robust, scalable foundation for the QuestEdu React Native app while maintaining compatibility with existing code.
