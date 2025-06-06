# QuestData Package

A shared data access layer for QuestEdu applications implementing the repository pattern to decouple Firebase operations.

## Features

- **Repository Pattern**: Abstract data access layer that can work with multiple data sources
- **Firebase Implementation**: Ready-to-use Firebase Firestore implementation
- **Type Safety**: Full TypeScript support with shared domain models
- **Environment Agnostic**: Works with both React Native (Expo) and Next.js applications
- **Extensible**: Easy to add new data sources (REST API, GraphQL, etc.)

## Installation

```bash
pnpm add @questedu/questdata
```

## Usage

### Basic Setup

```typescript
import { FirebaseConfig, createFirebaseRepositories } from '@questedu/questdata';

// Configure Firebase
const config: FirebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY!,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.FIREBASE_PROJECT_ID!,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.FIREBASE_APP_ID!
};

// Create repositories
const repositories = createFirebaseRepositories(config);

// Use the course repository
const courses = await repositories.courseRepository.getAll();
```

### With Custom Environment Support

```typescript
import { createFirebaseRepositories, EnvironmentConfig } from '@questedu/questdata';

const envConfig: EnvironmentConfig = {
  disableSSL: process.env.NODE_ENV === 'development',
  useEmulator: process.env.USE_EMULATOR === 'true'
};

const repositories = createFirebaseRepositories(firebaseConfig, envConfig);
```

## Repository Pattern

The package implements the repository pattern to abstract data access:

- `ICourseRepository` - Interface for course operations
- `FirebaseCourseRepository` - Firebase implementation
- Easy to extend with other implementations (REST, GraphQL, etc.)

## Architecture

```
src/
├── domain/           # Domain models and interfaces
├── repositories/     # Repository interfaces
├── firebase/         # Firebase-specific implementations
├── config/          # Configuration management
└── index.ts         # Public API exports
```
