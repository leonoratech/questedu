# Database Management Scripts Usage Guide

## Overview

The QuestAdmin application now includes comprehensive database management scripts for development and testing workflows. These scripts allow you to clear all data and populate the database with realistic mock data.

## Available Scripts

### 1. Clear Database Script
**File:** `scripts/clear-database.js`
**Purpose:** Safely clears all data from the Firestore database with user confirmation
**Usage:**
```bash
# Interactive mode (requires confirmation)
node scripts/clear-database.js

# Automated mode (no confirmation required)
node scripts/clear-database.js --confirm
```

### 2. Automated Clear Script
**File:** `scripts/clear-database-auto.js`
**Purpose:** Non-interactive version for automated workflows
**Usage:**
```bash
node scripts/clear-database-auto.js
```

### 3. Seed Database Script
**File:** `scripts/seed-database.js`
**Purpose:** Populates database with comprehensive mock data
**Usage:**
```bash
# Seed database (preserves existing data)
node scripts/seed-database.js

# Clear database first, then seed
node scripts/seed-database.js --clear-first
```

### 4. Migration Script
**File:** `scripts/migrate-college-references.js`
**Purpose:** Converts existing text-based college references to ID-based references
**Usage:**
```bash
node scripts/migrate-college-references.js
```

## Mock Data Created by Seed Script

### 🏛️ **Colleges (5 institutions)**
- **MIT** - Massachusetts Institute of Technology
- **Stanford** - Stanford University  
- **IIT Bombay** - Indian Institute of Technology Bombay
- **Cambridge** - University of Cambridge
- **Metro Community College** - Local community college

### 👥 **Users (11 total)**
- **1 Superadmin:** superadmin@questedu.com (password: SuperAdmin123!)
- **4 Instructors:** Various departments (CS, Data Science, Engineering, Marketing)
- **6 Students:** Diverse backgrounds enrolled in multiple courses

### 📚 **Courses (4 comprehensive courses)**
1. **Modern Web Development** (JavaScript/React focus)
2. **Machine Learning Fundamentals** (Python/AI focus)
3. **Mechanical Design Principles** (Engineering focus)
4. **Digital Marketing Strategy** (Business focus)

### 📖 **Topics (24 total - 6 per course)**
Each course includes comprehensive topics with:
- Learning objectives
- Study materials
- Prerequisites
- Difficulty levels

### ❓ **Questions (120 total - 5 per topic)**
Variety of question types:
- Multiple choice
- True/false
- Short answer
- Essay questions

### 🎓 **Enrollments (18 total)**
Students enrolled in 2-4 courses each with realistic enrollment patterns

### 📊 **Activities (40+ records)**
Tracks all major actions:
- Course creation
- Topic additions
- Student enrollments
- Content updates

## Test Credentials

### Superadmin Access
- **Email:** superadmin@questedu.com
- **Password:** SuperAdmin123!
- **Role:** SUPERADMIN
- **Access:** Full system access including college management

### Sample Instructor
- **Email:** prof.smith@questedu.com
- **Password:** Instructor123!
- **Role:** INSTRUCTOR
- **College:** MIT

### Sample Student  
- **Email:** alice.student@questedu.com
- **Password:** Student123!
- **Role:** STUDENT
- **College:** MIT

## Quick Start Guide

### 1. Clear and Seed Database
```bash
cd /path/to/questadmin
node scripts/seed-database.js --clear-first
```

### 2. Start Development Server
```bash
pnpm dev
```

### 3. Test College Management
1. Login as superadmin (superadmin@questedu.com / SuperAdmin123!)
2. Navigate to `/colleges` in the app
3. Test CRUD operations on colleges
4. Create new users and verify college dropdown

### 4. Test Student/Instructor Flows
1. Login as student/instructor
2. Complete profile setup
3. Verify college selector works with database colleges
4. Test course enrollment and content access

## Database Collections Modified

### Core Collections
- `users` - User profiles with college ID references
- `colleges` - College/university master data
- `courses` - Course information and metadata
- `enrollments` - Student course enrollments

### Supporting Collections
- `courseTopics` - Course content structure
- `courseQuestions` - Assessment questions
- `activities` - System activity tracking
- `notifications` - User notifications

## Script Features

### 🔒 **Safety Features**
- Confirmation prompts for destructive operations
- Batch operations for performance
- Progress tracking and status updates
- Comprehensive error handling
- Verification steps after operations

### 📊 **Monitoring**
- Document count reporting
- Processing time tracking  
- Success/failure status
- Detailed progress logs

### 🔄 **Data Integrity**
- Proper relationship setup
- Realistic data patterns
- Consistent timestamps
- Valid data formats

## Troubleshooting

### Common Issues

1. **Firebase Connection Error**
   - Verify `.env.local` file exists with correct Firebase config
   - Check network connectivity
   - Ensure Firebase project is active

2. **Permission Denied**
   - Verify Firestore security rules allow admin operations
   - Check Firebase project permissions
   - Ensure service account has proper roles

3. **Script Timeout**
   - Large databases may take time to clear
   - Increase timeout limits if needed
   - Monitor Firebase console for operation status

### Verification Steps

1. **Check Database State:**
   ```bash
   node scripts/test-connection.js
   ```

2. **Verify User Creation:**
   - Login to Firebase Console
   - Check Authentication section
   - Verify users were created

3. **Test Application:**
   - Start development server
   - Login with test credentials
   - Navigate through application features

## Development Workflow

### Recommended Development Cycle
1. **Reset Database:** `node scripts/seed-database.js --clear-first`
2. **Start Server:** `pnpm dev`
3. **Test Features:** Login and test new functionality
4. **Iterate:** Make changes and test
5. **Reset:** Clear and seed again for clean state

### Testing New Features
1. Use seeded data for realistic testing
2. Test with different user roles
3. Verify college management functionality
4. Check data relationships and integrity

## Security Notes

⚠️ **Important Security Considerations:**
- These scripts use admin-level Firebase access
- Never run clearing scripts on production databases
- Test credentials are for development only
- Change default passwords in production
- Review Firestore security rules before deployment

## Next Steps

1. **Run the scripts** to populate your database
2. **Test the college management** interface as superadmin
3. **Verify college selection** in signup/profile forms
4. **Test user flows** with different roles
5. **Customize mock data** as needed for your use case

The comprehensive college management system is now fully implemented with robust database management tools for efficient development and testing workflows!
