import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text, useTheme } from 'react-native-paper';
import AuthGuard from '../../components/AuthGuard';
import { LearningSlideViewer } from '../../components/learning';
import { getCourseTopics, getTopicQuestions } from '../../lib/course-learning-service';
import { CourseQuestion, LearningSlide, SlideType } from '../../types/learning';

export default function CourseQuestionBankScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slides, setSlides] = useState<LearningSlide[]>([]);

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
      let allQuestions: (CourseQuestion & { topicTitle: string })[] = [];
      for (const topic of topics) {
        const questions = await getTopicQuestions(id, topic.id!);
        allQuestions = allQuestions.concat(questions.map(q => ({ ...q, topicTitle: topic.title })));
      }
      // Fetch questions with no topic association
      const dbQuestions = await getTopicQuestions(id, null as any); // getTopicQuestions expects topicId, so pass null
      const ungroupedQuestions = dbQuestions.filter(q => !q.topicId || q.topicId === null).map(q => ({ ...q, topicTitle: 'General' }));
      allQuestions = allQuestions.concat(ungroupedQuestions);
      // Build slides for all questions
      const questionSlides: LearningSlide[] = allQuestions.map((question, idx) => ({
        id: `question-${question.id}`,
        type: SlideType.QUESTION,
        order: idx,
        question,
        topicTitle: question.topicTitle
      }));
      setSlides(questionSlides);
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
            onPress={() => router.push({ pathname: '/course-details/[id]', params: { id } })}
          >
            Back to Course
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
          currentIndex={0}
          session={{ completedSlides: slides.map(s => s.id), userAnswers: {}, currentSlideIndex: 0, totalSlides: slides.length, courseId: id, userId: '', startedAt: new Date(), lastAccessed: new Date(), topicsProgress: {}, timeSpent: 0, completionPercentage: 100 }}
          onSlideChange={() => {}}
          onSlideComplete={() => {}}
          onExit={() => router.back()}
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
