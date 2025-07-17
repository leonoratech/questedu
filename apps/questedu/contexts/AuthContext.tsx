import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getFirebaseAuth, getFirestoreDb } from '../lib/firebase-config';

// User roles - aligned with admin app
export enum UserRole {
  ADMIN = 'admin',
  INSTRUCTOR = 'instructor',
  STUDENT = 'student'
}

export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
  bio?: string;
  profilePicture?: string;
  
  // Additional fields for student profile completion
  department?: string;
  collegeId?: string;
  programId?: string;
  college?: string; // For backward compatibility
  description?: string;
  mainSubjects?: string[];
  class?: string;
  profileCompleted?: boolean;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  
  // Auth methods
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  sendPasswordReset: (email: string) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: UpdateProfileData) => Promise<{ error: string | null }>;
  
  // Authorization helpers
  hasRole: (role: UserRole) => boolean;
}

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  bio?: string;
  department?: string;
  collegeId?: string;
  programId?: string;
  college?: string;
  description?: string;
  mainSubjects?: string[];
  class?: string;
  profileCompleted?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Get Firebase instances
  const auth = getFirebaseAuth();
  const db = getFirestoreDb();

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Load user profile from Firestore
        await loadUserProfile(user.uid);
        
        // Update last login time
        await updateLastLogin(user.uid);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loadUserProfile = async (uid: string) => {
    try {
      const userDoc = doc(db, 'users', uid);
      const userSnap = await getDoc(userDoc);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setUserProfile({
          uid,
          ...userData,
          createdAt: userData.createdAt?.toDate(),
          updatedAt: userData.updatedAt?.toDate(),
          lastLoginAt: userData.lastLoginAt?.toDate(),
        } as UserProfile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const updateLastLogin = async (uid: string) => {
    try {
      const userDoc = doc(db, 'users', uid);
      await setDoc(userDoc, {
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string
  ): Promise<{ error: string | null }> => {
    try {
      setLoading(true);
      
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const displayName = `${firstName} ${lastName}`;
      
      // Update the user's display name
      await updateFirebaseProfile(user, { displayName });

      // Send email verification
      await sendEmailVerification(user);

      // Create user profile in Firestore - force STUDENT role for mobile app
      const userProfile: Omit<UserProfile, 'uid'> = {
        email: user.email!,
        firstName,
        lastName,
        displayName,
        role: UserRole.STUDENT, // Always student for mobile app registration
        isActive: true,
        isEmailVerified: user.emailVerified,
        createdAt: new Date(),
        updatedAt: new Date(),
        profileCompleted: false, // Set to false to prompt profile completion
      };

      await setDoc(doc(db, 'users', user.uid), {
        ...userProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      });

      return { error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      let errorMessage = 'An error occurred during sign up';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email address is already in use';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      }
      
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      let errorMessage = 'An error occurred during sign in';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No user found with this email address';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later';
      }
      
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async (): Promise<{ error: string | null }> => {
    try {
      setLoading(true);
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      return { error: null };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { error: 'An error occurred during sign out' };
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async (email: string): Promise<{ error: string | null }> => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      let errorMessage = 'An error occurred sending password reset email';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No user found with this email address';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      }
      
      return { error: errorMessage };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.uid);
    }
  };

  const updateProfile = async (updates: UpdateProfileData): Promise<{ error: string | null }> => {
    if (!user) {
      return { error: 'User not authenticated' };
    }

    try {
      setLoading(true);
      
      const userDoc = doc(db, 'users', user.uid);
      const updateData: any = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      // Update display name if firstName or lastName changed
      if (updates.firstName || updates.lastName) {
        const currentFirstName = updates.firstName || userProfile?.firstName || '';
        const currentLastName = updates.lastName || userProfile?.lastName || '';
        updateData.displayName = `${currentFirstName} ${currentLastName}`.trim();
      }

      await setDoc(userDoc, updateData, { merge: true });
      
      // Refresh the profile to get updated data
      await loadUserProfile(user.uid);
      
      return { error: null };
    } catch (error: any) {
      console.error('Error updating profile:', error);
      return { error: error.message || 'Failed to update profile' };
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: UserRole): boolean => {  
    if (!userProfile) return false;
    // Admin can access everything
    if (userProfile.role === UserRole.ADMIN) return true;
    return userProfile.role === role;
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut: handleSignOut,
    sendPasswordReset,
    refreshProfile,
    updateProfile,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};