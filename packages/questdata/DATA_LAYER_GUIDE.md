# QuestEdu Data Layer - Setup and Usage Guide

This document provides a comprehensive guide for using the QuestEdu data layer, including repository setup, seeding, and integration.

## Overview

The QuestEdu data layer implements the Repository pattern to provide a clean abstraction over Firebase Firestore operations. It includes:

- **Repository Interfaces**: Abstract contracts for data operations
- **Firebase Implementations**: Concrete implementations using Firestore
- **Domain Models**: TypeScript interfaces for all entities
- **Seed Data Generation**: Anonymous test data for development
- **Factory Pattern**: Centralized repository creation and management

## Quick Start

### 1. Installation

```bash
# Install the package
pnpm install @questedu/questdata

# Install peer dependencies
pnpm install firebase
```

### 2. Configuration

```typescript
import { createFirebaseRepositories, type FirebaseConfig } from '@questedu/questdata';

const firebaseConfig: FirebaseConfig = {
  projectId: 'your-project-id',
  apiKey: 'your-api-key',
  authDomain: 'your-project.firebaseapp.com',
  storageBucket: 'your-project.appspot.com',
  messagingSenderId: 'your-sender-id',
  appId: 'your-app-id'
};

// Create repository factory
const repositories = createFirebaseRepositories(firebaseConfig);
```

### 3. Basic Usage

```typescript
// User operations
const users = await repositories.userRepository.getAll();
const user = await repositories.userRepository.getById('user-id');

// Course operations
const courses = await repositories.courseRepository.getAll();
const courseResult = await repositories.courseRepository.create({
  title: 'New Course',
  description: 'Course description',
  // ... other course data
});

// Real-time subscriptions
const unsubscribe = repositories.userRepository.subscribeToChanges((users) => {
  console.log('Users updated:', users);
});
```

## Repository Architecture

### Available Repositories

#### ✅ Fully Implemented
- **CourseRepository**: Complete CRUD operations for courses
- **UserRepository**: Complete CRUD operations for users with search and filtering

#### 🚧 Stub Implementations (Ready for Development)
- **CourseOwnershipRepository**: Course ownership management
- **CourseSubscriptionRepository**: Student course subscriptions
- **CourseTopicRepository**: Course topics and lessons
- **QuestionRepository**: Question management with types and difficulty
- **QuestionBankRepository**: Question bank collections
- **QuizRepository**: Quiz creation and management
- **QuizAttemptRepository**: Student quiz attempts and scoring
- **EssayAnswerRepository**: Essay question responses and grading
- **UserStatsRepository**: User learning statistics and progress

### Repository Interface Pattern

All repositories follow a consistent pattern:

```typescript
interface IRepository<T> {
  // Basic CRUD
  getAll(options?: QueryOptions): Promise<QueryResult<T>>;
  getById(id: string): Promise<T | null>;
  create(data: CreateData<T>): Promise<OperationResult<string>>;
  update(id: string, data: UpdateData<T>): Promise<OperationResult<void>>;
  delete(id: string): Promise<OperationResult<void>>;

  // Search and filtering
  search(criteria: SearchCriteria<T>): Promise<QueryResult<T>>;

  // Real-time subscriptions
  subscribeToChanges(callback: (items: T[]) => void): () => void;
}
```

## Domain Models

### Core Entities

```typescript
// User Management
interface User {
  id?: string;
  email: string;
  displayName: string;
  role: UserRole; // 'student' | 'course_owner' | 'admin'
  isActive: boolean;
  profileComplete: boolean;
  // ... additional fields
}

// Course Management
interface Course {
  id?: string;
  title: string;
  description: string;
  category: string;
  level: string;
  isPublished: boolean;
  // ... additional fields
}

// Learning Content
interface CourseTopic {
  id?: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  content: RichTextContent;
  // ... additional fields
}

interface Question {
  id?: string;
  courseId?: string;
  topicId?: string;
  questionBankId?: string;
  type: QuestionType; // 'multiple_choice' | 'true_false' | 'essay' | 'fill_blank'
  difficulty: DifficultyLevel; // 'easy' | 'medium' | 'hard'
  question: RichTextContent;
  // ... additional fields
}
```

## Seeding and Test Data

### Automatic Seed Data Generation

The data layer includes a comprehensive seed data generator that creates realistic anonymous test data:

```bash
# Generate and seed test data
pnpm run seed

# Clear existing data and reseed
pnpm run seed:clear
```

### Environment Setup for Seeding

Create a `.env` file with your Firebase configuration:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
```

### Generated Test Data

The seed generator creates:
- **5 Instructors**: Course creators with expertise in various fields
- **20 Students**: Learners with different progress levels
- **2 Admins**: Platform administrators
- **10 Courses**: Diverse courses across multiple categories
- **Course Topics**: Structured learning content for each course
- **Questions**: Multiple choice, true/false, and essay questions
- **Question Banks**: Organized question collections
- **User Statistics**: Learning progress and achievements
- **Relationships**: Course ownership, subscriptions, and progress tracking

### Custom Seed Data

```typescript
import { SeedDataGenerator } from '@questedu/questdata';

const generator = new SeedDataGenerator();

// Generate specific data types
const users = generator.generateUsers();
const courses = generator.generateCourses();
const topics = generator.generateCourseTopics();

// Generate complete dataset
const allData = generator.generateAllSeedData();
```

## Advanced Usage

### Search and Filtering

```typescript
// Search users
const searchResults = await repositories.userRepository.search({
  query: 'john',
  role: 'student',
  isActive: true,
  expertise: ['javascript', 'react']
}, {
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc'
});

// Search courses
const courseResults = await repositories.courseRepository.search({
  query: 'javascript',
  category: 'programming',
  level: 'beginner'
});
```

### Real-time Subscriptions

```typescript
// Subscribe to all users
const unsubscribeUsers = repositories.userRepository.subscribeToChanges((users) => {
  console.log('User list updated:', users.length);
});

// Subscribe to specific user
const unsubscribeUser = repositories.userRepository.subscribeToSingle('user-id', (user) => {
  if (user) {
    console.log('User updated:', user.displayName);
  }
});

// Cleanup subscriptions
unsubscribeUsers();
unsubscribeUser();
```

### Error Handling

```typescript
const result = await repositories.userRepository.create(userData);

if (result.success) {
  console.log('User created with ID:', result.data);
} else {
  console.error('Failed to create user:', result.error);
  console.error('Error code:', result.code);
}
```

## Diagnostics and Debugging

### Firebase Connection Testing

```typescript
import { runFirebaseDiagnostics, getFirebaseProjectInfo } from '@questedu/questdata';

// Run connection diagnostics
const diagnostics = await runFirebaseDiagnostics();
diagnostics.forEach(result => {
  console.log(`${result.test}: ${result.success ? '✅' : '❌'} ${result.message}`);
});

// Get project info
const projectInfo = getFirebaseProjectInfo();
console.log('Firebase project:', projectInfo);
```

### Debug Logging

Enable debug logging in your environment configuration:

```typescript
const repositories = createFirebaseRepositories(firebaseConfig, {
  enableDebugLogging: true
});
```

## Development Roadmap

### Current Status
- ✅ Repository interfaces defined
- ✅ Firebase app management and configuration
- ✅ Complete User repository implementation
- ✅ Complete Course repository implementation
- ✅ Comprehensive seed data generation
- ✅ Repository factory and dependency injection
- ✅ TypeScript types and domain models

### Next Steps
1. **Implement remaining repositories** (currently stubs)
2. **Add advanced query capabilities** (complex filters, joins)
3. **Implement caching layer** (Redis integration)
4. **Add data validation** (schema validation)
5. **Enhanced error handling** (retry logic, circuit breakers)
6. **Performance monitoring** (query analytics)
7. **Data migration tools** (schema updates)

## Contributing

When implementing new repositories:

1. **Follow the interface pattern** defined in `src/repositories/interfaces.ts`
2. **Use consistent error handling** with `OperationResult<T>` and `QueryResult<T>`
3. **Implement logging** using the Firebase app manager's logging configuration
4. **Add real-time subscriptions** where appropriate
5. **Include comprehensive error handling** with meaningful error codes
6. **Update the factory** to include the new repository
7. **Add seed data generation** for the new entity type

## Troubleshooting

### Common Issues

1. **Firebase not initialized**
   - Ensure Firebase configuration is correct
   - Check that all required environment variables are set

2. **Permission denied errors**
   - Verify Firestore security rules
   - Check user authentication status

3. **Seed data not appearing**
   - Confirm Firebase project ID is correct
   - Check Firestore console for data
   - Verify network connectivity

4. **Type errors**
   - Ensure all peer dependencies are installed
   - Check TypeScript version compatibility

### Getting Help

- Check the Firebase console for detailed error logs
- Use the diagnostic utilities to test connectivity
- Enable debug logging for detailed operation logs
- Review Firestore security rules for permission issues

## License

MIT License - see LICENSE file for details.
