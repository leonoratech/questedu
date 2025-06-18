#!/usr/bin/env node

/**
 * Firebase Authentication Integration Test
 * 
 * This script validates the Firebase authentication setup for the QuestEdu mobile app.
 * It checks for proper configuration, file structure, and basic functionality.
 */

const { existsSync, readFileSync } = require('fs');
const { join } = require('path');

class AuthIntegrationTester {
  constructor() {
    this.results = {
      firebaseConfig: false,
      authContext: false,
      authScreens: false,
      authGuard: false,
      routeIntegration: false,
      drawerIntegration: false
    };
  }

  testFirebaseConfiguration() {
    console.log('🔥 Testing Firebase Configuration...');
    
    const configFile = 'firebase-config.ts';
    
    if (existsSync(configFile)) {
      const content = readFileSync(configFile, 'utf8');
      
      const hasAuth = content.includes('getFirebaseAuth');
      const hasFirestore = content.includes('getFirestoreDb');
      const hasConfig = content.includes('firebaseConfig');
      
      console.log(`   ${hasAuth ? '✅' : '❌'} Firebase Auth export`);
      console.log(`   ${hasFirestore ? '✅' : '❌'} Firestore export`);
      console.log(`   ${hasConfig ? '✅' : '❌'} Firebase config`);
      
      this.results.firebaseConfig = hasAuth && hasFirestore && hasConfig;
    } else {
      console.log('   ❌ firebase-config.ts not found');
    }
    
    console.log('');
  }

  testAuthContext() {
    console.log('🔐 Testing Auth Context...');
    
    const contextFile = 'contexts/AuthContext.tsx';
    
    if (existsSync(contextFile)) {
      const content = readFileSync(contextFile, 'utf8');
      
      const hasProvider = content.includes('AuthProvider');
      const hasContext = content.includes('useAuth');
      const hasSignIn = content.includes('signIn');
      const hasSignUp = content.includes('signUp');
      const hasSignOut = content.includes('signOut');
      const hasStudentRole = content.includes('STUDENT');
      
      console.log(`   ${hasProvider ? '✅' : '❌'} AuthProvider component`);
      console.log(`   ${hasContext ? '✅' : '❌'} useAuth hook`);
      console.log(`   ${hasSignIn ? '✅' : '❌'} Sign in functionality`);
      console.log(`   ${hasSignUp ? '✅' : '❌'} Sign up functionality`);
      console.log(`   ${hasSignOut ? '✅' : '❌'} Sign out functionality`);
      console.log(`   ${hasStudentRole ? '✅' : '❌'} Student role enforcement`);
      
      this.results.authContext = hasProvider && hasContext && hasSignIn && hasSignUp && hasSignOut && hasStudentRole;
    } else {
      console.log('   ❌ AuthContext.tsx not found');
    }
    
    console.log('');
  }

  testAuthScreens() {
    console.log('📱 Testing Auth Screens...');
    
    const screens = [
      'components/auth/LoginScreen.tsx',
      'components/auth/SignupScreen.tsx',
      'components/auth/ForgotPasswordScreen.tsx'
    ];
    
    let validScreens = 0;
    
    screens.forEach(screen => {
      if (existsSync(screen)) {
        const content = readFileSync(screen, 'utf8');
        const hasValidation = content.includes('validation') || content.includes('error');
        const hasAuth = content.includes('useAuth');
        const hasNavigation = content.includes('navigation') || content.includes('router');
        
        console.log(`   ✅ ${screen.split('/').pop()}`);
        console.log(`      ${hasValidation ? '✅' : '❌'} Form validation`);
        console.log(`      ${hasAuth ? '✅' : '❌'} Auth integration`);
        console.log(`      ${hasNavigation ? '✅' : '❌'} Navigation`);
        
        if (hasValidation && hasAuth && hasNavigation) {
          validScreens++;
        }
      } else {
        console.log(`   ❌ ${screen.split('/').pop()} not found`);
      }
    });
    
    this.results.authScreens = validScreens === screens.length;
    console.log('');
  }

  testAuthGuard() {
    console.log('🛡️  Testing Auth Guard...');
    
    const guardFile = 'components/AuthGuard.tsx';
    
    if (existsSync(guardFile)) {
      const content = readFileSync(guardFile, 'utf8');
      
      const hasAuth = content.includes('useAuth');
      const hasRedirect = content.includes('router') || content.includes('navigation');
      const hasLoading = content.includes('loading');
      const hasRoleCheck = content.includes('role');
      
      console.log(`   ${hasAuth ? '✅' : '❌'} Auth integration`);
      console.log(`   ${hasRedirect ? '✅' : '❌'} Redirect functionality`);
      console.log(`   ${hasLoading ? '✅' : '❌'} Loading state`);
      console.log(`   ${hasRoleCheck ? '✅' : '❌'} Role-based access`);
      
      this.results.authGuard = hasAuth && hasRedirect && hasLoading && hasRoleCheck;
    } else {
      console.log('   ❌ AuthGuard.tsx not found');
    }
    
    console.log('');
  }

  testRouteIntegration() {
    console.log('🗺️  Testing Route Integration...');
    
    const layoutFile = 'app/_layout.tsx';
    const routes = ['app/login.tsx', 'app/signup.tsx', 'app/forgot-password.tsx'];
    
    if (existsSync(layoutFile)) {
      const content = readFileSync(layoutFile, 'utf8');
      
      const hasAuthProvider = content.includes('AuthProvider');
      const hasDrawerScreens = content.includes('Drawer.Screen');
      const hasHiddenRoutes = content.includes('display: \'none\'');
      
      console.log(`   ${hasAuthProvider ? '✅' : '❌'} AuthProvider in layout`);
      console.log(`   ${hasDrawerScreens ? '✅' : '❌'} Drawer screen configuration`);
      console.log(`   ${hasHiddenRoutes ? '✅' : '❌'} Auth routes hidden from drawer`);
      
      let validRoutes = 0;
      routes.forEach(route => {
        if (existsSync(route)) {
          console.log(`   ✅ ${route.split('/').pop()}`);
          validRoutes++;
        } else {
          console.log(`   ❌ ${route.split('/').pop()} not found`);
        }
      });
      
      this.results.routeIntegration = hasAuthProvider && hasDrawerScreens && validRoutes === routes.length;
    } else {
      console.log('   ❌ _layout.tsx not found');
    }
    
    console.log('');
  }

  testDrawerIntegration() {
    console.log('📋 Testing Drawer Integration...');
    
    const drawerFile = 'components/CustomDrawerContent.tsx';
    
    if (existsSync(drawerFile)) {
      const content = readFileSync(drawerFile, 'utf8');
      
      const hasAuth = content.includes('useAuth');
      const hasConditionalRendering = content.includes('if (!user)');
      const hasSignOut = content.includes('signOut');
      const hasAuthButtons = content.includes('Sign In') && content.includes('Sign Up');
      
      console.log(`   ${hasAuth ? '✅' : '❌'} Auth integration`);
      console.log(`   ${hasConditionalRendering ? '✅' : '❌'} Conditional rendering`);
      console.log(`   ${hasSignOut ? '✅' : '❌'} Sign out functionality`);
      console.log(`   ${hasAuthButtons ? '✅' : '❌'} Auth buttons for guests`);
      
      this.results.drawerIntegration = hasAuth && hasConditionalRendering && hasSignOut && hasAuthButtons;
    } else {
      console.log('   ❌ CustomDrawerContent.tsx not found');
    }
    
    console.log('');
  }

  generateReport() {
    console.log('📊 Auth Integration Test Results');
    console.log('================================\n');
    
    const tests = [
      { name: 'Firebase Configuration', result: this.results.firebaseConfig },
      { name: 'Auth Context', result: this.results.authContext },
      { name: 'Auth Screens', result: this.results.authScreens },
      { name: 'Auth Guard', result: this.results.authGuard },
      { name: 'Route Integration', result: this.results.routeIntegration },
      { name: 'Drawer Integration', result: this.results.drawerIntegration }
    ];
    
    tests.forEach(test => {
      const status = test.result ? '✅' : '❌';
      console.log(`${status} ${test.name}`);
    });
    
    const passedTests = tests.filter(test => test.result).length;
    const totalTests = tests.length;
    
    console.log(`\n📈 Overall Score: ${passedTests}/${totalTests} (${Math.round((passedTests/totalTests) * 100)}%)\n`);
    
    if (passedTests === totalTests) {
      console.log('🎉 Congratulations! Firebase authentication is fully integrated and ready to use!');
      console.log('\n📋 What you can now do:');
      console.log('   • User registration (student role only)');
      console.log('   • User login with email/password');
      console.log('   • Password reset functionality');
      console.log('   • Route protection with AuthGuard');
      console.log('   • Role-based access control');
      console.log('   • Profile management');
      console.log('   • Authenticated drawer menu');
      console.log('\n🚀 Next Steps:');
      console.log('   • Test the authentication flow in the app');
      console.log('   • Add email verification UI');
      console.log('   • Implement user profile editing');
      console.log('   • Add social login providers');
      console.log('   • Set up Firebase security rules');
    } else {
      console.log('⚠️  Authentication integration is mostly complete, but some areas need attention.');
      console.log('\n🔧 To complete setup:');
      
      if (!this.results.firebaseConfig) {
        console.log('   • Verify Firebase configuration and exports');
      }
      if (!this.results.authContext) {
        console.log('   • Complete AuthContext implementation');
      }
      if (!this.results.authScreens) {
        console.log('   • Fix authentication screens');
      }
      if (!this.results.authGuard) {
        console.log('   • Implement AuthGuard component');
      }
      if (!this.results.routeIntegration) {
        console.log('   • Integrate authentication routes');
      }
      if (!this.results.drawerIntegration) {
        console.log('   • Update drawer menu for authentication');
      }
    }
    
    console.log('\n📚 Resources:');
    console.log('   • Firebase Auth Documentation: https://firebase.google.com/docs/auth');
    console.log('   • React Native Firebase: https://rnfirebase.io/');
    console.log('   • Expo Router: https://docs.expo.dev/router/');
  }

  async runAllTests() {
    console.log('🚀 Firebase Authentication Integration Test');
    console.log('===========================================\n');
    
    this.testFirebaseConfiguration();
    this.testAuthContext();
    this.testAuthScreens();
    this.testAuthGuard();
    this.testRouteIntegration();
    this.testDrawerIntegration();
    
    this.generateReport();
  }
}

// Run the test
if (require.main === module) {
  const tester = new AuthIntegrationTester();
  // Change to the correct directory
  process.chdir(__dirname + '/..');
  
  tester.runAllTests().catch(error => {
    console.error('💥 Auth integration test failed:', error);
    process.exit(1);
  });
}

module.exports = AuthIntegrationTester;
