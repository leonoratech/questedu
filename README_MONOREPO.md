# QuestEdu Monorepo Migration

This document describes the migration of QuestEdu from a single-package project to a pnpm monorepo structure.

## Migration Summary

### What Was Done

1. **Created Monorepo Structure**
   - Created `apps/` directory for applications
   - Created `packages/` directory for shared packages
   - Moved the main QuestEdu app to `apps/questedu/`

2. **Setup pnpm Workspace**
   - Created `pnpm-workspace.yaml` configuration
   - Updated root `package.json` with workspace scripts
   - Replaced npm/yarn with pnpm package manager

3. **File Reorganization**
   - Moved app-specific files to `apps/questedu/`:
     - All source code (`app/`, `components/`, `hooks/`, etc.)
     - Configuration files (`app.json`, `tsconfig.json`, etc.)
     - Environment files (`.env`, `.env.example`)
   - Kept documentation files at root level
   - Removed old `node_modules/` and `package-lock.json`

4. **Package Management**
   - Updated scripts to use pnpm workspace filters
   - Added monorepo-specific scripts for building packages
   - Created example shared package (`@questedu/shared-utils`)

## Benefits of the New Structure

1. **Scalability**: Easy to add new apps or shared packages
2. **Code Sharing**: Shared utilities can be used across multiple apps
3. **Better Dependency Management**: pnpm provides faster installs and better disk usage
4. **Development Experience**: Centralized scripts and workspace commands
5. **Future-Ready**: Prepared for microservices or multi-app architecture

## How to Use

### Development Commands (from root)

```bash
# Start QuestEdu app
pnpm dev

# Build all packages  
pnpm build:packages

# Lint and fix issues
pnpm lint:fix

# Clean all build artifacts
pnpm clean

# Platform-specific commands
pnpm android
pnpm ios
pnpm web
```

### Working with Packages

```bash
# Add dependency to specific app
pnpm --filter questedu add react-native-some-package

# Add dependency to shared package
pnpm --filter @questedu/shared-utils add lodash

# Run command in specific workspace
pnpm --filter questedu start
```

## Migration Checklist

- ✅ Created monorepo structure
- ✅ Moved QuestEdu app to `apps/questedu/`
- ✅ Setup pnpm workspace configuration
- ✅ Updated package.json scripts
- ✅ Created example shared package
- ✅ Updated documentation
- ✅ Fixed linting errors
- ✅ Tested development server
- ✅ Verified build process

## Next Steps

1. **Share Common Code**: Move reusable utilities to shared packages
2. **Add More Apps**: Create additional apps if needed (admin panel, etc.)
3. **CI/CD Setup**: Update build pipelines for monorepo structure
4. **Code Splitting**: Extract common components to shared packages

```
├── apps/
│   └── questedu/          # Main QuestEdu React Native/Expo app
├── packages/              # Shared packages (future use)
├── package.json           # Root package.json with workspace configuration
└── pnpm-workspace.yaml    # PNPM workspace configuration
```

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- pnpm (version 8 or higher)

### Installation

1. Install pnpm globally if you haven't already:
   ```bash
   npm install -g pnpm
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

### Development

Start the QuestEdu app in development mode:
```bash
pnpm dev
```

Or run specific commands for the app:
```bash
pnpm start    # Start Expo development server
pnpm android  # Start on Android
pnpm ios      # Start on iOS
pnpm web      # Start web version
```

### Building

Build the QuestEdu app:
```bash
pnpm build
```

### Linting

Run linting on the QuestEdu app:
```bash
pnpm lint
```

## Apps

### QuestEdu (`apps/questedu`)

The main educational platform app built with React Native and Expo.

## Packages

The `packages/` directory is ready for shared libraries and utilities that can be used across different apps in the monorepo.

## Commands

All commands are run from the root of the monorepo and automatically target the appropriate workspace.

- `pnpm dev` - Start the QuestEdu app in development mode
- `pnpm start` - Start the Expo development server
- `pnpm build` - Build the QuestEdu app
- `pnpm lint` - Run linting
- `pnpm android` - Start on Android device/emulator
- `pnpm ios` - Start on iOS device/simulator
- `pnpm web` - Start web version

## Workspace Management

To add a new package to a specific workspace:
```bash
pnpm --filter questedu add <package-name>
```

To run a command in a specific workspace:
```bash
pnpm --filter questedu <command>
```
