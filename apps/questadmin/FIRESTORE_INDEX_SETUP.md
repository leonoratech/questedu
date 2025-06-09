# Firestore Index Setup Guide

## Issue Resolution: Course Topics Query Index Error

### Problem
When fetching course topics, Firestore was throwing an error: "the query requires an index" because we were using a compound query with both `where` and `orderBy` clauses on different fields:

```typescript
const q = query(
  topicsRef,
  where('courseId', '==', courseId),
  orderBy('order', 'asc')
)
```

### Quick Fix Applied
Modified the API route (`/api/courses/[id]/topics/route.ts`) to:
1. Remove the `orderBy` clause from the Firestore query
2. Sort the results in memory after fetching

```typescript
// Fetch without orderBy
const q = query(
  topicsRef,
  where('courseId', '==', courseId)
)

// Sort in memory
topics.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
```

### Production Index Setup

For optimal performance in production, you should create the proper Firestore index. 

#### Option 1: Using Firebase CLI (Recommended)

1. **Install Firebase CLI** (if not already installed):
```bash
npm install -g firebase-tools
```

2. **Login to Firebase**:
```bash
firebase login
```

3. **Initialize Firebase in the project** (run from `/apps/questadmin/`):
```bash
firebase init firestore
```

4. **Deploy the indexes**:
```bash
firebase deploy --only firestore:indexes
```

#### Option 2: Manual Setup via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`questedu-cb2a4`)
3. Navigate to **Firestore Database** > **Indexes**
4. Click **Create Index**
5. Configure the index:
   - **Collection ID**: `course_topics`
   - **Fields**:
     - `courseId` (Ascending)
     - `order` (Ascending)
   - **Query scope**: Collection

#### Option 3: Automatic Index Creation

When you run the compound query in development, Firestore will provide a direct link to create the required index. Look for the error message containing a URL like:
```
https://console.firebase.google.com/project/questedu-cb2a4/firestore/indexes?create_composite=...
```

### Files Created

1. **`firestore.indexes.json`** - Defines the required indexes
2. **`firebase.json`** - Firebase project configuration
3. **`firestore.rules`** - Basic security rules for the collection

### Performance Benefits

Once the index is created, you can revert the API route to use the original optimized query:

```typescript
const q = query(
  topicsRef,
  where('courseId', '==', courseId),
  orderBy('order', 'asc')
)
```

This will provide better performance as sorting is done at the database level rather than in memory.

### Security Rules

The created `firestore.rules` file includes basic security rules. Review and modify as needed for your specific requirements:

```javascript
// Allow authenticated users to read and write course topics
match /course_topics/{document} {
  allow read, write: if request.auth != null;
}
```

### Testing

The current implementation works for development and testing. To verify:

1. Navigate to a course edit page
2. Click on the "Topics" tab
3. The course topics should load without the index error

### Next Steps

1. Set up the Firestore index using one of the methods above
2. Test the index in production
3. Optionally revert to the optimized query once the index is active
4. Review and enhance Firestore security rules as needed
