import React from 'react';
import { SafeAreaView } from 'react-native';
import AuthGuard from '../components/AuthGuard';
import ProfileEditScreen from '../components/auth/ProfileEditScreen';

export default function ProfileEdit() {
  return (
    <AuthGuard>
      <SafeAreaView style={{ flex: 1 }}>
        <ProfileEditScreen />
      </SafeAreaView>
    </AuthGuard>
  );
}
