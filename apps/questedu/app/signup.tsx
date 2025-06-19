import React from 'react';
import { SafeAreaView } from 'react-native';
import SignupScreen from '../components/auth/SignupScreen';

export default function Signup() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SignupScreen />
    </SafeAreaView>
  );
}
