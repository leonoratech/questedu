# Course Association Feature Enhancement

## Overview

Enhanced the questadmin app to support course associations with academic programs, enabling courses to be linked to specific college programs, years/semesters, and subjects.

## Features Implemented

### 1. Data Model Updates

- **Course Model** (`/data/models/course.ts`)
  - Added `CourseAssociation` interface
  - Added optional `association` field to `Course` interface
  - Updated `CreateCourseRequest` and `UpdateCourseRequest` interfaces

- **AdminCourse Model** (`/data/services/admin-course-service.ts`)
  - Added `association` field to `AdminCourse` interface

### 2. Validation Schemas

- **Validation Schemas** (`/data/validation/validation-schemas.ts`)
  - Added `CourseAssociationSchema` for validating association requests
  - Updated `CreateCourseSchema` to include optional association validation

### 3. Repository Layer

- **Course Repository** (`/data/repository/course-service.ts`)
  - Added `getCoursesByProgram()` method
  - Added `getCoursesBySubject()` method
  - Added `getCoursesByProgramAndYear()` method
  - Added `updateCourseAssociation()` method
  - Added `removeCourseAssociation()` method

### 4. API Endpoints

- **Association Management** (`/app/api/courses/[id]/association/route.ts`)
  - `POST` - Create course association with validation
  - `DELETE` - Remove course association
  - Validates college, program, and subject relationships
  - Ensures user permissions (course owner or superadmin)

- **Association Queries** (`/app/api/courses/associations/route.ts`)
  - `GET` - Retrieve courses by program ID
  - `GET` - Retrieve courses by subject ID
  - `GET` - Retrieve courses by program and year/semester

### 5. Client Services

- **Course Association Service** (`/data/services/course-association-service.ts`)
  - `associateCourse()` - Associate course with program/subject
  - `removeAssociation()` - Remove course association
  - `getCoursesByProgram()` - Get courses for a program
  - `getCoursesBySubject()` - Get courses for a subject

### 6. UI Components

- **CourseAssociationManager** (`/components/CourseAssociationManager.tsx`)
  - Visual interface for managing course associations
  - Cascading dropdowns: College → Program → Year/Semester → Subject
  - Real-time validation and error handling
  - Display current associations with removal capability

### 7. Form Integration

- **Course Creation** (`/app/courses/new/page.tsx`)
  - Added CourseAssociationManager to the course creation form
  - Integrated with form validation and submission

- **Course Editing** (`/app/courses/[id]/edit/page.tsx`)
  - Added CourseAssociationManager to the course editing form
  - Displays existing associations and allows updates

### 8. Database Indexes

- **Firestore Indexes** (`/firestore.indexes.json`)
  - `courses/association.programId + createdAt`
  - `courses/association.subjectId + createdAt`
  - `courses/association.programId + association.yearOrSemester + createdAt`
  - `courses/association.collegeId + createdAt`

### 9. Seed Data Updates

- **Database Seed Script** (`/scripts/seed-database.js`)
  - Updated course templates to include sample associations
  - Added logic to populate cached names (collegeName, programName, subjectName)
  - Enhanced course creation to handle association data

### 10. Deployment Scripts

- **Index Deployment** (`/scripts/deploy-course-association-indexes.sh`)
  - Automated script to deploy the new Firestore indexes
  - Includes Firebase CLI checks and project setup

## Data Flow

1. **Course Creation/Editing**
   - User selects college → loads programs for that college
   - User selects program → loads years/semesters for that program
   - User selects year/semester → loads subjects for that program and year
   - User selects subject → creates association

2. **Association Storage**
   - Associations stored as nested objects in course documents
   - Cached display names included for performance
   - Validates relationships at API level

3. **Query Capabilities**
   - Find all courses for a program
   - Find all courses for a specific subject
   - Find all courses for a program and year/semester
   - Filter courses by college affiliation

## Benefits

1. **Academic Structure** - Courses can now be properly organized within academic programs
2. **Better Discovery** - Students can find courses by their program of study
3. **Program Management** - Administrators can manage course offerings per program
4. **Reporting** - Analytics on course distribution across programs and subjects
5. **Optional Feature** - Associations are optional, maintaining flexibility

## Usage Examples

### Associate a Course
```typescript
await courseAssociationService.associateCourse('course-id', {
  collegeId: 'mit',
  programId: 'mit-cs-bs',
  yearOrSemester: 2,
  subjectId: 'mit-cs-algorithms'
})
```

### Find Courses by Program
```typescript
const courses = await courseAssociationService.getCoursesByProgram('mit-cs-bs', 2)
```

### Remove Association
```typescript
await courseAssociationService.removeAssociation('course-id')
```

## Deployment Steps

1. Deploy Firestore indexes:
   ```bash
   ./scripts/deploy-course-association-indexes.sh
   ```

2. Update seed data (optional):
   ```bash
   node scripts/seed-database.js
   ```

3. Test the feature in the questadmin interface

## Future Enhancements

1. **Bulk Association** - Associate multiple courses at once
2. **Program Catalog** - Dedicated views for program course listings
3. **Prerequisites Tracking** - Link course prerequisites to program sequences
4. **Credit Management** - Track credits per program requirements
5. **Progress Tracking** - Student progress within program structure
