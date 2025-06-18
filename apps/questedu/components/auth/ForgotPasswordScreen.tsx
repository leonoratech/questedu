import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Snackbar, Text, TextInput } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';

const ForgotPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const { sendPasswordReset } = useAuth();
  const router = useRouter();

  const showMessage = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      showMessage('Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      showMessage('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const { error } = await sendPasswordReset(email.trim());
      
      if (error) {
        showMessage(error);
      } else {
        setEmailSent(true);
        showMessage('Password reset email sent! Check your inbox.');
      }
    } catch (error) {
      showMessage('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  if (emailSent) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Title title="Check Your Email" subtitle="Password reset instructions sent" />
          <Card.Content>
            <Text style={styles.successText}>
              We've sent password reset instructions to:
            </Text>
            <Text style={styles.emailText}>{email}</Text>
            <Text style={styles.instructionText}>
              Please check your email and follow the instructions to reset your password.
              If you don't see the email, check your spam folder.
            </Text>

            <Button
              mode="contained"
              onPress={handleBackToLogin}
              style={styles.backButton}
            >
              Back to Sign In
            </Button>

            <Button
              mode="text"
              onPress={() => setEmailSent(false)}
              style={styles.resendButton}
            >
              Try Different Email
            </Button>
          </Card.Content>
        </Card>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={4000}
        >
          {snackbarMessage}
        </Snackbar>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Reset Password" subtitle="Enter your email to reset your password" />
        <Card.Content>
          <Text style={styles.instructionText}>
            Enter the email address associated with your account and we'll send you instructions to reset your password.
          </Text>

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            style={styles.input}
            disabled={loading}
          />

          <Button
            mode="contained"
            onPress={handleResetPassword}
            loading={loading}
            disabled={loading}
            style={styles.resetButton}
          >
            Send Reset Email
          </Button>

          <Button
            mode="text"
            onPress={handleBackToLogin}
            disabled={loading}
            style={styles.backButton}
          >
            Back to Sign In
          </Button>
        </Card.Content>
      </Card>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  successText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  emailText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#2196F3',
  },
  input: {
    marginBottom: 16,
  },
  resetButton: {
    marginTop: 8,
    marginBottom: 8,
  },
  backButton: {
    marginTop: 8,
  },
  resendButton: {
    marginTop: 8,
  },
});

export default ForgotPasswordScreen;
