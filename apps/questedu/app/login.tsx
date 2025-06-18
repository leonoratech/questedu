import React from 'react';
import { SafeAreaView } from 'react-native';
import LoginScreen from '../components/auth/LoginScreen';

export default function Login() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LoginScreen />
    </SafeAreaView>
  );
}
