# Firebase Data Schema & Collections Setup Guide

This guide provides comprehensive documentation for the Firebase data schema, collection setup, and validation system for the QuestEdu Admin application.

## Overview

The QuestEdu Admin application uses Firebase Firestore as its primary database. This system provides:

- **Type-safe data models** using TypeScript interfaces
- **Automated collection setup** with sample data
- **Data validation utilities** for runtime type checking
- **Schema validation scripts** for existing data
- **Firebase configuration management**

## 📁 File Structure

```
apps/questadmin/
├── lib/
│   ├── data-models.ts          # Complete TypeScript data models
│   └── data-validation.ts      # Runtime validation utilities
├── scripts/
│   ├── setup-firebase-collections.ts  # Collection setup script
│   ├── setup-collections.sh           # Shell wrapper script
│   ├── validate-data-schema.ts        # Data validation script
│   └── deploy-firebase.sh             # Firebase deployment script
├── firestore.indexes.json     # Firestore composite indexes
├── firestore.rules           # Firestore security rules
└── firebase.json             # Firebase project configuration
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd apps/questadmin
npm install
```

### 2. Setup Firebase Collections

```bash
# Setup all collections with sample data
npm run setup:firebase

# Or setup individual collections
npm run setup:users      # Users collection only
npm run setup:courses    # Courses collection only  
npm run setup:topics     # Course topics collection only
npm run setup:settings   # System settings collection only
```

### 3. Deploy Firebase Configuration

```bash
# Deploy Firestore indexes and rules
npm run deploy:firebase
```

### 4. Validate Data Schema

```bash
# Validate existing data against TypeScript schemas
npm run validate:data
```

## 📊 Data Models

### Core Collections

#### Users Collection (`users`)
```typescript
interface User {
  id?: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  isActive: boolean
  preferences: UserPreferences
  // ... additional fields
}
```

#### Courses Collection (`courses`)
```typescript
interface Course {
  id?: string
  title: string
  description: string
  instructor: string
  instructorId: string
  category: string
  level: CourseLevel
  price: number
  status: CourseStatus
  // ... additional fields
}
```

#### Course Topics Collection (`course_topics`)
```typescript
interface CourseTopic {
  id?: string
  courseId: string
  title: string
  order: number
  duration?: number
  materials: TopicMaterial[]
  isPublished: boolean
  // ... additional fields
}
```

### Supporting Collections

- **`course_enrollments`** - Student course enrollments and progress
- **`quizzes`** - Course quizzes and assessments
- **`assignments`** - Course assignments and projects  
- **`notifications`** - User notifications
- **`payments`** - Payment transactions
- **`course_analytics`** - Course performance metrics
- **`system_settings`** - Application configuration

### Enums and Types

```typescript
enum UserRole {
  ADMIN = 'admin',
  INSTRUCTOR = 'instructor', 
  STUDENT = 'student'
}

enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

enum CourseLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced'
}
```

## 🔧 Collection Setup

### Automated Setup Script

The `setup-firebase-collections.ts` script creates collections with sample data:

```bash
# Full setup
npm run setup:firebase

# Individual collections
npm run setup:users
npm run setup:courses
npm run setup:topics
npm run setup:settings
```

### Sample Data Generated

- **3 Users**: Admin, Instructor, and Student with different roles
- **2 Courses**: React and Python courses with complete metadata
- **2 Course Topics**: Sample lessons with materials and objectives
- **4 System Settings**: Platform configuration options

### Manual Collection Creation

If you need to create collections manually:

```typescript
import { COLLECTIONS } from './scripts/setup-firebase-collections'
import { db } from './lib/firebase'
import { collection, addDoc } from 'firebase/firestore'

// Add a new user
const userData = {
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: UserRole.STUDENT,
  // ... other fields
}

await addDoc(collection(db, COLLECTIONS.USERS), userData)
```

## ✅ Data Validation

### Runtime Validation

Use validation utilities in your API routes:

```typescript
import { ValidationFactory } from '../lib/data-validation'

// Validate user data
const validationResult = ValidationFactory.validateData('user', userData)
if (!validationResult.isValid) {
  throw new Error(`Validation failed: ${validationResult.errors}`)
}

// Validate and throw if invalid
ValidationUtils.validateOrThrow('course', courseData)
```

### Schema Validation Script

Validate existing Firestore data:

```bash
npm run validate:data
```

This script:
- ✅ Validates all documents against TypeScript schemas  
- 📊 Generates validation reports
- 💡 Provides fix suggestions
- 📄 Saves detailed reports to `validation-report.md`

### Available Validators

- **UserValidator** - Validates user data and preferences
- **CourseValidator** - Validates course metadata and content
- **CourseTopicValidator** - Validates topic structure and materials
- **QuizValidator** - Validates quiz questions and settings
- **AssignmentValidator** - Validates assignment requirements

### Custom Validation

Create custom validators by extending `BaseValidator`:

```typescript
class CustomValidator extends BaseValidator<MyDataType> {
  validate(data: MyDataType): ValidationResult {
    const errors: ValidationError[] = []
    
    try {
      this.isRequired(data.field, 'field')
      this.isEmail(data.email, 'email')
      // ... additional validations
    } catch (error) {
      if (error instanceof ValidationError) {
        errors.push(error)
      }
    }
    
    return { isValid: errors.length === 0, errors }
  }
}
```

## 🔒 Security Rules

### Firestore Rules (`firestore.rules`)

Basic security rules are provided:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Course topics require authentication
    match /course_topics/{document} {
      allow read, write: if request.auth != null;
    }
    
    // ... additional rules
  }
}
```

### Deploy Security Rules

```bash
npm run deploy:firebase
# or
firebase deploy --only firestore:rules
```

## 📈 Indexes

### Required Composite Indexes

Defined in `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "course_topics",
      "queryScope": "COLLECTION", 
      "fields": [
        {"fieldPath": "courseId", "order": "ASCENDING"},
        {"fieldPath": "order", "order": "ASCENDING"}
      ]
    }
  ]
}
```

### Deploy Indexes

```bash
npm run deploy:firebase
# or  
firebase deploy --only firestore:indexes
```

### Index Requirements

- **course_topics**: `courseId` + `order` (for ordered topic queries)
- **course_enrollments**: `userId` + `status` (for user enrollment queries)
- **notifications**: `userId` + `createdAt` (for user notification history)

## 🛠️ Development Workflow

### 1. Adding New Data Models

1. **Define interfaces** in `lib/data-models.ts`
2. **Create validator** in `lib/data-validation.ts`  
3. **Update collection setup** in `scripts/setup-firebase-collections.ts`
4. **Add sample data** to the generator functions
5. **Test validation** with `npm run validate:data`

### 2. Modifying Existing Models

1. **Update interface** in `data-models.ts`
2. **Update validator** rules if needed
3. **Update sample data** generation
4. **Run validation** to check existing data
5. **Plan data migration** if breaking changes

### 3. API Integration

```typescript
// In your API routes
import { ValidationUtils } from '../../../lib/data-validation'
import { CreateCourseData } from '../../../lib/data-models'

export async function POST(request: Request) {
  const courseData: CreateCourseData = await request.json()
  
  // Validate data
  ValidationUtils.validateOrThrow('course', courseData)
  
  // Save to Firestore
  const docRef = await addDoc(collection(db, 'courses'), courseData)
  
  return Response.json({ success: true, id: docRef.id })
}
```

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run setup:firebase` | Setup all collections with sample data |
| `npm run setup:users` | Setup users collection only |
| `npm run setup:courses` | Setup courses collection only |
| `npm run setup:topics` | Setup course topics collection only |
| `npm run setup:settings` | Setup system settings collection only |
| `npm run deploy:firebase` | Deploy Firestore indexes and rules |
| `npm run validate:data` | Validate existing data against schemas |
| `npm run type-check` | TypeScript type checking |

## 🔍 Troubleshooting

### Common Issues

**1. Index Errors**
```
Error: The query requires an index
```
- **Solution**: Deploy Firestore indexes with `npm run deploy:firebase`

**2. Validation Failures**  
```
Validation failed: Field 'email' is required
```
- **Solution**: Check data completeness and run validation script

**3. Permission Denied**
```
FirebaseError: Missing or insufficient permissions
```
- **Solution**: Deploy security rules and check authentication

### Debug Mode

Enable debug logging in validation scripts:

```typescript
// Add to validation script
console.log('Debug: Validating document', doc.id, data)
```

### Firebase Console

Monitor collections and data in the [Firebase Console](https://console.firebase.google.com/):

1. **Firestore Database** - View collections and documents
2. **Indexes** - Monitor index creation status  
3. **Rules** - Test and debug security rules
4. **Usage** - Monitor read/write operations

## 📚 Additional Resources

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Firestore Indexes](https://firebase.google.com/docs/firestore/query-data/indexing)

## 🤝 Contributing

When contributing to the data schema:

1. **Follow TypeScript conventions**
2. **Add comprehensive validation rules**
3. **Update sample data generators**
4. **Test validation scripts** 
5. **Update documentation**
6. **Consider data migration** for breaking changes

---

## 📞 Support

For questions about the data schema system:

1. Check the validation report for data issues
2. Review Firebase Console for errors
3. Run type checking with `npm run type-check`
4. Test with sample data using setup scripts
