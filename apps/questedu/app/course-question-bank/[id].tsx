import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text, useTheme } from 'react-native-paper';
import AuthGuard from '../../components/AuthGuard';
import { LearningSlideViewer } from '../../components/learning';
import { getCourseQuestions, getCourseTopics } from '../../lib/course-learning-service';
import { LearningSlide, SlideType } from '../../types/learning';

export default function CourseQuestionBankScreen() {
  const { id, questionId } = useLocalSearchParams<{ id: string; questionId?: string }>();
  const router = useRouter();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slides, setSlides] = useState<LearningSlide[]>([]);
  const [initialIndex, setInitialIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    loadQuestions();
  }, [id]);

  const loadQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all topics for the course
      const topics = await getCourseTopics(id);

      const questions = await getCourseQuestions(id);
      
      // Build slides for all questions
      const questionSlides: LearningSlide[] = questions.map((question, idx) => ({
        id: `question-${question.id}`,
        type: SlideType.QUESTION,
        order: idx,
        question,
        topicTitle: topics.find(t => t.id === question.topicId)?.title || 'General' // Use topic title or 'General' if no topic
      }));
      
      setSlides(questionSlides);
      
      // Find initial index if questionId is provided
      if (questionId) {
        const targetIndex = questionSlides.findIndex(slide => {
          if (slide.type === SlideType.QUESTION && slide.question) {
            return slide.question.id === questionId;
          }
          return false;
        });
        if (targetIndex !== -1) {
          setInitialIndex(targetIndex);
        }
      }
    } catch (err) {
      setError('Failed to load question bank');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" animating={true} />
          <Text>Loading question bank...</Text>
        </View>
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard>
        <View style={styles.centerContainer}>
          <Text>{error}</Text>
        </View>
      </AuthGuard>
    );
  }

  if (slides.length === 0) {
    return (
      <AuthGuard>
        <View style={styles.centerContainer}>
          <Text>No questions available for this course.</Text>
          <Button
            mode="outlined"
            style={{ marginTop: 24 }}
            onPress={() => router.push({ pathname: '/course-questions-list/[id]', params: { id } })}
          >
            Back to Questions List
          </Button>
        </View>
      </AuthGuard>
    );
  }

  // For question bank, show all questions, answers, and explanations immediately
  return (
    <AuthGuard>
      <View style={styles.container}>
        <LearningSlideViewer
          slides={slides}
          currentIndex={initialIndex}
          session={{ completedSlides: slides.map(s => s.id), userAnswers: {}, currentSlideIndex: initialIndex, totalSlides: slides.length, courseId: id, userId: '', startedAt: new Date(), lastAccessed: new Date(), topicsProgress: {}, timeSpent: 0, completionPercentage: 100 }}
          onSlideChange={() => {}}
          onSlideComplete={() => {}}
          onExit={() => router.push({ pathname: '/course-questions-list/[id]', params: { id: String(id) } })}
          readOnly={true}
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
    padding: 24,
  },
});
