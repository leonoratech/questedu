# Firestore Index Management

This directory contains scripts for managing Firestore indexes in the QuestAdmin application.

## Overview

The index management system provides comprehensive tools for:
- ✅ Validating index configuration files
- 📋 Checking current index status
- 🚀 Deploying indexes to Firestore
- 🧹 Clearing existing indexes
- 🔄 Recreating all indexes
- 🔧 Setting up Firebase CLI

## Quick Start

### Using Database Manager (Recommended)

The easiest way to manage indexes is through the database manager:

```bash
# Check index status
node scripts/db-manager.js indexes-status

# Validate local index configuration
node scripts/db-manager.js indexes-validate

# Deploy indexes from firestore.indexes.json
node scripts/db-manager.js indexes-deploy

# Complete index recreation (clear + deploy)
node scripts/db-manager.js indexes-recreate

# Setup Firebase CLI
node scripts/db-manager.js setup-firebase
```

### Direct Script Usage

You can also run the index management script directly:

```bash
# Show help
node scripts/manage-indexes.js help

# Check status
node scripts/manage-indexes.js status

# Deploy indexes
node scripts/manage-indexes.js deploy

# Validate configuration
node scripts/manage-indexes.js validate
```

## Prerequisites

### 1. Firebase CLI Installation

The index management requires Firebase CLI to be installed:

```bash
# Install globally with npm
npm install -g firebase-tools

# Or with pnpm
pnpm add -g firebase-tools

# Or with yarn
yarn global add firebase-tools
```

### 2. Firebase Authentication

You need to be logged in to Firebase:

```bash
# Login to Firebase
firebase login

# List available projects
firebase projects:list

# Set project (if needed)
firebase use <project-id>
```

### 3. Project Configuration

Ensure your `firebase.json` includes Firestore configuration:

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

## Index Configuration

The Firestore indexes are defined in `firestore.indexes.json`. This file contains:

### Current Indexes

The system currently manages indexes for:
- **courseTopics**: `courseId + order`
- **courseQuestions**: Multiple indexes for different query patterns
- **activities**: `instructorId + createdAt (desc)`

### Index Structure

Each index in the configuration includes:
- `collectionGroup`: The Firestore collection
- `queryScope`: Usually "COLLECTION"
- `fields`: Array of field configurations with `fieldPath` and `order`

Example:
```json
{
  "collectionGroup": "activities",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "instructorId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "createdAt",
      "order": "DESCENDING"
    }
  ]
}
```

## Common Operations

### Adding New Indexes

1. Edit `firestore.indexes.json` to add your new index
2. Validate the configuration: `node scripts/db-manager.js indexes-validate`
3. Deploy the new indexes: `node scripts/db-manager.js indexes-deploy`

### Fixing Index Issues

If you encounter index-related errors:

1. Check current status: `node scripts/db-manager.js indexes-status`
2. Validate configuration: `node scripts/db-manager.js indexes-validate`
3. Recreate all indexes: `node scripts/db-manager.js indexes-recreate`

### Clearing All Indexes

To start fresh with indexes:

1. Get clearing instructions: `node scripts/db-manager.js indexes-clear`
2. Follow the manual steps provided
3. Deploy fresh indexes: `node scripts/db-manager.js indexes-deploy`

## Troubleshooting

### Firebase CLI Issues

If you encounter Firebase CLI problems:

```bash
# Check setup
node scripts/db-manager.js setup-firebase

# Reinstall Firebase CLI
npm install -g firebase-tools

# Re-authenticate
firebase login
```

### Index Deployment Timeouts

Index creation is asynchronous and can take time:
- Small indexes: Usually complete within minutes
- Large indexes: Can take hours for existing data
- Check progress in Firebase Console

### Permission Issues

Ensure your Firebase account has:
- Firestore Admin permissions
- Cloud Datastore Index Admin role
- Project Editor or Owner role

## Firebase Console

You can also manage indexes via the Firebase Console:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to Firestore Database > Indexes
4. View, create, or delete indexes manually

## Integration with Activity Service

The index management is particularly important for the Activity Service (`activity-service.ts`), which relies on the `activities` collection index for:
- Querying activities by `instructorId`
- Ordering by `createdAt` in descending order
- Efficient dashboard activity feeds

## Scripts Reference

| Script | Purpose | Usage |
|--------|---------|-------|
| `manage-indexes.js` | Core index management | Direct script execution |
| `setup-firebase-cli.js` | Firebase CLI setup checker | Environment validation |
| `db-manager.js` | Unified database operations | Main entry point |

## Error Handling

The scripts include comprehensive error handling:
- ✅ Graceful timeout handling for Firebase CLI commands
- ⚠️ Clear error messages and troubleshooting instructions
- 🔄 Retry suggestions for failed operations
- 📋 Detailed logging and status reporting

## Next Steps

After setting up index management:
1. Ensure all team members have Firebase CLI access
2. Include index deployment in your CI/CD pipeline
3. Monitor index usage in Firebase Console
4. Regularly validate index configuration with new features

---

For more information about Firestore indexes, see the [Firebase Documentation](https://firebase.google.com/docs/firestore/query-data/indexing).
