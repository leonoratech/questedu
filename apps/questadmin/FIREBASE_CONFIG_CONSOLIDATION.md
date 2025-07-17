# Firebase Configuration Consolidation

## Overview

Consolidated Firebase configuration files from the questedu React Native app to the questadmin app to maintain a single source of truth for Firestore indexes and rules.

## Changes Made

### Files Removed from QuestEdu App
- `/apps/questedu/firebase.json` - Removed (managed centrally from questadmin)
- `/apps/questedu/firestore.indexes.json` - Removed (consolidated into questadmin)
- `/apps/questedu/firestore.rules` - Removed (managed centrally from questadmin)
- `/apps/questedu/scripts/deploy-indexes.sh` - Removed (deployment handled from questadmin)

### Files Updated in QuestAdmin App

#### `/apps/questadmin/firestore.indexes.json`
Added missing indexes required for the QuestEdu React Native app's college-specific course filtering:

**New Association Indexes:**
- `association.yearOrSemester` + `createdAt`
- `association.collegeId` + `association.programId` + `createdAt`
- `association.collegeId` + `association.yearOrSemester` + `createdAt`
- `association.collegeId` + `association.subjectId` + `createdAt`
- `association.programId` + `association.subjectId` + `createdAt`
- `association.programId` + `association.yearOrSemester` + `association.subjectId` + `createdAt`
- `association.collegeId` + `association.programId` + `association.yearOrSemester` + `createdAt`
- `association.collegeId` + `association.programId` + `association.subjectId` + `createdAt`
- `association.collegeId` + `association.programId` + `association.yearOrSemester` + `association.subjectId` + `createdAt`

**Basic Course Field Indexes:**
- `category` + `createdAt`
- `featured` + `createdAt`
- `level` + `createdAt`

#### `/apps/questadmin/scripts/deploy-course-association-indexes.sh`
Updated the deployment script to reflect all the new indexes and mention support for both QuestAdmin and QuestEdu apps.

## Index Support for Query Patterns

The added indexes support the following query patterns used in the QuestEdu React Native app:

### College-Specific Filtering
```typescript
// Get all courses for a specific college
query(coursesRef, 
  where('association.collegeId', '==', collegeId),
  orderBy('createdAt', 'desc')
)
```

### Program-Specific Filtering
```typescript
// Get courses for a specific program
query(coursesRef,
  where('association.programId', '==', programId),
  orderBy('createdAt', 'desc')
)
```

### Combined Association Filtering
```typescript
// Get courses with multiple association filters
query(coursesRef,
  where('association.collegeId', '==', collegeId),
  where('association.programId', '==', programId),
  where('association.yearOrSemester', '==', yearOrSemester),
  orderBy('createdAt', 'desc')
)
```

### Basic Course Filtering
```typescript
// Filter by course properties
query(coursesRef,
  where('category', '==', category),
  orderBy('createdAt', 'desc')
)

query(coursesRef,
  where('featured', '==', true),
  orderBy('createdAt', 'desc')
)
```

## Deployment

To deploy the updated indexes:

```bash
cd /home/solmon/github/questedu/apps/questadmin
./scripts/deploy-course-association-indexes.sh
```

## Benefits

1. **Single Source of Truth**: All Firebase configuration is now managed from the questadmin app
2. **Comprehensive Index Coverage**: All query patterns from both apps are now supported
3. **Simplified Maintenance**: Only one set of indexes to maintain and deploy
4. **Performance Optimization**: Efficient composite indexes for complex association queries
5. **Scalability**: Indexes support filtering combinations needed for large datasets

## Query Performance

The new indexes provide optimal performance for:
- College-based course discovery in the React Native app
- Program and subject-specific course filtering
- Combined association queries with multiple filters
- Basic course property filtering (category, featured status, difficulty level)

## Notes

- The Firebase project ID `questedu-cb2a4` is used for all deployments
- All indexes are scoped to `COLLECTION` level for optimal performance
- Indexes are ordered by `createdAt DESC` for efficient pagination
- The questadmin app now serves as the central management point for all Firebase configuration

## Future Considerations

When adding new query patterns:
1. Add the corresponding indexes to `/apps/questadmin/firestore.indexes.json`
2. Update the deployment script documentation
3. Deploy using the questadmin deployment script
4. Test the queries in both questadmin and questedu apps
