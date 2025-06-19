# Firebase Authentication Testing Guide

## Quick Verification Steps

### 1. **Start the Development Server**
```bash
cd /home/solmon/github/questedu
pnpm dev
```

### 2. **Test Authentication Flow**

#### A. **Initial State (Unauthenticated)**
- Open the app
- Open drawer menu (hamburger icon)
- Should see: "Welcome to QuestEdu" with Sign In/Sign Up buttons
- Should see: Limited menu items (Home, Help & Support)

#### B. **User Registration (Student Only)**
- Tap "Sign Up" in drawer
- Fill form with:
  - Email: `test@student.com`
  - Password: `Student123!`
  - Display Name: `Test Student`
  - Accept terms
- Tap "Sign Up"
- Should: Create account and auto-login
- Should: Redirect to home screen
- Should: Show authenticated drawer menu

#### C. **Drawer Menu (Authenticated)**
- Open drawer menu
- Should see: User avatar with first letter of name
- Should see: Display name and email
- Should see: "Student" role badge
- Should see: Full menu (Home, Profile, My Courses, etc.)
- Should see: "Log Out" option

#### D. **Profile Screen**
- Navigate to Profile from drawer
- Should see: User information display
- Should see: Logout button in header
- Should see: Settings options

#### E. **Route Protection**
- Try accessing `/profile` directly when logged out
- Should: Redirect to login screen
- Login and try again
- Should: Access profile successfully

#### F. **Sign Out**
- Use "Log Out" from drawer or profile
- Should: Return to unauthenticated state
- Should: Show welcome drawer menu
- Should: Protected routes require login again

#### G. **Login Flow**
- Tap "Sign In" in drawer
- Enter credentials from registration
- Should: Login successfully
- Should: Restore authenticated state

#### H. **Password Reset**
- From login screen, tap "Forgot Password"
- Enter registered email
- Should: Send reset email (check Firebase console)
- Should: Show success message

### 3. **Error Testing**

#### A. **Invalid Registration**
- Try registering with:
  - Invalid email format
  - Weak password
  - Mismatched password confirmation
- Should: Show appropriate error messages

#### B. **Invalid Login**
- Try logging in with:
  - Wrong password
  - Non-existent email
- Should: Show error messages

#### C. **Network Issues**
- Test with airplane mode
- Should: Handle gracefully with error messages

### 4. **Firebase Console Verification**

#### A. **Authentication**
- Open Firebase Console → Authentication
- Should see: New user created with email
- Should see: Email verification status

#### B. **Firestore**
- Open Firebase Console → Firestore
- Should see: `users` collection
- Should see: User document with profile data
- Should see: Correct role assignment (`STUDENT`)

### 5. **Code Verification**

#### A. **Check File Structure**
```bash
# In /home/solmon/github/questedu/apps/questedu
ls -la contexts/AuthContext.tsx
ls -la components/auth/
ls -la components/AuthGuard.tsx
ls -la app/login.tsx app/signup.tsx app/forgot-password.tsx
```

#### B. **Check Integration**
```bash
# Verify AuthProvider is in layout
grep -n "AuthProvider" app/_layout.tsx

# Verify AuthGuard usage
grep -n "AuthGuard" app/profile.tsx app/index.tsx

# Verify drawer integration
grep -n "useAuth" components/CustomDrawerContent.tsx
```

## Common Issues & Solutions

### 1. **"Cannot find module" Errors**
- Check import paths are correct
- Verify file structure matches imports
- Run `pnpm install` to ensure dependencies

### 2. **Firebase Configuration Issues**
- Verify `.env` file has correct Firebase config
- Check Firebase project settings match
- Ensure Firebase Auth is enabled in console

### 3. **Navigation Issues**
- Verify Expo Router configuration
- Check route file names and structure
- Ensure drawer screens are properly configured

### 4. **Authentication State Issues**
- Check AuthProvider wraps the entire app
- Verify useAuth hook is used correctly
- Check for context provider ordering

### 5. **UI/Styling Issues**
- Verify React Native Paper theme setup
- Check Material UI provider configuration
- Ensure styles are properly imported

## Success Indicators

✅ **Registration**: New users can create student accounts  
✅ **Login**: Existing users can authenticate  
✅ **Protection**: Routes require authentication  
✅ **Profile**: User data displays correctly  
✅ **Navigation**: Drawer menu reflects auth state  
✅ **Logout**: Users can sign out securely  
✅ **Persistence**: Auth state survives app restarts  
✅ **Firebase**: Data stored correctly in Firestore  

## Performance Testing

### Load Testing
- Register multiple test accounts
- Test concurrent logins
- Verify Firebase performance metrics

### Memory Testing
- Monitor app memory usage during auth
- Check for memory leaks in auth context
- Test on low-memory devices

### Network Testing
- Test on slow connections
- Verify offline behavior
- Check Firebase retry mechanisms

## Production Readiness Checklist

- [ ] All test scenarios pass
- [ ] Firebase security rules configured
- [ ] Environment variables set
- [ ] Error handling comprehensive
- [ ] Loading states smooth
- [ ] Accessibility features working
- [ ] Performance acceptable
- [ ] Security review completed

## Troubleshooting Commands

```bash
# Clear Expo cache
npx expo start --clear

# Reset project
pnpm reset-project

# Check TypeScript errors
npx tsc --noEmit

# View Firebase logs
# (Check Firebase Console → Functions → Logs)

# Test Firebase connection
node scripts/test-auth-integration.js
```
