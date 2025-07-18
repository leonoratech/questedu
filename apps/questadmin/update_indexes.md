# Firestore Indexes Update Guide

## Current Status
- **Project**: leonora-c9f8b
- **Rules**: ✅ Deployed successfully
- **Indexes**: ⚠️ Local file outdated but production indexes working

## Production Indexes Found
The following indexes exist in production but not in local file:
- instructorActivities: (instructorId,ASCENDING) (createdAt,DESCENDING)
- collegeAdministrators: (collegeId,ASCENDING) (isActive,ASCENDING)
- batches: (ownerId,ASCENDING) (isActive,ASCENDING)
- users: (collegeId,ASCENDING) (isActive,ASCENDING)
- courses: (instructorId,ASCENDING) (createdAt,DESCENDING)
- subjects: (programId,ASCENDING) (name,ASCENDING)
- enrollments: (userId,ASCENDING) (courseId,ASCENDING)
- And 42 more indexes...

## Recommendations
1. **Keep current production indexes** - They're working fine
2. **Update local file** - Run queries through Firebase Console to get actual indexes
3. **Document changes** - Keep track of any new indexes you add

## Next Deploy Command
```bash
firebase deploy --only firestore:rules
```
(Skip indexes until local file is updated)
