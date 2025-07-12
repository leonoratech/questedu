# Firebase Indexes Deployment Instructions

## Missing Index Issue Fixed

I've added the missing Firestore indexes for the subjects collection to resolve the error:
```
GET (app/api/colleges/[id]/programs/[programId]/subjects/route.ts:45:39)
26 | subjectsQuery = subjectsQuery.orderBy('name', 'asc');
```

## Added Indexes

The following indexes have been added to `firestore.indexes.json`:

### 1. Program Subjects Query (programId + name)
```json
{
  "collectionGroup": "subjects",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "programId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "name",
      "order": "ASCENDING"
    }
  ]
}
```

### 2. Program Subjects with Active Filter (programId + isActive + name)
```json
{
  "collectionGroup": "subjects",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "programId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "isActive",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "name",
      "order": "ASCENDING"
    }
  ]
}
```

### 3. College Subjects Query (collegeId + name)
```json
{
  "collectionGroup": "subjects",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "collegeId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "name",
      "order": "ASCENDING"
    }
  ]
}
```

### 4. College Subjects with Active Filter (collegeId + isActive + name)
```json
{
  "collectionGroup": "subjects",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "collegeId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "isActive",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "name",
      "order": "ASCENDING"
    }
  ]
}
```

### 5. Search Subjects Query (isActive + name)
```json
{
  "collectionGroup": "subjects",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "isActive",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "name",
      "order": "ASCENDING"
    }
  ]
}
```

## How to Deploy

### Option 1: Using Firebase CLI (Recommended)

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Set the Project**:
   ```bash
   firebase use questedu-cb2a4
   ```

4. **Deploy the Indexes**:
   ```bash
   firebase deploy --only firestore:indexes
   ```

### Option 2: Using the Deploy Script

Run the provided deployment script:
```bash
cd /home/solmon/github/questedu/apps/questadmin
bash scripts/deploy-firebase.sh
```
Choose option 1 (Deploy Firestore indexes only).

### Option 3: Manual Deployment via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `questedu-cb2a4`
3. Go to Firestore Database
4. Click on "Indexes" tab
5. Copy the index definitions from `firestore.indexes.json` and create them manually

## Verification

After deployment, the indexes will be built in the background. You can check the status in the Firebase Console under Firestore > Indexes. The error should be resolved once the indexes are built.

## Queries Supported

These indexes will support the following queries in the SubjectRepository:

1. **getProgramSubjects(programId)**:
   - `where('programId', '==', programId).orderBy('name', 'asc')`

2. **getProgramSubjects(programId, isActive)**:
   - `where('programId', '==', programId).where('isActive', '==', isActive).orderBy('name', 'asc')`

3. **getCollegeSubjects(collegeId)**:
   - `where('collegeId', '==', collegeId).orderBy('name', 'asc')`

4. **getCollegeSubjects(collegeId, isActive)**:
   - `where('collegeId', '==', collegeId).where('isActive', '==', isActive).orderBy('name', 'asc')`

5. **searchSubjects()**:
   - `where('isActive', '==', true).orderBy('name', 'asc')`

## Index Build Time

Firestore indexes are built asynchronously and may take several minutes to hours depending on the amount of data in the subjects collection. During this time, queries may still fail, but they will work once the indexes are fully built.
