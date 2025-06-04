# QuestEdu App

A React Native educational platform app built with Expo.

## Features

- Educational course management
- User profile management
- Firebase integration for data storage
- Material Design UI with react-native-paper
- Bottom navigation with tabs
- Drawer navigation

## Tech Stack

- **Framework**: React Native with Expo
- **UI Library**: React Native Paper (Material Design)
- **Navigation**: React Navigation v7
- **Database**: Firebase Firestore
- **Language**: TypeScript

## Development

This app is part of a pnpm monorepo. To run commands from the root:

```bash
# Start development server
pnpm dev

# Start on specific platforms
pnpm android
pnpm ios
pnpm web

# Build the app
pnpm build

# Run linting
pnpm lint
```

Or run commands directly in this directory:

```bash
cd apps/questedu

# Install dependencies (if needed)
pnpm install

# Start development server
pnpm dev

# Other commands
pnpm android
pnpm ios
pnpm web
pnpm build
pnpm lint
```

## Project Structure

```
├── app/                    # App screens using expo-router
│   ├── _layout.tsx        # Root layout
│   ├── index.tsx          # Home screen
│   ├── profile.tsx        # Profile screen
│   └── +not-found.tsx     # 404 screen
├── assets/                # Static assets (images, fonts)
├── components/            # Reusable React components
│   ├── tabs/             # Tab-specific components
│   └── ui/               # UI utility components
├── constants/             # App constants and themes
├── firebase/              # Firebase configuration and services
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── scripts/               # Utility scripts
```

## Environment Setup

Copy `.env.example` to `.env` and fill in your Firebase configuration:

```bash
cp .env.example .env
```

Required environment variables:
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`

## Firebase Setup

See the root directory documentation files for Firebase setup:
- `FIREBASE_SETUP.md`
- `DATABASE_INIT_GUIDE.md`
- `FIRESTORE_SECURITY_RULES.md`
