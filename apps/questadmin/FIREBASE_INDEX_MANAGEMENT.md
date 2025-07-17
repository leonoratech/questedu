# QuestEdu Firebase Index Management

## Overview

This document covers the Firebase Firestore index management for both QuestAdmin and QuestEdu apps, with specific focus on the college-specific course filtering feature implemented in the React Native app.

## Index Configuration

All Firestore indexes are managed centrally from the `questadmin` app in the `firestore.indexes.json` file. This ensures consistency across both applications and simplifies maintenance.

## Required Indexes for QuestEdu College Filtering

### Single Field Association Indexes
- `courses/association.collegeId + createdAt` - College-specific course filtering
- `courses/association.programId + createdAt` - Program-specific course filtering  
- `courses/association.yearOrSemester + createdAt` - Year/semester filtering
- `courses/association.subjectId + createdAt` - Subject-specific filtering

### Basic Course Property Indexes
- `courses/category + createdAt` - Category filtering
- `courses/featured + createdAt` - Featured courses
- `courses/level + createdAt` - Difficulty level filtering

### Composite Association Indexes
- `courses/association.collegeId + association.programId + createdAt`
- `courses/association.collegeId + association.yearOrSemester + createdAt`
- `courses/association.collegeId + association.subjectId + createdAt`
- `courses/association.programId + association.subjectId + createdAt`
- `courses/association.programId + association.yearOrSemester + association.subjectId + createdAt`

### Complex Combination Indexes
- `courses/association.collegeId + association.programId + association.yearOrSemester + createdAt`
- `courses/association.collegeId + association.programId + association.subjectId + createdAt`
- `courses/association.collegeId + association.programId + association.yearOrSemester + association.subjectId + createdAt`

## Deployment

### Prerequisites
1. Firebase CLI installed (`npm install -g firebase-tools`)
2. Authenticated with Firebase (`firebase login`)
3. Project set to `questedu-cb2a4`

### Deploy Indexes
```bash
cd apps/questadmin
./scripts/deploy-course-association-indexes.sh
```

### Verify Configuration
```bash
cd apps/questadmin
./scripts/verify-course-indexes.sh
```

## Query Patterns Supported

### College-Specific Filtering
```typescript
// Get all courses for a student's college
query(coursesRef,
  where('association.collegeId', '==', userProfile.collegeId),
  orderBy('createdAt', 'desc')
)
```

### Program and Year Filtering
```typescript
// Get courses for specific program and year
query(coursesRef,
  where('association.collegeId', '==', collegeId),
  where('association.programId', '==', programId),
  where('association.yearOrSemester', '==', year),
  orderBy('createdAt', 'desc')
)
```

### Subject-Specific Filtering
```typescript
// Get courses for a specific subject
query(coursesRef,
  where('association.subjectId', '==', subjectId),
  orderBy('createdAt', 'desc')
)
```

### Combined Filtering
```typescript
// Complex filtering with multiple association criteria
query(coursesRef,
  where('association.collegeId', '==', collegeId),
  where('association.programId', '==', programId),
  where('association.yearOrSemester', '==', year),
  where('association.subjectId', '==', subjectId),
  orderBy('createdAt', 'desc')
)
```

## Performance Considerations

1. **Index Efficiency**: All indexes include `createdAt DESC` for efficient pagination
2. **Query Optimization**: Composite indexes support multiple filter combinations
3. **Scalability**: Indexes are designed to handle large course datasets efficiently
4. **Cost Management**: Indexes are optimized to minimize read operations

## Maintenance

### Adding New Indexes
1. Update `firestore.indexes.json` with new index definitions
2. Run the deployment script to apply changes
3. Update documentation with new query patterns
4. Test queries in both QuestAdmin and QuestEdu apps

### Monitoring Performance
1. Use Firebase Console to monitor index usage
2. Analyze query performance metrics
3. Optimize indexes based on actual usage patterns
4. Remove unused indexes to reduce costs

## Troubleshooting

### Common Issues
1. **Missing Index Error**: Deploy indexes using the deployment script
2. **Query Timeout**: Check if appropriate composite indexes exist
3. **Index Building**: Allow time for indexes to build after deployment
4. **Validation Errors**: Use verification script to check configuration

### Debug Steps
1. Verify Firebase project is set correctly (`firebase use questedu-cb2a4`)
2. Check firestore.indexes.json for syntax errors
3. Run dry-run deployment to validate configuration
4. Monitor Firebase Console for index build status

## Files

- `firestore.indexes.json` - Main index configuration file
- `scripts/deploy-course-association-indexes.sh` - Deployment script
- `scripts/verify-course-indexes.sh` - Verification script
- `FIREBASE_CONFIG_CONSOLIDATION.md` - Detailed change documentation

## Related Features

- **QuestEdu College Filtering**: React Native app course filtering by college association
- **QuestAdmin Course Management**: Admin interface for course creation and management
- **Course Association Feature**: Linking courses to academic programs and subjects

## Future Enhancements

1. **Dynamic Index Management**: Automated index creation based on query patterns
2. **Performance Monitoring**: Real-time index usage analytics
3. **Query Optimization**: Intelligent query plan optimization
4. **Index Cleanup**: Automated removal of unused indexes
