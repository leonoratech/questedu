/**
 * Learning Slide Viewer Component
 * Provides swipe-based navigation through course topics and questions
 */

import React, { useCallback, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';
import {
    Button,
    Card,
    IconButton,
    ProgressBar,
    Surface,
    Text,
    useTheme
} from 'react-native-paper';
import { LearningSession, LearningSlide, SlideType } from '../../types/learning';

const { width: screenWidth } = Dimensions.get('window');

interface LearningSlideViewerProps {
  slides: LearningSlide[];
  currentIndex: number;
  session: LearningSession;
  onSlideChange: (index: number) => void;
  onSlideComplete: (slideId: string, slideType: SlideType, data?: any) => void;
  onExit: () => void;
}

export const LearningSlideViewer: React.FC<LearningSlideViewerProps> = ({
  slides,
  currentIndex,
  session,
  onSlideChange,
  onSlideComplete,
  onExit
}) => {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(currentIndex);

  // Update activeIndex when currentIndex changes externally
  React.useEffect(() => {
    setActiveIndex(currentIndex);
  }, [currentIndex]);

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < slides.length) {
      setActiveIndex(index);
      onSlideChange(index);
    }
  }, [slides.length, onSlideChange]);

  const goNext = useCallback(() => {
    if (activeIndex < slides.length - 1) {
      goToSlide(activeIndex + 1);
    }
  }, [activeIndex, slides.length, goToSlide]);

  const goPrevious = useCallback(() => {
    if (activeIndex > 0) {
      goToSlide(activeIndex - 1);
    }
  }, [activeIndex, goToSlide]);

  const handleSlideComplete = useCallback((slideId: string, slideType: SlideType, data?: any) => {
    onSlideComplete(slideId, slideType, data);
    // Auto-advance to next slide after completion
    setTimeout(() => {
      goNext();
    }, 1000);
  }, [onSlideComplete, goNext]);

  const progress = slides.length > 0 ? (activeIndex + 1) / slides.length : 0;
  const completedSlides = session.completedSlides.length;
  const currentSlide = slides[activeIndex];

  const renderSlideContent = (slide: LearningSlide) => {
    const isCompleted = session.completedSlides.includes(slide.id);
    
    if (slide.type === SlideType.TOPIC) {
      const { topic } = slide;
      return (
        <ScrollView style={styles.slideContent} showsVerticalScrollIndicator={false}>
          <Card style={styles.contentCard}>
            <Card.Content>
              <Text variant="headlineSmall" style={styles.slideTitle}>
                {topic.title}
              </Text>
              
              {topic.description && (
                <Text variant="bodyMedium" style={styles.slideDescription}>
                  {topic.description}
                </Text>
              )}
              
              {topic.learningObjectives.length > 0 && (
                <View style={styles.objectivesSection}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Learning Objectives:
                  </Text>
                  {topic.learningObjectives.map((objective, index) => (
                    <Text key={index} variant="bodyMedium" style={styles.objective}>
                      • {objective}
                    </Text>
                  ))}
                </View>
              )}
              
              {topic.summary && (
                <View style={styles.summarySection}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Summary:
                  </Text>
                  <Text variant="bodyMedium" style={styles.summary}>
                    {topic.summary}
                  </Text>
                </View>
              )}
              
              <View style={styles.completeSection}>
                <Button
                  mode="contained"
                  onPress={() => handleSlideComplete(slide.id, SlideType.TOPIC)}
                  disabled={isCompleted}
                  icon={isCompleted ? "check" : "arrow-right"}
                >
                  {isCompleted ? "Completed" : "Mark as Complete"}
                </Button>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      );
    } else {
      const { question } = slide;
      return (
        <ScrollView style={styles.slideContent} showsVerticalScrollIndicator={false}>
          <Card style={styles.contentCard}>
            <Card.Content>
              <Text variant="titleSmall" style={styles.questionType}>
                Question • {question.difficulty} • {question.marks} points
              </Text>
              
              <Text variant="headlineSmall" style={styles.slideTitle}>
                {question.question}
              </Text>
              
              {question.options && question.options.length > 0 && (
                <View style={styles.optionsSection}>
                  {question.options.map((option, index) => (
                    <Card key={index} style={styles.optionCard}>
                      <Card.Content>
                        <Text variant="bodyMedium">{option}</Text>
                      </Card.Content>
                    </Card>
                  ))}
                </View>
              )}
              
              <View style={styles.completeSection}>
                <Button
                  mode="contained"
                  onPress={() => handleSlideComplete(slide.id, SlideType.QUESTION, {
                    questionAnswer: {
                      questionId: question.id!,
                      selectedAnswer: question.options?.[0] || '',
                      isCorrect: true,
                      timeTaken: 30
                    }
                  })}
                  disabled={isCompleted}
                  icon={isCompleted ? "check" : "arrow-right"}
                >
                  {isCompleted ? "Answered" : "Submit Answer"}
                </Button>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header with progress */}
      <Surface style={styles.header} elevation={2}>
        <View style={styles.headerContent}>
          <IconButton icon="arrow-left" size={24} onPress={onExit} />
          <View style={styles.progressContainer}>
            <Text variant="bodySmall" style={styles.progressText}>
              {activeIndex + 1} of {slides.length}
            </Text>
            <ProgressBar 
              progress={progress} 
              style={styles.progressBar}
              color={theme.colors.primary}
            />
            <Text variant="bodySmall" style={styles.completedText}>
              {completedSlides} completed
            </Text>
          </View>
          <IconButton icon="dots-vertical" size={24} onPress={() => {}} />
        </View>
      </Surface>

      {/* Current slide content */}
      <View style={styles.slideContainer}>
        {currentSlide && renderSlideContent(currentSlide)}
      </View>

      {/* Navigation controls */}
      <Surface style={styles.footer} elevation={2}>
        <View style={styles.navigationControls}>
          <IconButton
            icon="chevron-left"
            size={32}
            disabled={activeIndex === 0}
            onPress={goPrevious}
            style={[
              styles.navButton,
              { backgroundColor: activeIndex === 0 ? theme.colors.surfaceDisabled : theme.colors.primary }
            ]}
            iconColor={activeIndex === 0 ? theme.colors.onSurfaceDisabled : theme.colors.onPrimary}
          />
          
          <View style={styles.slideIndicator}>
            <Text variant="bodyMedium" style={styles.slideNumber}>
              {activeIndex + 1}
            </Text>
          </View>
          
          <IconButton
            icon="chevron-right"
            size={32}
            disabled={activeIndex === slides.length - 1}
            onPress={goNext}
            style={[
              styles.navButton,
              { backgroundColor: activeIndex === slides.length - 1 ? theme.colors.surfaceDisabled : theme.colors.primary }
            ]}
            iconColor={activeIndex === slides.length - 1 ? theme.colors.onSurfaceDisabled : theme.colors.onPrimary}
          />
        </View>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 40, // Status bar height
    paddingBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  progressText: {
    textAlign: 'center',
    marginBottom: 4,
    opacity: 0.7,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  completedText: {
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.7,
  },
  slideContainer: {
    flex: 1,
  },
  slideContent: {
    flex: 1,
    padding: 16,
  },
  contentCard: {
    flex: 1,
  },
  slideTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    lineHeight: 28,
  },
  slideDescription: {
    lineHeight: 24,
    marginBottom: 16,
  },
  questionType: {
    opacity: 0.7,
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  objectivesSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  objective: {
    marginBottom: 4,
    paddingLeft: 8,
  },
  summarySection: {
    marginBottom: 16,
  },
  summary: {
    lineHeight: 24,
  },
  optionsSection: {
    marginBottom: 16,
  },
  optionCard: {
    marginBottom: 8,
  },
  completeSection: {
    alignItems: 'center',
    marginTop: 24,
  },
  footer: {
    paddingVertical: 16,
    paddingBottom: 32, // Safe area bottom
  },
  navigationControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  navButton: {
    borderRadius: 25,
  },
  slideIndicator: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  slideNumber: {
    fontWeight: 'bold',
  },
});
