import React from 'react';
import { SafeAreaView } from 'react-native';
import ForgotPasswordScreen from '../components/auth/ForgotPasswordScreen';

export default function ForgotPassword() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ForgotPasswordScreen />
    </SafeAreaView>
  );
}
