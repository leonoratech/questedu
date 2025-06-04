# QuestEdu - Educational Course App 📚

A React Native educational course app built with Expo, featuring Firebase Firestore integration and Zscaler proxy support.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Firebase (Required)
```bash
# Copy environment template
cp .env.example .env
```

Add your Firebase credentials to `.env`:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
EXPO_PUBLIC_DISABLE_SSL=true
```

### 3. Fix Firestore Security Rules (Important!)
**Before running the app**, update your Firestore security rules:

1. Go to [Firebase Console](https://console.firebase.google.com/) → Your Project → Firestore → Rules
2. Replace with: `allow read, write: if true;`
3. Click Publish and wait 30 seconds

**Why?** Default Firestore rules block all operations. See `FIRESTORE_SECURITY_RULES.md` for details.

### 4. Start the App
```bash
npm start
```

### 5. Initialize Database
- Open the app on your device/emulator
- Find the "Database Initialization" card at the bottom
- Click "Run Diagnostics" to test your setup
- Click "Initialize Database" to load sample courses

## 📱 Features

- 🔥 **Firebase Firestore** integration for real-time data
- 🔍 **Search functionality** across courses
- 📂 **Category filtering** for easy navigation
- 🔄 **Pull-to-refresh** for data updates
- 🌐 **Zscaler proxy support** for corporate environments
- 📊 **Real-time synchronization** across devices
- 🛠️ **Built-in diagnostic tools** for troubleshooting

## 🔧 Current Status

### ✅ Completed
- Firebase Firestore integration
- Course CRUD operations
- Search and filtering
- Zscaler proxy compatibility
- Diagnostic tools
- Database seeding utilities

### 🔄 In Progress
- Fixing Firestore security rules configuration
- Testing database initialization
- Removing temporary setup components

### ⚠️ Known Issues
- **"Bad Request" Error**: Caused by restrictive Firestore security rules
- **Solution**: Follow the security rules fix in step 3 above

## 📖 Documentation

- [`FIREBASE_SETUP.md`](./FIREBASE_SETUP.md) - Firebase project setup
- [`DATABASE_INIT_GUIDE.md`](./DATABASE_INIT_GUIDE.md) - Database initialization
- [`FIRESTORE_SECURITY_RULES.md`](./FIRESTORE_SECURITY_RULES.md) - Security rules configuration
- [`MIGRATION_SUMMARY.md`](./MIGRATION_SUMMARY.md) - Complete migration overview

## 🛠️ Development

### Project Structure
```
├── app/                 # Expo Router pages
├── components/          # React components
├── firebase/           # Firebase configuration & services
├── hooks/              # Custom React hooks
├── scripts/            # Database initialization scripts
└── docs/               # Documentation files
```

### Key Components
- `firebase/courseService.ts` - Firestore CRUD operations
- `hooks/useCourses.ts` - Course data management hooks
- `components/DatabaseInitializer.tsx` - Database setup tool
- `firebase/config.ts` - Firebase configuration with proxy support

### Troubleshooting
If you encounter issues:

1. **Check Firebase Console** for project status
2. **Run diagnostics** in the DatabaseInitializer component
3. **Verify security rules** are set to allow development access
4. **Check logs** in the app console for specific errors

## 🌐 Zscaler Proxy Support

The app includes built-in support for corporate proxy environments:
- SSL verification bypass in development
- Automatic proxy detection
- Fallback error handling

Set `EXPO_PUBLIC_DISABLE_SSL=true` in your `.env` file.

## 🔐 Security Notes

- Current setup uses permissive Firestore rules for development
- See `FIRESTORE_SECURITY_RULES.md` for production-ready security rules
- Always implement proper authentication before production deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
