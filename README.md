# QuestEdu Monorepo

A monorepo containing the QuestEdu educational platform and its related packages, managed with pnpm workspaces.

## Overview

QuestEdu is an educational platform built with React Native and Expo, featuring course management, user profiles, and Firebase integration.

## Quick Start

### Prerequisites

- Node.js (version 18 or higher)
- pnpm (version 8 or higher)
- Expo CLI

### Installation

1. Install pnpm globally if you haven't already:
   ```bash
   npm install -g pnpm
   ```

2. Clone the repository and install dependencies:
   ```bash
   git clone <repository-url>
   cd questedu
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cd apps/questedu
   cp .env.example .env
   # Edit .env with your Firebase configuration
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

## Project Structure

```
├── apps/
│   └── questedu/          # Main QuestEdu React Native/Expo app
├── packages/              # Shared packages (future use)
├── package.json           # Root package.json with workspace configuration
├── pnpm-workspace.yaml    # PNPM workspace configuration
└── Documentation files    # Setup guides and migration docs
```

## Available Commands

All commands are run from the root and automatically target the appropriate workspace:

### Development
- `pnpm dev` - Start the QuestEdu app in development mode
- `pnpm start` - Start the Expo development server
- `pnpm android` - Start on Android device/emulator
- `pnpm ios` - Start on iOS device/simulator
- `pnpm web` - Start web version

### Build & Deploy
- `pnpm build` - Build the QuestEdu app for production
- `pnpm lint` - Run linting

### Utilities
- `pnpm reset-project` - Reset the project (run setup scripts)

## Apps

### QuestEdu (`apps/questedu`)

The main educational platform app built with:
- **React Native & Expo** - Cross-platform mobile development
- **React Native Paper** - Material Design UI components  
- **React Navigation** - Navigation and routing
- **Firebase** - Backend services (Firestore, Auth)
- **TypeScript** - Type safety

## Documentation

- [`FIREBASE_SETUP.md`](./FIREBASE_SETUP.md) - Firebase project setup guide
- [`DATABASE_INIT_GUIDE.md`](./DATABASE_INIT_GUIDE.md) - Database initialization
- [`FIRESTORE_SECURITY_RULES.md`](./FIRESTORE_SECURITY_RULES.md) - Security rules setup
- [`MIGRATION_SUMMARY.md`](./MIGRATION_SUMMARY.md) - Migration notes

## Workspace Management

### Working with packages

Add a package to a specific workspace:
```bash
pnpm --filter questedu add <package-name>
```

Add a dev dependency:
```bash
pnpm --filter questedu add -D <package-name>
```

Run commands in a specific workspace:
```bash
pnpm --filter questedu <command>
```

### Creating new packages

To add a new shared package:
1. Create a new directory in `packages/`
2. Add a `package.json` with appropriate name and dependencies
3. The package will automatically be included in the workspace

## Contributing

1. Make sure to run `pnpm install` at the root level
2. Follow the existing code style and conventions
3. Test your changes with `pnpm lint` and `pnpm build`
4. Update documentation as needed