import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
    Button,
    Card,
    Text,
    useTheme
} from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';

const ProfileCompletionPrompt: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { userProfile } = useAuth();

  const handleCompleteProfile = () => {
    router.push('/profile-edit' as any);
  };

  const handleSkip = () => {
    router.replace('/');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Text variant="headlineMedium" style={styles.title}>
            Complete Your Profile
          </Text>
          
          <Text variant="bodyLarge" style={styles.subtitle}>
            Help us personalize your learning experience
          </Text>
          
          <Text variant="bodyMedium" style={styles.description}>
            Adding information about your academic background and interests will help us:
          </Text>
          
          <View style={styles.benefitsList}>
            <Text variant="bodyMedium" style={styles.benefit}>• Recommend relevant courses</Text>
            <Text variant="bodyMedium" style={styles.benefit}>• Connect you with like-minded students</Text>
            <Text variant="bodyMedium" style={styles.benefit}>• Personalize your dashboard</Text>
            <Text variant="bodyMedium" style={styles.benefit}>• Track your academic progress</Text>
          </View>
          
          <View style={styles.buttonContainer}>
            <Button 
              mode="contained" 
              onPress={handleCompleteProfile}
              style={styles.completeButton}
            >
              Complete Profile
            </Button>
            
            <Button 
              mode="text" 
              onPress={handleSkip}
              style={styles.skipButton}
            >
              Skip for now
            </Button>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    elevation: 4,
  },
  cardContent: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
  description: {
    textAlign: 'center',
    marginBottom: 16,
  },
  benefitsList: {
    alignSelf: 'stretch',
    marginBottom: 24,
  },
  benefit: {
    marginBottom: 8,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  completeButton: {
    marginBottom: 8,
  },
  skipButton: {
    marginBottom: 4,
  },
});

export default ProfileCompletionPrompt;
