import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Card, Snackbar, Text, TextInput } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';

const SignupScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const { signUp } = useAuth();
  const router = useRouter();

  const showMessage = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      showMessage('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      showMessage('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      showMessage('Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      showMessage('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 6) {
      showMessage('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      showMessage('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error } = await signUp(
        formData.email.trim(),
        formData.password,
        formData.firstName.trim(),
        formData.lastName.trim()
      );
      
      if (error) {
        showMessage(error);
      } else {
        showMessage('Account created successfully! Welcome to QuestEdu!');
        // Navigate to home page after successful signup
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

  const handleSignIn = () => {
    router.push('/login');
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Create Your Account" subtitle="Join QuestEdu as a student" />
        <Card.Content>
          <TextInput
            label="First Name"
            value={formData.firstName}
            onChangeText={(text) => handleInputChange('firstName', text)}
            autoComplete="given-name"
            style={styles.input}
            disabled={loading}
          />

          <TextInput
            label="Last Name"
            value={formData.lastName}
            onChangeText={(text) => handleInputChange('lastName', text)}
            autoComplete="family-name"
            style={styles.input}
            disabled={loading}
          />

          <TextInput
            label="Email"
            value={formData.email}
            onChangeText={(text) => handleInputChange('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            style={styles.input}
            disabled={loading}
          />
          
          <TextInput
            label="Password"
            value={formData.password}
            onChangeText={(text) => handleInputChange('password', text)}
            secureTextEntry={!showPassword}
            autoComplete="new-password"
            style={styles.input}
            disabled={loading}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />

          <TextInput
            label="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(text) => handleInputChange('confirmPassword', text)}
            secureTextEntry={!showConfirmPassword}
            autoComplete="new-password"
            style={styles.input}
            disabled={loading}
            right={
              <TextInput.Icon
                icon={showConfirmPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            }
          />

          <Text style={styles.roleNote}>
            📚 You'll be registered as a student with access to all courses and learning materials.
          </Text>

          <Button
            mode="contained"
            onPress={handleSignUp}
            loading={loading}
            disabled={loading}
            style={styles.signUpButton}
          >
            Create Account
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.signinCard}>
        <Card.Content>
          <Text style={styles.signinText}>Already have an account?</Text>
          <Button
            mode="outlined"
            onPress={handleSignIn}
            disabled={loading}
            style={styles.signInButton}
          >
            Sign In
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
  },
  roleNote: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
  },
  signUpButton: {
    marginTop: 8,
    marginBottom: 8,
  },
  signinCard: {
    margin: 16,
    marginTop: 8,
  },
  signinText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  signInButton: {
    marginTop: 8,
  },
});

export default SignupScreen;
