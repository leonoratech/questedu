# QuestAdmin - Course Management Dashboard

A Next.js web application for managing courses in the QuestEdu platform. This admin panel allows administrators to create, edit, and delete courses that appear in the QuestEdu mobile app.

## Features

- 📝 **Course Management**: Create, edit, and delete courses
- 🔍 **Search & Filter**: Search courses by title, instructor, or category
- 🎨 **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- 🔥 **Firebase Integration**: Real-time sync with QuestEdu mobile app
- 📱 **Responsive Design**: Works on desktop and tablet browsers

## Tech Stack

- **Framework**: Next.js 15.3 with App Router
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS)
- **Database**: Firebase Firestore (shared with QuestEdu app)
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Quick Start

### 1. Environment Setup

Copy the environment template and fill in your Firebase credentials:

```bash
cd apps/questadmin
cp .env.example .env.local
```

Edit `.env.local` with your Firebase configuration (same as QuestEdu app):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-actual-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-actual-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 2. Start Development Server

From the root directory:

```bash
pnpm admin
```

Or directly in the questadmin directory:

```bash
cd apps/questadmin
pnpm dev
```

The admin panel will be available at: http://localhost:3001

### 3. Firebase Setup

Ensure your Firebase project has:

1. **Firestore Database** enabled
2. **Security Rules** configured for development:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    allow read, write: if true; // Development only!
  }
}
```

## Available Scripts

From the root directory:

- `pnpm admin` - Start development server
- `pnpm admin:build` - Build for production
- `pnpm admin:start` - Start production server

From the questadmin directory:

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Usage

### Creating a Course

1. Click the "Add Course" button
2. Fill in the course details:
   - **Title**: Course name
   - **Instructor**: Instructor name
   - **Category**: Course category (e.g., "Development", "Design")
   - **Description**: Course description
   - **Image URL**: Course thumbnail URL
   - **Progress**: Initial progress percentage (0-100)
3. Click "Create Course"

### Editing a Course

1. Click the edit icon (pencil) next to a course
2. Modify the course details
3. Click "Update Course"

### Deleting a Course

1. Click the delete icon (trash) next to a course
2. Confirm the deletion

### Searching Courses

Use the search box to filter courses by:
- Course title
- Instructor name
- Category

## Data Sync

The admin panel shares the same Firestore database as the QuestEdu mobile app. Changes made in the admin panel will immediately appear in the mobile app (and vice versa).

## Project Structure

```
apps/questadmin/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── course-management.tsx # Main course management component
├── lib/                   # Utilities
│   ├── firebase.ts       # Firebase configuration
│   ├── course-service.ts # Course CRUD operations
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Utility functions
├── .env.example          # Environment template
├── .env.local           # Environment variables (gitignored)
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## Development Notes

- The app runs on port 3001 to avoid conflicts with other Next.js apps
- Uses the same Firebase project and Firestore collection as QuestEdu
- Course types are shared between both applications
- Real-time updates are not implemented in the admin panel (refresh page to see changes)

## Security

⚠️ **Important**: The current setup uses permissive Firestore rules for development. For production deployment:

1. Implement proper authentication
2. Update Firestore security rules
3. Add admin role verification
4. Enable HTTPS only

## Troubleshooting

### Common Issues

1. **Firebase connection errors**: Check `.env.local` credentials
2. **Permission denied**: Verify Firestore security rules
3. **Port conflicts**: Ensure port 3001 is available

### Getting Help

- Check Firebase Console for database status
- Verify security rules in Firestore
- Check browser console for error messages
- Ensure both apps use the same Firebase project
