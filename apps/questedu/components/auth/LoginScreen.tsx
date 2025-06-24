import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Snackbar, Text, TextInput } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const { signIn } = useAuth();
  const router = useRouter();

  const showMessage = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      showMessage('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(email.trim(), password);
      
      if (error) {
        showMessage(error);
      } else {
        showMessage('Sign in successful! Welcome back!');
        // Navigate to home page after successful login
        setTimeout(() => {
          router.replace('/');
        }, 1000);
      }
    } catch (error) {
      showMessage('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  const handleSignUp = () => {
    router.push('/signup');
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Welcome to QuestEdu" subtitle="Sign in to your account" />
        <Card.Content>
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
          
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoComplete="password"
            style={styles.input}
            disabled={loading}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />

          <Button
            mode="contained"
            onPress={handleSignIn}
            loading={loading}
            disabled={loading}
            style={styles.signInButton}
          >
            Sign In
          </Button>

          <Button
            mode="text"
            onPress={handleForgotPassword}
            disabled={loading}
            style={styles.forgotButton}
          >
            Forgot Password?
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.signupCard}>
        <Card.Content>
          <Text style={styles.signupText}>Don't have an account?</Text>
          <Button
            mode="outlined"
            onPress={handleSignUp}
            disabled={loading}
            style={styles.signUpButton}
          >
            Create Account
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
  input: {
    marginBottom: 16,
  },
  signInButton: {
    marginTop: 8,
    marginBottom: 8,
  },
  forgotButton: {
    marginTop: 8,
  },
  signupCard: {
    marginTop: 16,
  },
  signupText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  signUpButton: {
    marginTop: 8,
  },
});

export default LoginScreen;
