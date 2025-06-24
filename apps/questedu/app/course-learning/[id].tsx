/**
 * Course Learning Screen for QuestEdu React Native App
 * Provides slide-based learning experience for course topics and questions
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, BackHandler, StyleSheet, View } from 'react-native';
import {
    ActivityIndicator,
    Button,
    Card,
    Text,
    useTheme
} from 'react-native-paper';
import AuthGuard from '../../components/AuthGuard';
import { LearningSlideViewer } from '../../components/learning/LearningSlideViewer';
import { getCourseLearningData, updateLearningProgress } from '../../lib/course-learning-service';
import { getCourseEnrollment } from '../../lib/enrollment-service';
import type { LearningData, ProgressUpdateData, SlideType } from '../../types/learning';

export default function CourseLearningScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  
  const [learningData, setLearningData] = useState<LearningData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    loadLearningData();
  }, [id]);

  // Handle back button press
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, []);

  const loadLearningData = async () => {
    if (!id) {
      setError('Course ID not provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check if user is enrolled
      const enrollment = await getCourseEnrollment(id);
      if (!enrollment) {
        setError('You are not enrolled in this course');
        setLoading(false);
        return;
      }

      // Load learning data
      const data = await getCourseLearningData(id);
      if (!data) {
        setError('Failed to load course content');
        setLoading(false);
        return;
      }

      if (data.slides.length === 0) {
        setError('No content available for this course');
        setLoading(false);
        return;
      }

      setLearningData(data);
      setCurrentSlideIndex(data.currentIndex);
      setLoading(false);

      console.log(`Loaded ${data.slides.length} slides for course: ${data.course.title}`);
    } catch (error) {
      console.error('Error loading learning data:', error);
      setError('Failed to load course content');
      setLoading(false);
    }
  };

  const handleBackPress = (): boolean => {
    Alert.alert(
      'Exit Course',
      'Are you sure you want to exit the course? Your progress will be saved.',
      [
        {
          text: 'Stay',
          style: 'cancel',
        },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
    return true; // Prevent default back behavior
  };

  const handleSlideChange = (index: number) => {
    setCurrentSlideIndex(index);
    console.log(`Navigated to slide ${index + 1} of ${learningData?.slides.length}`);
  };

  const handleSlideComplete = async (slideId: string, slideType: SlideType, data?: any) => {
    if (!learningData || !id) return;

    try {
      console.log(`Completing slide: ${slideId} (${slideType})`);

      const progressData: ProgressUpdateData = {
        slideId,
        slideType,
        timeSpent: data?.timeSpent,
        questionAnswer: data?.questionAnswer
      };

      const result = await updateLearningProgress(
        id,
        progressData,
        currentSlideIndex,
        learningData.slides.length
      );

      if (result.success) {
        // Update local session data
        const updatedSession = { ...learningData.session };
        
        // Add to completed slides if not already there
        if (!updatedSession.completedSlides.includes(slideId)) {
          updatedSession.completedSlides.push(slideId);
        }

        // Update user answers if it's a question
        if (data?.questionAnswer) {
          updatedSession.userAnswers[data.questionAnswer.questionId] = {
            questionId: data.questionAnswer.questionId,
            selectedAnswer: data.questionAnswer.selectedAnswer,
            isCorrect: data.questionAnswer.isCorrect,
            timestamp: new Date(),
            timeTaken: data.questionAnswer.timeTaken
          };
        }

        // Update time spent
        if (data?.timeSpent) {
          updatedSession.timeSpent += data.timeSpent;
        }

        // Update completion percentage
        updatedSession.completionPercentage = 
          (updatedSession.completedSlides.length / learningData.slides.length) * 100;

        setLearningData({
          ...learningData,
          session: updatedSession
        });

        console.log(`Slide completed successfully. Progress: ${updatedSession.completionPercentage.toFixed(1)}%`);
      } else {
        console.error('Failed to update progress:', result.error);
      }
    } catch (error) {
      console.error('Error completing slide:', error);
    }
  };

  const handleExit = () => {
    handleBackPress();
  };

  const renderLoading = () => (
    <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator size="large" animating={true} />
      <Text style={styles.loadingText}>Loading course content...</Text>
    </View>
  );

  const renderError = () => (
    <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.errorCard}>
        <Card.Content style={styles.errorContent}>
          <Text variant="headlineSmall" style={styles.errorTitle}>
            Unable to Load Course
          </Text>
          <Text variant="bodyMedium" style={styles.errorMessage}>
            {error}
          </Text>
          <View style={styles.errorActions}>
            <Button mode="outlined" onPress={() => router.back()} style={styles.errorButton}>
              Go Back
            </Button>
            <Button mode="contained" onPress={loadLearningData} style={styles.errorButton}>
              Try Again
            </Button>
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  if (loading) {
    return (
      <AuthGuard>
        {renderLoading()}
      </AuthGuard>
    );
  }

  if (error || !learningData) {
    return (
      <AuthGuard>
        {renderError()}
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LearningSlideViewer
          slides={learningData.slides}
          currentIndex={currentSlideIndex}
          session={learningData.session}
          onSlideChange={handleSlideChange}
          onSlideComplete={handleSlideComplete}
          onExit={handleExit}
        />
      </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  errorCard: {
    maxWidth: 400,
    width: '100%',
  },
  errorContent: {
    alignItems: 'center',
  },
  errorTitle: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  errorMessage: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
  },
  errorButton: {
    flex: 1,
  },
});